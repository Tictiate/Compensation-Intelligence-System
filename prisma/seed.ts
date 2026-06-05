import { PrismaClient } from '@prisma/client';
import { IngestionService } from '../src/ingestion/ingestion.service';
import { CompensationService } from '../src/compensation/compensation.service';

import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = 'postgres://postgres:postgres@localhost:51214/template1?sslmode=disable';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const ingestionService = new IngestionService();
const compensationService = new CompensationService();

const messyNames = [
  'Google Inc', 'google', 'Google  LLC', 'Google (YouTube)', 'Google.',
  'Meta (Facebook)', 'META PLATFORMS INC.', 'meta', 'Meta Platforms, Inc',
  'Amazon (AWS)', 'amazon.com inc', 'AMAZON', 'Amazon, Inc.',
  'AT&T', 'AT and T', 'at&t inc',
  'Ernst & Young', 'Ernst and Young', 'Ernst & Young LLP'
];

async function main() {
  await prisma.$connect();
  
  // Clear tables safely
  await prisma.compensationRecord.deleteMany();
  await prisma.companyLevel.deleteMany();
  await prisma.standardLevel.deleteMany();
  await prisma.company.deleteMany();

  // Create Standard Level
  const sLevel3 = await prisma.standardLevel.create({ data: { name: 'Mid-Level', code: 'L3', rank: 3 } });
  
  let insertedCount = 0;

  for (let i = 0; i < 100; i++) {
    const rawName = messyNames[i % messyNames.length];
    
    // Normalize using our engine!
    const processed = await ingestionService.processSalaryRecord({
      companyName: rawName,
      levelName: 'L3',
      jobTitle: i % 2 === 0 ? 'Software Engineer' : 'Backend Engineer',
      baseSalary: 100000 + Math.random() * 50000,
      bonus: Math.random() > 0.5 ? 10000 + Math.random() * 5000 : undefined,
      stock: Math.random() > 0.5 ? 20000 + Math.random() * 10000 : undefined,
      location: 'San Francisco, CA',
      yearsOfExperience: 3,
      yearsAtCompany: 1,
    });

    const normalizedName = processed.normalizedName;

    // Upsert Company
    let company = await prisma.company.findUnique({ where: { name: normalizedName } });
    if (!company) {
      company = await prisma.company.create({ data: { name: normalizedName } });
    }

    // Upsert Level
    let level = await prisma.companyLevel.findUnique({
      where: { companyId_name: { companyId: company.id, name: 'L3' } }
    });
    if (!level) {
      level = await prisma.companyLevel.create({
        data: {
          companyId: company.id,
          name: 'L3',
          rank: 3,
          standardLevelId: sLevel3.id,
        }
      });
    }
    
    await prisma.compensationRecord.create({
      data: {
        companyId: company.id,
        levelId: level.id,
        jobTitle: processed.originalData.jobTitle,
        baseSalary: processed.originalData.baseSalary,
        bonus: processed.originalData.bonus,
        stock: processed.originalData.stock,
        location: processed.originalData.location,
        yearsOfExperience: processed.originalData.yearsOfExperience,
        yearsAtCompany: processed.originalData.yearsAtCompany,
      }
    });

    insertedCount++;
  }

  console.log(`✅ Seeded ${insertedCount} compensation records!`);

  // Verify Aggregations!
  console.log('\n--- VERIFYING NORMALIZATION ---');
  const companies = await prisma.company.findMany();
  console.log(`Unique companies mapped: ${companies.map(c => c.name).join(', ')}`);
  
  console.log('\n--- VERIFYING AGGREGATION APIs ---');
  await compensationService.onModuleInit();
  
  const googleCompany = await prisma.company.findUnique({ where: { name: 'google' } });
  if (googleCompany) {
    const stats = await compensationService.getPercentiles({ companyId: googleCompany.id });
    console.log(`\nGoogle Percentiles (Total Compensation):`);
    console.log(stats);
  }

  const metaCompany = await prisma.company.findUnique({ where: { name: 'meta platforms' } });
  if (metaCompany) {
    const stats = await compensationService.getPercentiles({ companyId: metaCompany.id });
    console.log(`\nMeta Percentiles (Total Compensation):`);
    console.log(stats);
  }

  const overallStats = await compensationService.getPercentiles({});
  console.log(`\nOverall Percentiles across all ${insertedCount} records:`);
  console.log(overallStats);

  await compensationService.onModuleDestroy();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
