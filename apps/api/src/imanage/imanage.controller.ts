import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ImanageService } from './imanage.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TokenPayload } from '../auth/interfaces/auth.interface';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('iManage')
@Controller('imanage')
export class ImanageController {
  constructor(private readonly imanageService: ImanageService) {}

  @Post('connect')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Initiate iManage OAuth connection' })
  @ApiResponse({ status: 200, description: 'Returns authorization URL' })
  async connect() {
    const authorizationUrl = this.imanageService.getAuthorizationUrl();
    return { authorizationUrl };
  }

  @Get('callback')
  @Public()
  @ApiOperation({ summary: 'OAuth callback handler' })
  @ApiQuery({ name: 'code', required: true })
  @ApiQuery({ name: 'state', required: false })
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    // State contains user ID for demo purposes (would use session in production)
    const userId = state || 'demo-user';
    await this.imanageService.handleCallback(code, userId);

    // Redirect to frontend with success
    res.redirect('/imanage/connected');
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get iManage connection status' })
  @ApiResponse({ status: 200, description: 'Connection status' })
  async getStatus(@CurrentUser() user: TokenPayload) {
    return this.imanageService.getConnectionStatus(user.userId);
  }

  @Post('disconnect')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Disconnect from iManage' })
  @ApiResponse({ status: 204, description: 'Disconnected successfully' })
  async disconnect(@CurrentUser() user: TokenPayload) {
    await this.imanageService.disconnect(user.userId);
  }

  @Get('workspaces')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'List iManage workspaces' })
  @ApiResponse({ status: 200, description: 'List of workspaces' })
  async getWorkspaces(@CurrentUser() user: TokenPayload) {
    return this.imanageService.getWorkspaces(user.userId);
  }

  @Get('documents')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Search/list documents' })
  @ApiQuery({ name: 'workspaceId', required: false })
  @ApiQuery({ name: 'query', required: false })
  @ApiQuery({ name: 'extension', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of documents' })
  async getDocuments(
    @CurrentUser() user: TokenPayload,
    @Query('workspaceId') workspaceId?: string,
    @Query('query') query?: string,
    @Query('extension') extension?: string,
    @Query('limit') limit?: number,
  ) {
    return this.imanageService.searchDocuments(user.userId, {
      workspaceId,
      query,
      extension,
      limit,
    });
  }

  @Get('documents/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get document metadata' })
  @ApiResponse({ status: 200, description: 'Document metadata' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async getDocument(@CurrentUser() user: TokenPayload, @Param('id') id: string) {
    return this.imanageService.getDocument(user.userId, id);
  }

  @Get('documents/:id/content')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get document content (text)' })
  @ApiResponse({ status: 200, description: 'Document content' })
  async getDocumentContent(@CurrentUser() user: TokenPayload, @Param('id') id: string) {
    const content = await this.imanageService.getDocumentContent(user.userId, id);
    return { content };
  }

  @Post('documents/:id/select')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Mark document for processing' })
  @ApiResponse({ status: 200, description: 'Document selected' })
  async selectDocument(@CurrentUser() user: TokenPayload, @Param('id') id: string) {
    const document = await this.imanageService.getDocument(user.userId, id);
    return { selected: true, document };
  }
}
