import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExtractDto {
  @ApiProperty({ description: 'Document content to extract data from' })
  @IsString()
  documentContent: string;

  @ApiPropertyOptional({ description: 'Document ID for reference' })
  @IsOptional()
  @IsString()
  documentId?: string;
}
