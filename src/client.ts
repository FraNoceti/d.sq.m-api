import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";

// add prisma to the NodeJS global type
interface CustomNodeJsGlobal extends Global {
  prisma: PrismaClient;
  resend: Resend;
}

// Prevent multiple instances of Prisma Client in development
declare const global: CustomNodeJsGlobal;

const prisma = global.prisma || new PrismaClient();
const resend = global.resend || new Resend(process.env.RESEND_API_KEY);

const client = { prisma, resend };

if (process.env.NODE_ENV === "development") global.prisma = prisma;

export default client;
