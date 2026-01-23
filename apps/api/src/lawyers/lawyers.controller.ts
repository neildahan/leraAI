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
import { LawyersService } from './lawyers.service';
import { CreateLawyerDto } from './dto/create-lawyer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LawyerLevel } from './schemas/lawyer.schema';

@ApiTags('Lawyers')
@Controller('lawyers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class LawyersController {
  constructor(private readonly lawyersService: LawyersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new lawyer profile' })
  @ApiResponse({ status: 201, description: 'Lawyer created' })
  async create(@Body() createDto: CreateLawyerDto, @Request() req: { user: { userId: string } }) {
    return this.lawyersService.create(createDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all lawyers' })
  @ApiQuery({ name: 'level', required: false, enum: LawyerLevel })
  @ApiQuery({ name: 'department', required: false })
  @ApiQuery({ name: 'practiceArea', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiResponse({ status: 200, description: 'List of lawyers' })
  async findAll(
    @Query('level') level?: LawyerLevel,
    @Query('department') department?: string,
    @Query('practiceArea') practiceArea?: string,
    @Query('search') search?: string,
  ) {
    return this.lawyersService.findAll({ level, department, practiceArea, search });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get lawyer statistics' })
  @ApiResponse({ status: 200, description: 'Lawyer stats' })
  async getStats() {
    return this.lawyersService.getStats();
  }

  @Get('partners')
  @ApiOperation({ summary: 'Get all partners' })
  @ApiResponse({ status: 200, description: 'List of partners' })
  async findPartners() {
    return this.lawyersService.findPartners();
  }

  @Get('by-practice-area/:practiceArea')
  @ApiOperation({ summary: 'Get lawyers by practice area' })
  @ApiResponse({ status: 200, description: 'List of lawyers in practice area' })
  async findByPracticeArea(@Param('practiceArea') practiceArea: string) {
    return this.lawyersService.findByPracticeArea(practiceArea);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a lawyer by ID' })
  @ApiResponse({ status: 200, description: 'Lawyer details' })
  async findOne(@Param('id') id: string) {
    return this.lawyersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a lawyer profile' })
  @ApiResponse({ status: 200, description: 'Lawyer updated' })
  async update(@Param('id') id: string, @Body() updateDto: Partial<CreateLawyerDto>) {
    return this.lawyersService.update(id, updateDto);
  }

  @Post(':id/ranking')
  @ApiOperation({ summary: 'Add previous ranking to lawyer' })
  @ApiResponse({ status: 200, description: 'Ranking added' })
  async addPreviousRanking(
    @Param('id') id: string,
    @Body() ranking: {
      directory: string;
      year: number;
      ranking: string;
      practiceArea: string;
    },
  ) {
    return this.lawyersService.addPreviousRanking(id, ranking);
  }

  @Post(':id/achievement')
  @ApiOperation({ summary: 'Add achievement to lawyer' })
  @ApiResponse({ status: 200, description: 'Achievement added' })
  async addAchievement(@Param('id') id: string, @Body() body: { achievement: string }) {
    return this.lawyersService.addAchievement(id, body.achievement);
  }

  @Post(':id/link-user/:userId')
  @ApiOperation({ summary: 'Link lawyer profile to user account' })
  @ApiResponse({ status: 200, description: 'Lawyer linked to user' })
  async linkToUser(@Param('id') id: string, @Param('userId') userId: string) {
    return this.lawyersService.linkToUser(id, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a lawyer profile (soft delete)' })
  @ApiResponse({ status: 200, description: 'Lawyer deleted' })
  async delete(@Param('id') id: string) {
    await this.lawyersService.delete(id);
    return { message: 'Lawyer deleted successfully' };
  }
}
