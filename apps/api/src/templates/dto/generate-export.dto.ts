import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateExportDto {
  @ApiProperty({ description: 'Matter ID to generate export for' })
  @IsString()
  matterId: string;

  @ApiPropertyOptional({ description: 'Field value overrides' })
  @IsOptional()
  @IsObject()
  fieldOverrides?: Record<string, any>;
}
