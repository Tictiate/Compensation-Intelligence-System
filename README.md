# Compensation Intelligence System - Backend API

**Live API:** [https://compensation-intelligence-system-production-f5b6.up.railway.app](https://compensation-intelligence-system-production-f5b6.up.railway.app)

A production-ready Node.js backend built with [NestJS](https://nestjs.com/), [Prisma 7](https://www.prisma.io/), and **PostgreSQL**.

This system features a highly robust compensation data ingestion pipeline. It includes an intelligent normalization engine to collapse messy corporate aliases into canonical identities, and a high-performance aggregation API that utilizes native PostgreSQL percentile functions (`percentile_cont`) for compensation benchmarks.

## Core Features
- **Normalization Engine**: Auto-cleans parentheticals, legal suffixes (LLC, Inc, GmbH), punctuation, and ampersands from incoming records.
- **Native DB Aggregations**: Uses Prisma `$queryRaw` to safely compute 25th, 50th, and 90th percentiles completely within the database engine.
- **Strict Validation**: Request validation powered by `class-validator` to guarantee data integrity.
- **Security & Reliability**: Global exception filters intercept raw DB crashes and a global throttler rate-limits IPs to 10 ingestion requests per minute.

---

## Requirements

Before starting, ensure you have the following installed on your host system:
1. **Node.js**: v18.x or v20.x+
2. **PostgreSQL**: v14.x+ (Available locally or hosted remotely)

---

## Environment Setup

1. Copy the environment configuration:
```bash
cp .env.example .env
```
*(If `.env.example` is not present, simply create a `.env` file at the root.)*

2. Provide your Postgres connection string in the `.env` file. With Prisma 7, use the standard Postgres driver format:
```env
DATABASE_URL="postgres://<USER>:<PASSWORD>@<HOST>:<PORT>/<DATABASE>?sslmode=disable"
PORT=3000
```

---

## Installation & Deployment

1. **Install Dependencies**:
```bash
npm install
```

2. **Generate Prisma Client**:
The Prisma client definitions are required to build the NestJS server.
```bash
npx prisma generate
```

3. **Database Migrations**:
Apply the schema to your Postgres database.
```bash
npx prisma migrate deploy
# Note: For local development, you may use `npx prisma db push` instead
```

4. **(Optional) Seed the Database**:
To test the normalizer and aggregations with 100 randomized, messy entries:
```bash
npx ts-node prisma/seed.ts
```

5. **Start the Application**:
```bash
# Development
npm run start:dev

# Production build and run
npm run build
npm run start:prod
```

---

## API Overview

### 1. Ingest Salary Record
`POST /ingestion/salary`

Records a new compensation data point. Auto-cleans the `companyName` and enforces constraints.
```json
{
  "companyName": "Google (YouTube)",
  "levelName": "L3",
  "jobTitle": "Software Engineer",
  "baseSalary": 150000,
  "bonus": 20000,
  "stock": 40000,
  "location": "San Francisco, CA",
  "yearsOfExperience": 3,
  "yearsAtCompany": 1
}
```

### 2. Compare Compensation
`GET /compensation/compare?companyId=<UUID>&levelId=<UUID>&jobTitle=...`

Returns native p25, p50, and p90 aggregations for the total compensation of matching records.
```json
{
  "percentiles": {
    "p25": 180000,
    "p50": 210000,
    "p90": 250000
  },
  "filters": {
    "companyId": "uuid-here"
  }
}
```

## Running Tests
Run the normalization engine test suite using Jest:
```bash
npm run test
```
