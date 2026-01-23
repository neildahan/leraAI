import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SynthesisService } from './synthesis.service';
import { ExtractDto } from './dto/extract.dto';
import { GenerateDto } from './dto/generate.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Synthesis')
@Controller('synthesis')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class SynthesisController {
  constructor(private readonly synthesisService: SynthesisService) {}

  @Post('extract')
  @ApiOperation({ summary: 'Extract structured data from document' })
  @ApiResponse({ status: 200, description: 'Extraction completed' })
  async extract(@Body() extractDto: ExtractDto) {
    return this.synthesisService.extractFromDocument(extractDto.documentContent);
  }

  @Post('generate')
  @ApiOperation({ summary: 'Generate directory submission description' })
  @ApiResponse({ status: 200, description: 'Description generated' })
  async generate(@Body() generateDto: GenerateDto) {
    return this.synthesisService.generateDescription(
      generateDto.matterId,
      generateDto.extractedData as any,
    );
  }

  @Get('score/:matterId')
  @ApiOperation({ summary: 'Get submission score for matter' })
  @ApiResponse({ status: 200, description: 'Score calculated' })
  async score(@Param('matterId') matterId: string) {
    return this.synthesisService.scoreMatter(matterId);
  }
}
