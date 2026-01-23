import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuditService, AuditQueryParams } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TokenPayload } from '../auth/interfaces/auth.interface';
import { AuditAction, ResourceType } from './schemas/audit-log.schema';

@ApiTags('Audit')
@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Query audit logs' })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'action', required: false, enum: AuditAction })
  @ApiQuery({ name: 'resourceType', required: false, enum: ResourceType })
  @ApiQuery({ name: 'resourceId', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Audit logs retrieved' })
  async query(@Query() params: AuditQueryParams) {
    return this.auditService.query(params);
  }

  @Get('my-activity')
  @ApiOperation({ summary: 'Get current user recent activity' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Recent activity retrieved' })
  async getMyActivity(
    @CurrentUser() user: TokenPayload,
    @Query('limit') limit?: number,
  ) {
    return this.auditService.getRecentActivity(user.userId, limit);
  }

  @Get('ai-operations')
  @Roles('admin', 'partner')
  @ApiOperation({ summary: 'Get AI operation logs' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'AI operation logs retrieved' })
  async getAIOperations(
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Query('limit') limit?: number,
  ) {
    return this.auditService.getAIOperations({ startDate, endDate, limit });
  }
}
