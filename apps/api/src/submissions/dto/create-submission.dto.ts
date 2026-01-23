import { IsString, IsEnum, IsArray, IsOptional, IsDateString, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RankingType, TargetDirectory } from '../schemas/submission.schema';

export class CreateSubmissionDto {
  @ApiProperty({ description: 'Submission title' })
  @IsString()
  title: string;

  @ApiProperty({ enum: RankingType, description: 'Type of ranking' })
  @IsEnum(RankingType)
  rankingType: RankingType;

  @ApiProperty({ enum: TargetDirectory, isArray: true, description: 'Target directories' })
  @IsArray()
  @IsEnum(TargetDirectory, { each: true })
  targetDirectories: TargetDirectory[];

  @ApiProperty({ description: 'Submission year', required: false })
  @IsOptional()
  year?: number;

  @ApiProperty({ description: 'Department name (for department ranking)', required: false })
  @IsOptional()
  @IsString()
  departmentName?: string;

  @ApiProperty({ description: 'Practice area', required: false })
  @IsOptional()
  @IsString()
  practiceArea?: string;

  @ApiProperty({ description: 'Target lawyer ID (for lawyer ranking)', required: false })
  @IsOptional()
  @IsMongoId()
  targetLawyerId?: string;

  @ApiProperty({ description: 'Matter IDs to include', required: false })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  matterIds?: string[];

  @ApiProperty({ description: 'Submission deadline', required: false })
  @IsOptional()
  @IsDateString()
  submissionDeadline?: string;

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
