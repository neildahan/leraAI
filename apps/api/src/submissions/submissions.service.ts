import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Submission, SubmissionDocument, SubmissionStatus, TargetDirectory } from './schemas/submission.schema';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';

@Injectable()
export class SubmissionsService {
  constructor(
    @InjectModel(Submission.name) private submissionModel: Model<SubmissionDocument>,
  ) {}

  async create(createDto: CreateSubmissionDto, userId: string): Promise<Submission> {
    const submission = new this.submissionModel({
      ...createDto,
      year: createDto.year || new Date().getFullYear(),
      createdBy: new Types.ObjectId(userId),
      matterIds: createDto.matterIds?.map(id => new Types.ObjectId(id)) || [],
      targetLawyerId: createDto.targetLawyerId ? new Types.ObjectId(createDto.targetLawyerId) : undefined,
    });
    return submission.save();
  }

  async findAll(userId: string, filters?: {
    status?: SubmissionStatus;
    rankingType?: string;
    year?: number;
  }): Promise<Submission[]> {
    const query: Record<string, unknown> = { deletedAt: null };

    if (filters?.status) query.status = filters.status;
    if (filters?.rankingType) query.rankingType = filters.rankingType;
    if (filters?.year) query.year = filters.year;

    return this.submissionModel
      .find(query)
      .populate('matterIds', 'title clientName dealValue status')
      .populate('refereeIds', 'firstName lastName company')
      .populate('targetLawyerId', 'firstName lastName title')
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Submission> {
    const submission = await this.submissionModel
      .findOne({ _id: id, deletedAt: null })
      .populate('matterIds')
      .populate('refereeIds')
      .populate('targetLawyerId')
      .populate('createdBy', 'firstName lastName')
      .populate('assignedTo', 'firstName lastName')
      .populate('reviewers', 'firstName lastName')
      .exec();

    if (!submission) {
      throw new NotFoundException(`Submission with ID ${id} not found`);
    }
    return submission;
  }

  async update(id: string, updateDto: UpdateSubmissionDto): Promise<Submission> {
    const updateData: Record<string, unknown> = { ...updateDto };

    if (updateDto.matterIds) {
      updateData.matterIds = updateDto.matterIds.map(mid => new Types.ObjectId(mid));
    }
    if (updateDto.refereeIds) {
      updateData.refereeIds = updateDto.refereeIds.map(rid => new Types.ObjectId(rid));
    }
    if (updateDto.targetLawyerId) {
      updateData.targetLawyerId = new Types.ObjectId(updateDto.targetLawyerId);
    }
    if (updateDto.assignedTo) {
      updateData.assignedTo = new Types.ObjectId(updateDto.assignedTo);
    }
    if (updateDto.reviewers) {
      updateData.reviewers = updateDto.reviewers.map(rid => new Types.ObjectId(rid));
    }

    const submission = await this.submissionModel
      .findOneAndUpdate(
        { _id: id, deletedAt: null },
        { $set: updateData },
        { new: true },
      )
      .exec();

    if (!submission) {
      throw new NotFoundException(`Submission with ID ${id} not found`);
    }
    return submission;
  }

  async addMatters(id: string, matterIds: string[]): Promise<Submission | null> {
    const submission = await this.findOne(id);
    const currentMatterCount = submission.matterIds?.length || 0;

    if (currentMatterCount + matterIds.length > 20) {
      throw new BadRequestException('Cannot exceed 20 matters per submission');
    }

    return this.submissionModel
      .findByIdAndUpdate(
        id,
        { $addToSet: { matterIds: { $each: matterIds.map(mid => new Types.ObjectId(mid)) } } },
        { new: true },
      )
      .exec();
  }

  async removeMatters(id: string, matterIds: string[]): Promise<Submission | null> {
    return this.submissionModel
      .findByIdAndUpdate(
        id,
        { $pull: { matterIds: { $in: matterIds.map(mid => new Types.ObjectId(mid)) } } },
        { new: true },
      )
      .exec();
  }

  async addReferees(id: string, refereeIds: string[]): Promise<Submission | null> {
    return this.submissionModel
      .findByIdAndUpdate(
        id,
        { $addToSet: { refereeIds: { $each: refereeIds.map(rid => new Types.ObjectId(rid)) } } },
        { new: true },
      )
      .exec();
  }

  async updateDirectoryContent(
    id: string,
    directory: TargetDirectory,
    content: {
      overview: string;
      keyAchievements: string[];
      marketPosition: string;
    },
    userId: string,
  ): Promise<Submission | null> {
    const submission = await this.findOne(id);

    const existingIndex = submission.directoryContents?.findIndex(
      dc => dc.directory === directory
    ) ?? -1;

    const directoryContent = {
      directory,
      ...content,
      generatedAt: new Date(),
      editedAt: new Date(),
      editedBy: new Types.ObjectId(userId),
    };

    if (existingIndex >= 0) {
      return this.submissionModel
        .findByIdAndUpdate(
          id,
          { $set: { [`directoryContents.${existingIndex}`]: directoryContent } },
          { new: true },
        )
        .exec();
    } else {
      return this.submissionModel
        .findByIdAndUpdate(
          id,
          { $push: { directoryContents: directoryContent } },
          { new: true },
        )
        .exec();
    }
  }

  async updateStatus(id: string, status: SubmissionStatus, userId?: string): Promise<Submission | null> {
    const updateData: Record<string, unknown> = { status };

    if (status === SubmissionStatus.APPROVED && userId) {
      updateData.approvedAt = new Date();
      updateData.approvedBy = new Types.ObjectId(userId);
    }
    if (status === SubmissionStatus.EXPORTED) {
      updateData.exportedAt = new Date();
    }
    if (status === SubmissionStatus.SUBMITTED) {
      updateData.submittedAt = new Date();
    }

    return this.submissionModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .exec();
  }

  async delete(id: string): Promise<void> {
    const result = await this.submissionModel
      .findByIdAndUpdate(id, { $set: { deletedAt: new Date() } })
      .exec();

    if (!result) {
      throw new NotFoundException(`Submission with ID ${id} not found`);
    }
  }

  async getStats(userId: string): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byRankingType: Record<string, number>;
    byDirectory: Record<string, number>;
  }> {
    const submissions = await this.submissionModel.find({ deletedAt: null }).exec();

    const byStatus: Record<string, number> = {};
    const byRankingType: Record<string, number> = {};
    const byDirectory: Record<string, number> = {};

    submissions.forEach(sub => {
      byStatus[sub.status] = (byStatus[sub.status] || 0) + 1;
      byRankingType[sub.rankingType] = (byRankingType[sub.rankingType] || 0) + 1;
      sub.targetDirectories.forEach(dir => {
        byDirectory[dir] = (byDirectory[dir] || 0) + 1;
      });
    });

    return {
      total: submissions.length,
      byStatus,
      byRankingType,
      byDirectory,
    };
  }
}
