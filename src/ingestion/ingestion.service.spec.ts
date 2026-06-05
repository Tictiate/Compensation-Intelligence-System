import { Test, TestingModule } from '@nestjs/testing';
import { IngestionService } from './ingestion.service';

describe('IngestionService', () => {
  let service: IngestionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IngestionService],
    }).compile();

    service = module.get<IngestionService>(IngestionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('normalizeCompanyName', () => {
    it('should cleanly remove punctuation and corporate suffixes (e.g. Google, Inc.)', () => {
      expect(service.normalizeCompanyName('Google, Inc.')).toBe('google');
      expect(service.normalizeCompanyName('Amazon.com Inc')).toBe('amazoncom');
      expect(service.normalizeCompanyName('Apple Corp.')).toBe('apple');
    });

    it('should remove parentheticals completely (e.g. Meta (Facebook))', () => {
      expect(service.normalizeCompanyName('Meta (Facebook)')).toBe('meta');
      expect(service.normalizeCompanyName('Alphabet (Google)')).toBe('alphabet');
    });

    it('should convert ampersands to "and" and strip tech suffixes (e.g. M&M Labs)', () => {
      expect(service.normalizeCompanyName('M&M Labs')).toBe('m and m');
      expect(service.normalizeCompanyName('AT&T')).toBe('at and t');
      expect(service.normalizeCompanyName('Ernst & Young Technologies')).toBe('ernst and young');
    });

    it('should collapse multiple internal spaces and trim edges', () => {
      expect(service.normalizeCompanyName('  nested   spaces  ')).toBe('nested spaces');
      expect(service.normalizeCompanyName('   weird    spacing   inc  ')).toBe('weird spacing');
    });

    it('should handle complex mixed scenarios', () => {
      expect(service.normalizeCompanyName('  Stripe,  LLC (USA)  ')).toBe('stripe');
      expect(service.normalizeCompanyName('Yahoo!!!')).toBe('yahoo');
    });

    it('should return empty string for null, undefined, or empty inputs', () => {
      expect(service.normalizeCompanyName('')).toBe('');
      expect(service.normalizeCompanyName(null as any)).toBe('');
      expect(service.normalizeCompanyName(undefined as any)).toBe('');
    });
  });
});
