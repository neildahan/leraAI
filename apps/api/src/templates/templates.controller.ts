import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TemplatesService } from './templates.service';
import { GenerateExportDto } from './dto/generate-export.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TokenPayload } from '../auth/interfaces/auth.interface';

@ApiTags('Templates')
@Controller('templates')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  @ApiOperation({ summary: 'List all available templates' })
  @ApiResponse({ status: 200, description: 'List of templates' })
  async findAll() {
    return this.templatesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get template by ID' })
  @ApiResponse({ status: 200, description: 'Template found' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async findOne(@Param('id') id: string) {
    return this.templatesService.findById(id);
  }

  @Get(':id/fields')
  @ApiOperation({ summary: 'Get template fields' })
  @ApiResponse({ status: 200, description: 'Template fields' })
  async getFields(@Param('id') id: string) {
    return this.templatesService.getTemplateFields(id);
  }

  @Post(':id/generate')
  @ApiOperation({ summary: 'Generate export from template' })
  @ApiResponse({ status: 201, description: 'Export generation started' })
  async generate(
    @Param('id') id: string,
    @Body() generateExportDto: GenerateExportDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.templatesService.generateExport(
      id,
      generateExportDto.matterId,
      user.userId,
      generateExportDto.fieldOverrides,
    );
  }

  @Get('exports/my')
  @ApiOperation({ summary: 'Get my exports' })
  @ApiResponse({ status: 200, description: 'List of exports' })
  async getMyExports(@CurrentUser() user: TokenPayload) {
    return this.templatesService.getUserExports(user.userId);
  }
}

@Controller('exports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@ApiTags('Exports')
export class ExportsController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get export by ID' })
  @ApiResponse({ status: 200, description: 'Export found' })
  async getExport(@Param('id') id: string) {
    return this.templatesService.getExport(id);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download export file' })
  @ApiResponse({ status: 200, description: 'File download' })
  async download(@Param('id') id: string, @Res() res: Response) {
    const exportRecord = await this.templatesService.getExport(id);

    // Mark as downloaded
    await this.templatesService.markDownloaded(id);

    // In production, this would stream the actual file
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${exportRecord.fileName}"`);
    res.send(`Mock file content for ${exportRecord.fileName}`);
  }
}
