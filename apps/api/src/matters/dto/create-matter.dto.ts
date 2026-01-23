import { IsString, IsOptional, IsArray, IsNumber, IsObject, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class DealValueDto {
  @ApiProperty({ example: 1000000 })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'USD' })
  @IsString()
  currency: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  isEstimated?: boolean;
}

// משרדי עו"ד נוספים שהיו מעורבים
class OpposingCounselDto {
  @ApiProperty({ example: 'Herzog Fox & Neeman', description: 'שם משרד עוה"ד' })
  @IsString()
  firmName: string;

  @ApiProperty({ example: 'Beta Inc', description: 'את מי ייצגו' })
  @IsString()
  representedParty: string;

  @ApiPropertyOptional({ example: 'M&A', description: 'באיזה תחום' })
  @IsOptional()
  @IsString()
  practiceArea?: string;
}

export class CreateMatterDto {
  @ApiProperty({ example: 'Acme Corp Acquisition of Beta Inc' })
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imanageId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imanageWorkspaceId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clientName?: string;

  @ApiPropertyOptional({ type: [String], description: 'הצדדים שכנגד בעסקה (חברות)' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  counterparties?: string[];

  @ApiPropertyOptional({ type: [OpposingCounselDto], description: 'משרדי עו"ד נוספים שהיו מעורבים' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OpposingCounselDto)
  opposingCounsel?: OpposingCounselDto[];

  @ApiPropertyOptional({ description: 'פירוט השירותים שהוענקו' })
  @IsOptional()
  @IsString()
  serviceDescription?: string;

  @ApiPropertyOptional({ description: 'תחום פעילות' })
  @IsOptional()
  @IsString()
  practiceArea?: string;

  @ApiPropertyOptional({ description: 'תאריך סיום' })
  @IsOptional()
  @IsDateString()
  completionDate?: string;

  @ApiPropertyOptional({ type: DealValueDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DealValueDto)
  dealValue?: DealValueDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  leadPartner?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  teamMembers?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documentIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
