import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // 1. Establish the native connection pool using the live system variable
    const pool = new Pool({ 
      connectionString: process.env.DATABASE_URL 
    });

    // 2. Instantiate the strict Prisma 7 Driver Adapter
    const adapter = new PrismaPg(pool);

    // 3. Pass the driver initialization parameters directly to the underlying engine
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}