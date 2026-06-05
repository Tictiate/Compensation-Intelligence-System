import { Test, TestingModule } from '@nestjs/testing';
import { CompensationController } from './compensation.controller';

describe('CompensationController', () => {
  let controller: CompensationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompensationController],
    }).compile();

    controller = module.get<CompensationController>(CompensationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
