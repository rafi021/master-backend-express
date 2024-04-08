import { Queue, Worker } from "bullmq";
import { defaultJobConfig, redisConnection } from "../config/queue.js";
import logger from "../config/logger.js";

export const emailQueueName = "email-queue";

export const emailQueue = new Queue(emailQueueName, {
  connection: redisConnection,
  defaultJobOptions: defaultJobConfig,
});

/* Workers */
export const handler = new Worker(
  emailQueueName,
  async (job) => {
    console.log("the email worker data is", job.data);
  },
  { connection: redisConnection }
);

/* Worker Listeners */
handler.on("completed", (job) => {
  logger.info({ job: job, message: "Job completed" });
  console.log(`the job ${job.id} is completed`);
});

handler.on("failed", (job) => {
  logger.info({ job: job, message: "Job failed" });
  console.log(`the job ${job.id} is failed`);
});
