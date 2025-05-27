import Fastify from "fastify";
import cors from "@fastify/cors";
import { simpleGit } from "simple-git";
import path from "path";
import { pushMessageToSQS, RequestBody, uploadDirectoryToS3 } from "./utils.ts";
import { GITHUB_URL, __dirname } from "./constants.ts";
import { rm } from "fs/promises";

const { cryptoRandomStringAsync } = await import("crypto-random-string");

const app = Fastify();

app.register(cors, {
  /* ##### Change to a proper url when deploying ##### */
  origin: "*",
  methods: ["POST"],
});

app.post("/upload", async (request, reply) => {
  const parsedResult = RequestBody.safeParse(request.body);

  if (!parsedResult.success) {
    return reply.status(400).send({
      error: "Invalid Request body",
    });
  }

  const repositoryUrl = parsedResult.data.repositoryUrl;

  if (repositoryUrl.substring(0, 18) !== GITHUB_URL) {
    return reply
      .status(400)
      .send({ error: "Provided URL is not a Github URL" });
  }

  const id = await cryptoRandomStringAsync({ length: 10, type: "url-safe" });
  const repoPath = path.join(__dirname, `repo/${id}`);

  // Clones the repo locally
  await simpleGit().clone(repositoryUrl, repoPath);

  // Upload the files to S3 bucket
  await uploadDirectoryToS3(id, repoPath);

  // Push Message to SQS
  await pushMessageToSQS(id);

  // Deletes the local repo
  await rm(repoPath, { recursive: true, force: true });

  reply.code(200).send({ id });
});

app.setErrorHandler((error, request, reply) => {
  request.log.error(error);
  reply.status(500).send({
    error: "Internal server error",
  });
});

app.listen({ port: 3000 });
