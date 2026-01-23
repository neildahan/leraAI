import { IsString, IsEnum, IsArray, IsOptional, IsDateString, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RankingType, TargetDirectory, SubmissionStatus } from '../schemas/submission.schema';

export class UpdateSubmissionDto {
  @ApiProperty({ description: 'Submission title', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ enum: RankingType, description: 'Type of ranking', required: false })
  @IsOptional()
  @IsEnum(RankingType)
  rankingType?: RankingType;

  @ApiProperty({ enum: TargetDirectory, isArray: true, description: 'Target directories', required: false })
  @IsOptional()
  @IsArray()
  @IsEnum(TargetDirectory, { each: true })
  targetDirectories?: TargetDirectory[];

  @ApiProperty({ enum: SubmissionStatus, description: 'Submission status', required: false })
  @IsOptional()
  @IsEnum(SubmissionStatus)
  status?: SubmissionStatus;

  @ApiProperty({ description: 'Department name', required: false })
  @IsOptional()
  @IsString()
  departmentName?: string;

  @ApiProperty({ description: 'Practice area', required: false })
  @IsOptional()
  @IsString()
  practiceArea?: string;

  @ApiProperty({ description: 'Target lawyer ID', required: false })
  @IsOptional()
  @IsMongoId()
  targetLawyerId?: string;

  @ApiProperty({ description: 'Matter IDs to include', required: false })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  matterIds?: string[];

  @ApiProperty({ description: 'Referee IDs', required: false })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  refereeIds?: string[];

  @ApiProperty({ description: 'Assigned user ID', required: false })
  @IsOptional()
  @IsMongoId()
  assignedTo?: string;

  @ApiProperty({ description: 'Reviewer user IDs', required: false })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  reviewers?: string[];

  @ApiProperty({ description: 'Submission deadline', required: false })
  @IsOptional()
  @IsDateString()
  submissionDeadline?: string;

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
