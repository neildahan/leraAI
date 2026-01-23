import { IsString, IsEmail, IsOptional, IsArray, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class MatterReferenceDto {
  @IsString()
  matterId: string;

  @IsString()
  matterTitle: string;

  @IsString()
  relationship: string;

  @IsArray()
  @IsString({ each: true })
  canDiscuss: string[];
}

export class CreateRefereeDto {
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

  @ApiProperty({ description: 'Company name' })
  @IsString()
  company: string;

  @ApiProperty({ description: 'Job title', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'Position in company', required: false })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiProperty({ description: 'Type of relationship (client, co-counsel, etc.)', required: false })
  @IsOptional()
  @IsString()
  relationshipType?: string;

  @ApiProperty({ description: 'Years of relationship', required: false })
  @IsOptional()
  @IsNumber()
  relationshipYears?: number;

  @ApiProperty({ description: 'Matters this referee can speak about', required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MatterReferenceDto)
  matterReferences?: MatterReferenceDto[];

  @ApiProperty({ description: 'Key points they can speak to', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  speakingPoints?: string[];

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
