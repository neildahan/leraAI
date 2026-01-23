import { IsString, IsObject, IsOptional, IsArray, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class DealValueDto {
  @IsNumber()
  amount: number;

  @IsString()
  currency: string;

  @IsOptional()
  isEstimated?: boolean;
}

class ExtractedDataDto {
  @IsOptional()
  @IsString()
  clientName?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  counterparties?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => DealValueDto)
  dealValue?: DealValueDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  practiceAreas?: string[];

  @IsOptional()
  @IsString()
  legalNovelty?: string;
}

export class GenerateDto {
  @ApiProperty({ description: 'Matter ID to generate description for' })
  @IsString()
  matterId: string;

  @ApiProperty({ description: 'Extracted data from document' })
  @IsObject()
  @ValidateNested()
  @Type(() => ExtractedDataDto)
  extractedData: ExtractedDataDto;
}
