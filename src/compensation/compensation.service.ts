import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { CompareCompensationDto } from './dto/compare-compensation.dto';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

@Injectable()
export class CompensationService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const connectionString = 'postgres://postgres:postgres@localhost:51214/template1?sslmode=disable';
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async getPercentiles(query: CompareCompensationDto) {
    const conditions: Prisma.Sql[] = [];

    if (query.companyId) {
      conditions.push(Prisma.sql`"companyId" = ${query.companyId}`);
    }
    if (query.levelId) {
      conditions.push(Prisma.sql`"levelId" = ${query.levelId}`);
    }
    if (query.jobTitle) {
      conditions.push(Prisma.sql`"jobTitle" = ${query.jobTitle}`);
    }
    if (query.location) {
      conditions.push(Prisma.sql`"location" = ${query.location}`);
    }

    const whereClause = conditions.length > 0 
      ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
      : Prisma.empty;

    const result = await this.$queryRaw<any[]>`
      SELECT 
        percentile_cont(0.25) WITHIN GROUP (ORDER BY "baseSalary" + COALESCE("bonus", 0) + COALESCE("stock", 0)) AS "p25",
        percentile_cont(0.50) WITHIN GROUP (ORDER BY "baseSalary" + COALESCE("bonus", 0) + COALESCE("stock", 0)) AS "p50",
        percentile_cont(0.90) WITHIN GROUP (ORDER BY "baseSalary" + COALESCE("bonus", 0) + COALESCE("stock", 0)) AS "p90"
      FROM compensation_records
      ${whereClause}
    `;

    // Extract the first row
    const row = result[0] || { p25: 0, p50: 0, p90: 0 };

    return {
      percentiles: {
        p25: Number(row.p25 || 0),
        p50: Number(row.p50 || 0),
        p90: Number(row.p90 || 0),
      },
      filters: query
    };
  }
}
