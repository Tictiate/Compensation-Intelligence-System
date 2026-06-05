import { Controller, Post, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { CreateSalaryRecordDto } from './dto/create-salary-record.dto';

@Controller('ingestion')
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Post('salary')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async createSalaryRecord(@Body() createSalaryRecordDto: CreateSalaryRecordDto) {
    return this.ingestionService.processSalaryRecord(createSalaryRecordDto);
  }
}
