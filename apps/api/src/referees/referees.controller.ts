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
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RefereesService } from './referees.service';
import { CreateRefereeDto } from './dto/create-referee.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RefereeStatus } from './schemas/referee.schema';

@ApiTags('Referees')
@Controller('referees')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class RefereesController {
  constructor(private readonly refereesService: RefereesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new referee' })
  @ApiResponse({ status: 201, description: 'Referee created' })
  async create(@Body() createDto: CreateRefereeDto, @Request() req: { user: { userId: string } }) {
    return this.refereesService.create(createDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all referees' })
  @ApiQuery({ name: 'company', required: false })
  @ApiQuery({ name: 'status', required: false, enum: RefereeStatus })
  @ApiQuery({ name: 'search', required: false })
  @ApiResponse({ status: 200, description: 'List of referees' })
  async findAll(
    @Query('company') company?: string,
    @Query('status') status?: RefereeStatus,
    @Query('search') search?: string,
  ) {
    return this.refereesService.findAll({ company, status, search });
  }

  @Get('by-matter/:matterId')
  @ApiOperation({ summary: 'Get referees by matter' })
  @ApiResponse({ status: 200, description: 'List of referees for matter' })
  async findByMatter(@Param('matterId') matterId: string) {
    return this.refereesService.findByMatter(matterId);
  }

  @Get('export/:submissionId')
  @ApiOperation({ summary: 'Export referees for submission as spreadsheet data' })
  @ApiResponse({ status: 200, description: 'Spreadsheet data' })
  async exportToSpreadsheet(@Param('submissionId') submissionId: string) {
    return this.refereesService.exportToSpreadsheet(submissionId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a referee by ID' })
  @ApiResponse({ status: 200, description: 'Referee details' })
  async findOne(@Param('id') id: string) {
    return this.refereesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a referee' })
  @ApiResponse({ status: 200, description: 'Referee updated' })
  async update(@Param('id') id: string, @Body() updateDto: Partial<CreateRefereeDto>) {
    return this.refereesService.update(id, updateDto);
  }

  @Post(':id/matter-reference')
  @ApiOperation({ summary: 'Add matter reference to referee' })
  @ApiResponse({ status: 200, description: 'Matter reference added' })
  async addMatterReference(
    @Param('id') id: string,
    @Body() matterRef: {
      matterId: string;
      matterTitle: string;
      relationship: string;
      canDiscuss: string[];
    },
  ) {
    return this.refereesService.addMatterReference(id, matterRef);
  }

  @Delete(':id/matter-reference/:matterId')
  @ApiOperation({ summary: 'Remove matter reference from referee' })
  @ApiResponse({ status: 200, description: 'Matter reference removed' })
  async removeMatterReference(@Param('id') id: string, @Param('matterId') matterId: string) {
    return this.refereesService.removeMatterReference(id, matterId);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update referee status' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: RefereeStatus; declinedReason?: string },
  ) {
    return this.refereesService.updateStatus(id, body.status, body.declinedReason);
  }

  @Post(':id/link-submission/:submissionId')
  @ApiOperation({ summary: 'Link referee to submission' })
  @ApiResponse({ status: 200, description: 'Referee linked to submission' })
  async linkToSubmission(@Param('id') id: string, @Param('submissionId') submissionId: string) {
    return this.refereesService.linkToSubmission(id, submissionId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a referee (soft delete)' })
  @ApiResponse({ status: 200, description: 'Referee deleted' })
  async delete(@Param('id') id: string) {
    await this.refereesService.delete(id);
    return { message: 'Referee deleted successfully' };
  }
}
