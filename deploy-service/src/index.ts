import Fastify from "fastify";
import { sqs } from "./aws.ts";
import {
  DeleteMessageCommand,
  ReceiveMessageCommand,
} from "@aws-sdk/client-sqs";
import { AWS_SQS_QUEUE_URL } from "./env.ts";
import { buildRepo, fetchFilesFromS3, uploadBuiltFolderToS3 } from "./utils.ts";
import { rm } from "fs/promises";
import path from "path";
import { __dirname } from "./constants.ts";

const app = Fastify();

async function pollSQSForMessages() {
  while (true) {
    try {
      const sqsResponse = await sqs.send(
        new ReceiveMessageCommand({
          QueueUrl: AWS_SQS_QUEUE_URL,
          MaxNumberOfMessages: 1,
          WaitTimeSeconds: 10,
        })
      );

      const messages = sqsResponse.Messages;

      if (!messages || messages.length === 0) continue;

      const message = messages[0];

      const { id } = JSON.parse(message.Body as string);

      await fetchFilesFromS3(id);
      await buildRepo(id);
      await uploadBuiltFolderToS3(id);

      await rm(path.join(__dirname, `repo/${id}`), {
        recursive: true,
        force: true,
      });

      await sqs.send(
        new DeleteMessageCommand({
          QueueUrl: AWS_SQS_QUEUE_URL,
          ReceiptHandle: message.ReceiptHandle!,
        })
      );
    } catch (err) {
      console.error("Error polling SQS:", err);
      await new Promise((res) => setTimeout(res, 5000));
    }
  }
}

app.listen({ port: 4000 }, () => pollSQSForMessages());
