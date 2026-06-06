import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.$connect();
  const res = await prisma.$queryRaw`SELECT 
        percentile_cont(0.25) WITHIN GROUP (ORDER BY "baseSalary" + COALESCE("bonus", 0) + COALESCE("stock", 0)) AS "p25",
        percentile_cont(0.50) WITHIN GROUP (ORDER BY "baseSalary" + COALESCE("bonus", 0) + COALESCE("stock", 0)) AS "p50",
        percentile_cont(0.90) WITHIN GROUP (ORDER BY "baseSalary" + COALESCE("bonus", 0) + COALESCE("stock", 0)) AS "p90"
      FROM compensation_records`;
  console.log(res);
  await prisma.$disconnect();
}
main();
