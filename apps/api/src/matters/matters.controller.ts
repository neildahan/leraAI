import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MattersService } from './matters.service';
import { CreateMatterDto } from './dto/create-matter.dto';
import { UpdateMatterDto } from './dto/update-matter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TokenPayload } from '../auth/interfaces/auth.interface';
import { MatterStatus } from './schemas/matter.schema';

@ApiTags('Matters')
@Controller('matters')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class MattersController {
  constructor(private readonly mattersService: MattersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new matter' })
  @ApiResponse({ status: 201, description: 'Matter created successfully' })
  async create(@Body() createMatterDto: CreateMatterDto, @CurrentUser() user: TokenPayload) {
    return this.mattersService.create(createMatterDto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all matters' })
  @ApiQuery({ name: 'status', required: false, enum: MatterStatus })
  @ApiQuery({ name: 'leadPartner', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of matters' })
  async findAll(
    @Query('status') status?: MatterStatus,
    @Query('leadPartner') leadPartner?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.mattersService.findAll({ status, leadPartner, search, limit, offset });
  }

  @Get('statistics')
  @Roles('admin', 'partner')
  @ApiOperation({ summary: 'Get matter statistics' })
  @ApiResponse({ status: 200, description: 'Matter statistics' })
  async getStatistics() {
    return this.mattersService.getStatistics();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get matter by ID' })
  @ApiResponse({ status: 200, description: 'Matter found' })
  @ApiResponse({ status: 404, description: 'Matter not found' })
  async findOne(@Param('id') id: string) {
    return this.mattersService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update matter' })
  @ApiResponse({ status: 200, description: 'Matter updated' })
  @ApiResponse({ status: 404, description: 'Matter not found' })
  async update(@Param('id') id: string, @Body() updateMatterDto: UpdateMatterDto) {
    return this.mattersService.update(id, updateMatterDto);
  }

  @Put(':id/status')
  @Roles('admin', 'partner')
  @ApiOperation({ summary: 'Update matter status' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: MatterStatus,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.mattersService.updateStatus(id, status, user.userId);
  }

  @Post(':id/approve')
  @Roles('admin', 'partner')
  @ApiOperation({ summary: 'Approve matter for submission' })
  @ApiResponse({ status: 200, description: 'Matter approved' })
  async approve(@Param('id') id: string, @CurrentUser() user: TokenPayload) {
    return this.mattersService.updateStatus(id, MatterStatus.APPROVED, user.userId);
  }

  @Post(':id/reject')
  @Roles('admin', 'partner')
  @ApiOperation({ summary: 'Reject matter and return to draft' })
  @ApiResponse({ status: 200, description: 'Matter rejected' })
  async reject(@Param('id') id: string) {
    return this.mattersService.updateStatus(id, MatterStatus.DRAFT);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete matter (soft delete)' })
  @ApiResponse({ status: 204, description: 'Matter deleted' })
  async remove(@Param('id') id: string) {
    await this.mattersService.softDelete(id);
  }
}
