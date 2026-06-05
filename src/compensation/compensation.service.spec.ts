import { Test, TestingModule } from '@nestjs/testing';
import { CompensationService } from './compensation.service';

describe('CompensationService', () => {
  let service: CompensationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompensationService],
    }).compile();

    service = module.get<CompensationService>(CompensationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
