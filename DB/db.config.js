import { PrismaClient } from "@prisma/client";

const prismaclient = new PrismaClient({
  log: ["query", "error"],
});

export default prismaclient;
