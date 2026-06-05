import { IsString, IsNotEmpty, IsNumber, IsOptional, IsPositive, Min } from 'class-validator';

export class CreateSalaryRecordDto {
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsString()
  @IsNotEmpty()
  levelName: string;

  @IsString()
  @IsNotEmpty()
  jobTitle: string;

  @IsNumber()
  @IsPositive()
  baseSalary: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  bonus?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsNumber()
  @Min(0)
  yearsOfExperience: number;

  @IsNumber()
  @Min(0)
  yearsAtCompany: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  employmentType?: string;
}
