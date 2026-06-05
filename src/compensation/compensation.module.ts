import { Module } from '@nestjs/common';
import { CompensationService } from './compensation.service';
import { CompensationController } from './compensation.controller';

@Module({
  providers: [CompensationService],
  controllers: [CompensationController]
})
export class CompensationModule {}
