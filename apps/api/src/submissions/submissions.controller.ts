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
import { SubmissionsService } from './submissions.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubmissionStatus, TargetDirectory } from './schemas/submission.schema';

@ApiTags('Submissions')
@Controller('submissions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new submission' })
  @ApiResponse({ status: 201, description: 'Submission created' })
  async create(@Body() createDto: CreateSubmissionDto, @Request() req: { user: { userId: string } }) {
    return this.submissionsService.create(createDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all submissions' })
  @ApiQuery({ name: 'status', required: false, enum: SubmissionStatus })
  @ApiQuery({ name: 'rankingType', required: false })
  @ApiQuery({ name: 'year', required: false })
  @ApiResponse({ status: 200, description: 'List of submissions' })
  async findAll(
    @Request() req: { user: { userId: string } },
    @Query('status') status?: SubmissionStatus,
    @Query('rankingType') rankingType?: string,
    @Query('year') year?: number,
  ) {
    return this.submissionsService.findAll(req.user.userId, { status, rankingType, year });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get submission statistics' })
  @ApiResponse({ status: 200, description: 'Submission stats' })
  async getStats(@Request() req: { user: { userId: string } }) {
    return this.submissionsService.getStats(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a submission by ID' })
  @ApiResponse({ status: 200, description: 'Submission details' })
  async findOne(@Param('id') id: string) {
    return this.submissionsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a submission' })
  @ApiResponse({ status: 200, description: 'Submission updated' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateSubmissionDto) {
    return this.submissionsService.update(id, updateDto);
  }

  @Post(':id/matters')
  @ApiOperation({ summary: 'Add matters to submission' })
  @ApiResponse({ status: 200, description: 'Matters added' })
  async addMatters(@Param('id') id: string, @Body() body: { matterIds: string[] }) {
    return this.submissionsService.addMatters(id, body.matterIds);
  }

  @Delete(':id/matters')
  @ApiOperation({ summary: 'Remove matters from submission' })
  @ApiResponse({ status: 200, description: 'Matters removed' })
  async removeMatters(@Param('id') id: string, @Body() body: { matterIds: string[] }) {
    return this.submissionsService.removeMatters(id, body.matterIds);
  }

  @Post(':id/referees')
  @ApiOperation({ summary: 'Add referees to submission' })
  @ApiResponse({ status: 200, description: 'Referees added' })
  async addReferees(@Param('id') id: string, @Body() body: { refereeIds: string[] }) {
    return this.submissionsService.addReferees(id, body.refereeIds);
  }

  @Put(':id/directory-content/:directory')
  @ApiOperation({ summary: 'Update directory-specific content' })
  @ApiResponse({ status: 200, description: 'Content updated' })
  async updateDirectoryContent(
    @Param('id') id: string,
    @Param('directory') directory: TargetDirectory,
    @Body() content: { overview: string; keyAchievements: string[]; marketPosition: string },
    @Request() req: { user: { userId: string } },
  ) {
    return this.submissionsService.updateDirectoryContent(id, directory, content, req.user.userId);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update submission status' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: SubmissionStatus },
    @Request() req: { user: { userId: string } },
  ) {
    return this.submissionsService.updateStatus(id, body.status, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a submission (soft delete)' })
  @ApiResponse({ status: 200, description: 'Submission deleted' })
  async delete(@Param('id') id: string) {
    await this.submissionsService.delete(id);
    return { message: 'Submission deleted successfully' };
  }
}
