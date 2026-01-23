import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Matter, MatterDocument, MatterStatus } from './schemas/matter.schema';
import { CreateMatterDto } from './dto/create-matter.dto';
import { UpdateMatterDto } from './dto/update-matter.dto';

@Injectable()
export class MattersService {
  constructor(@InjectModel(Matter.name) private readonly matterModel: Model<MatterDocument>) {}

  async create(createMatterDto: CreateMatterDto, userId: string): Promise<MatterDocument> {
    const matter = new this.matterModel({
      ...createMatterDto,
      createdBy: new Types.ObjectId(userId),
      status: MatterStatus.DRAFT,
    });
    return matter.save();
  }

  async findAll(params: {
    status?: MatterStatus;
    leadPartner?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ matters: MatterDocument[]; total: number }> {
    const query: any = { deletedAt: null };

    if (params.status) {
      query.status = params.status;
    }
    if (params.leadPartner) {
      query.leadPartner = new Types.ObjectId(params.leadPartner);
    }
    if (params.search) {
      query.$text = { $search: params.search };
    }

    const limit = params.limit || 20;
    const offset = params.offset || 0;

    const [matters, total] = await Promise.all([
      this.matterModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .populate('leadPartner', 'email firstName lastName')
        .populate('createdBy', 'email firstName lastName')
        .exec(),
      this.matterModel.countDocuments(query),
    ]);

    return { matters, total };
  }

  async findById(id: string): Promise<MatterDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Matter not found');
    }

    const matter = await this.matterModel
      .findOne({ _id: id, deletedAt: null })
      .populate('leadPartner', 'email firstName lastName')
      .populate('teamMembers', 'email firstName lastName')
      .populate('createdBy', 'email firstName lastName')
      .populate('approvedBy', 'email firstName lastName')
      .exec();

    if (!matter) {
      throw new NotFoundException('Matter not found');
    }
    return matter;
  }

  async update(id: string, updateMatterDto: UpdateMatterDto): Promise<MatterDocument> {
    const matter = await this.matterModel
      .findOneAndUpdate({ _id: id, deletedAt: null }, updateMatterDto, { new: true })
      .exec();

    if (!matter) {
      throw new NotFoundException('Matter not found');
    }
    return matter;
  }

  async updateStatus(
    id: string,
    status: MatterStatus,
    userId?: string,
  ): Promise<MatterDocument> {
    const updateData: any = { status };

    if (status === MatterStatus.APPROVED && userId) {
      updateData.approvedAt = new Date();
      updateData.approvedBy = new Types.ObjectId(userId);
    }
    if (status === MatterStatus.EXPORTED) {
      updateData.exportedAt = new Date();
    }

    const matter = await this.matterModel
      .findOneAndUpdate({ _id: id, deletedAt: null }, updateData, { new: true })
      .exec();

    if (!matter) {
      throw new NotFoundException('Matter not found');
    }
    return matter;
  }

  async updateSynthesizedData(
    id: string,
    synthesizedData: any,
    confidenceScore: number,
  ): Promise<MatterDocument> {
    const matter = await this.matterModel
      .findOneAndUpdate(
        { _id: id, deletedAt: null },
        { synthesizedData, confidenceScore },
        { new: true },
      )
      .exec();

    if (!matter) {
      throw new NotFoundException('Matter not found');
    }
    return matter;
  }

  async softDelete(id: string): Promise<void> {
    const result = await this.matterModel.updateOne(
      { _id: id, deletedAt: null },
      { deletedAt: new Date() },
    );

    if (result.modifiedCount === 0) {
      throw new NotFoundException('Matter not found');
    }
  }

  async getStatistics(): Promise<{
    total: number;
    byStatus: Record<MatterStatus, number>;
    pendingReview: number;
    exportedThisMonth: number;
  }> {
    const [total, byStatusResults, pendingReview, exportedThisMonth] = await Promise.all([
      this.matterModel.countDocuments({ deletedAt: null }),
      this.matterModel.aggregate([
        { $match: { deletedAt: null } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      this.matterModel.countDocuments({ status: MatterStatus.REVIEW, deletedAt: null }),
      this.matterModel.countDocuments({
        status: MatterStatus.EXPORTED,
        exportedAt: { $gte: new Date(new Date().setDate(1)) },
        deletedAt: null,
      }),
    ]);

    const byStatus = byStatusResults.reduce(
      (acc, { _id, count }) => {
        acc[_id as MatterStatus] = count;
        return acc;
      },
      {} as Record<MatterStatus, number>,
    );

    return { total, byStatus, pendingReview, exportedThisMonth };
  }
}
