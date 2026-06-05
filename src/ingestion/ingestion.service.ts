import { Injectable } from '@nestjs/common';
import { CreateSalaryRecordDto } from './dto/create-salary-record.dto';
// Replace with the PrismaService once it's created, but for now we will stub the logic
// import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IngestionService {
  // constructor(private prisma: PrismaService) {}

  public normalizeCompanyName(name: string): string {
    if (!name) return '';

    let normalized = name.toLowerCase();

    // 1. Suffixes & Parentheticals: Remove anything inside parentheses, including the parentheses.
    normalized = normalized.replace(/\(.*?\)/g, '');

    // 2. The Ampersand Dilemma: Convert all & characters to the word 'and'
    normalized = normalized.replace(/&/g, ' and ');

    // 3. Punctuation & Special Characters: Remove commas, periods, semi-colons, trailing exclamation points, single/double quotes.
    normalized = normalized.replace(/[,.;'"]/g, '');
    normalized = normalized.replace(/!+$/g, '');

    // 4. International & Tech Legal Suffixes:
    // Strip common legal/tech suffixes
    const suffixes = [
      'inc', 'llc', 'corp', 'corporation', 'ltd', 'limited', 'co', 'company',
      'gmbh', 'ag', 'sa', 'se', 'bv',
      'labs', 'technologies', 'solutions', 'systems'
    ];
    // Create a regex to match these suffixes as whole words at the end of the string
    // or as distinct words anywhere. Usually suffixes are at the end. We'll strip them if they are whole words.
    const suffixRegex = new RegExp(`\\b(?:${suffixes.join('|')})\\b`, 'gi');
    normalized = normalized.replace(suffixRegex, '');

    // 5. Internal Whitespace Collapsing: Replace multiple spaces with a single space and trim.
    normalized = normalized.replace(/\s+/g, ' ').trim();

    return normalized;
  }

  async processSalaryRecord(dto: CreateSalaryRecordDto) {
    const normalizedName = this.normalizeCompanyName(dto.companyName);
    
    // Safety fallbacks: Default missing bonus and stock to 0
    const bonus = dto.bonus ?? 0;
    const stock = dto.stock ?? 0;
    const totalCompensation = dto.baseSalary + bonus + stock;

    // In a real implementation we would look up the company by normalizedName
    // or check the aliases array. 
    // For now we just return the normalized name to demonstrate the pipeline
    return {
      message: 'Record processed successfully',
      normalizedName,
      totalCompensation,
      originalData: { ...dto, bonus, stock },
    };
  }
}
