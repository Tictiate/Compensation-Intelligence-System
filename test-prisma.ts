import { PrismaClient } from '@prisma/client';
const client = new PrismaClient({ url: process.env.DATABASE_URL } as any);
console.log("Success!");
