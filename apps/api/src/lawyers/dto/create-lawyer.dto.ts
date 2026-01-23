import { IsString, IsEmail, IsOptional, IsArray, IsNumber, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { LawyerLevel } from '../schemas/lawyer.schema';

class PracticeAreaExpertiseDto {
  @IsString()
  area: string;

  @IsNumber()
  yearsExperience: number;

  @IsOptional()
  isLead?: boolean;
}

class DirectoryRankingDto {
  @IsString()
  directory: string;

  @IsNumber()
  year: number;

  @IsString()
  ranking: string;

  @IsString()
  practiceArea: string;
}

export class CreateLawyerDto {
  @ApiProperty({ description: 'First name' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Last name' })
  @IsString()
  lastName: string;

  @ApiProperty({ description: 'Email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Phone number', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ enum: LawyerLevel, description: 'Lawyer level' })
  @IsEnum(LawyerLevel)
  level: LawyerLevel;

  @ApiProperty({ description: 'Job title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Practice areas', type: [String] })
  @IsArray()
  @IsString({ each: true })
  practiceAreas: string[];

  @ApiProperty({ description: 'Practice area expertise', required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PracticeAreaExpertiseDto)
  practiceAreaExpertise?: PracticeAreaExpertiseDto[];

  @ApiProperty({ description: 'Department', required: false })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiProperty({ description: 'Year of bar admission', required: false })
  @IsOptional()
  @IsNumber()
  admissionYear?: number;

  @ApiProperty({ description: 'Bio', required: false })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ description: 'Previous directory rankings', required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DirectoryRankingDto)
  previousRankings?: DirectoryRankingDto[];

  @ApiProperty({ description: 'Education', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  education?: string[];

  @ApiProperty({ description: 'Languages', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @ApiProperty({ description: 'Notable achievements', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  achievements?: string[];
}
