import { Controller, Get, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { CompensationService } from './compensation.service';
import { CompareCompensationDto } from './dto/compare-compensation.dto';

@Controller('compensation')
export class CompensationController {
  constructor(private readonly compensationService: CompensationService) {}

  @Get('compare')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async compare(@Query() query: CompareCompensationDto) {
    return this.compensationService.getPercentiles(query);
  }
}
