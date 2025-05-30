import { authOptions } from "@/lib/auth";
import { sqs } from "@/lib/aws";
import { deployRequestBody } from "@/lib/zod";
import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const body = await request.json();

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = deployRequestBody.safeParse(body);

  if (error) {
    return NextResponse.json(
      { error: "Invalid Request Body" },
      { status: 400 }
    );
  }

  sqs.send(
    new SendMessageCommand({
      QueueUrl: process.env.AWS_SQS_QUEUE_URL,
      MessageGroupId: session.user.id,
      MessageDeduplicationId: randomUUID(),
      MessageBody: JSON.stringify(data),
    })
  );

  return NextResponse.json({});
}
