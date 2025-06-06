import { authOptions } from "@/lib/auth";
import { s3, sqs } from "@/lib/aws";
import { deployRequestBody } from "@/lib/zod";
import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { redis } from "@/lib/redis";
import { parseGitHubUrl } from "@/lib/utils";
import { PassThrough } from "stream";
import { Upload } from "@aws-sdk/lib-storage";
import fetch from "node-fetch";
import { getToken } from "next-auth/jwt";
import { createNewProject } from "@/app/actions";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = await getToken({ req: request });

  const body = await request.json();
  const { data, error } = deployRequestBody.safeParse(body);

  if (error) {
    return NextResponse.json(
      { error: "Invalid Request Body" },
      { status: 400 }
    );
  }

  const buildId = randomUUID();

  const { repoUrl, defaultBranch, projectName } = data;
  const { owner, repo } = parseGitHubUrl(repoUrl);

  const zipUrl = `https://github.com/${owner}/${repo}/archive/refs/heads/${defaultBranch}.zip`;
  const fileKey = `archives/${owner}/${repo}-${buildId}.zip`;

  try {
    const response = await fetch(zipUrl, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "ZeroDeploy/1.0",
      },
    });

    if (!response.ok || !response.body) {
      throw new Error("Failed to download repo archive");
    }

    await redis.set(`buildStatus:${buildId}`, "Queued");

    await createNewProject(
      token?.savedId as string,
      projectName,
      `https://github.com/${owner}/${repo}`
    );

    const passThrough = new PassThrough();
    response.body.pipe(passThrough);

    const upload = new Upload({
      client: s3,
      params: {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: fileKey,
        Body: passThrough,
        ContentType: "application/zip",
      },
    });

    await upload.done();

    await sqs.send(
      new SendMessageCommand({
        QueueUrl: process.env.AWS_SQS_QUEUE_URL,
        MessageGroupId: session.user.id,
        MessageDeduplicationId: randomUUID(),
        MessageBody: JSON.stringify({
          owner,
          repo,
          fileKey,
          defaultBranch,
          buildId,
          installCommand: data.installCommand,
          buildCommand: data.buildCommand,
          outputDirectory: data.outputDirectory,
          rootDirectory: data.rootDirectory,
          projectName: data.projectName,
        }),
      })
    );

    return NextResponse.json({ buildId });
    /* eslint-disable @typescript-eslint/no-unused-vars */
  } catch (error) {
    await redis.set(`buildStatus:${buildId}`, "Failed to Deploy");
    return NextResponse.json({ error: "Failed to deploy" }, { status: 500 });
  }
}
