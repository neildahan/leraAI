import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Referee, RefereeDocument, RefereeStatus } from './schemas/referee.schema';
import { CreateRefereeDto } from './dto/create-referee.dto';

@Injectable()
export class RefereesService {
  constructor(
    @InjectModel(Referee.name) private refereeModel: Model<RefereeDocument>,
  ) {}

  async create(createDto: CreateRefereeDto, userId: string): Promise<Referee> {
    const referee = new this.refereeModel({
      ...createDto,
      createdBy: new Types.ObjectId(userId),
      matterReferences: createDto.matterReferences?.map(ref => ({
        ...ref,
        matterId: new Types.ObjectId(ref.matterId),
      })) || [],
    });
    return referee.save();
  }

  async findAll(filters?: {
    company?: string;
    status?: RefereeStatus;
    search?: string;
  }): Promise<Referee[]> {
    const query: Record<string, unknown> = { deletedAt: null };

    if (filters?.company) query.company = { $regex: filters.company, $options: 'i' };
    if (filters?.status) query.status = filters.status;
    if (filters?.search) {
      query.$or = [
        { firstName: { $regex: filters.search, $options: 'i' } },
        { lastName: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
        { company: { $regex: filters.search, $options: 'i' } },
      ];
    }

    return this.refereeModel
      .find(query)
      .populate('submissionIds', 'title year')
      .sort({ lastName: 1, firstName: 1 })
      .exec();
  }

  async findOne(id: string): Promise<Referee> {
    const referee = await this.refereeModel
      .findOne({ _id: id, deletedAt: null })
      .populate('submissionIds')
      .populate('createdBy', 'firstName lastName')
      .exec();

    if (!referee) {
      throw new NotFoundException(`Referee with ID ${id} not found`);
    }
    return referee;
  }

  async findByMatter(matterId: string): Promise<Referee[]> {
    return this.refereeModel
      .find({
        deletedAt: null,
        'matterReferences.matterId': new Types.ObjectId(matterId),
      })
      .exec();
  }

  async update(id: string, updateDto: Partial<CreateRefereeDto>): Promise<Referee> {
    const referee = await this.refereeModel
      .findOneAndUpdate(
        { _id: id, deletedAt: null },
        { $set: updateDto },
        { new: true },
      )
      .exec();

    if (!referee) {
      throw new NotFoundException(`Referee with ID ${id} not found`);
    }
    return referee;
  }

  async addMatterReference(
    id: string,
    matterRef: {
      matterId: string;
      matterTitle: string;
      relationship: string;
      canDiscuss: string[];
    },
  ): Promise<Referee | null> {
    return this.refereeModel
      .findByIdAndUpdate(
        id,
        {
          $push: {
            matterReferences: {
              ...matterRef,
              matterId: new Types.ObjectId(matterRef.matterId),
            },
          },
        },
        { new: true },
      )
      .exec();
  }

  async removeMatterReference(id: string, matterId: string): Promise<Referee | null> {
    return this.refereeModel
      .findByIdAndUpdate(
        id,
        { $pull: { matterReferences: { matterId: new Types.ObjectId(matterId) } } },
        { new: true },
      )
      .exec();
  }

  async updateStatus(id: string, status: RefereeStatus, declinedReason?: string): Promise<Referee | null> {
    const updateData: Record<string, unknown> = { status };

    if (status === RefereeStatus.CONTACTED) {
      updateData.contactedAt = new Date();
    }
    if (status === RefereeStatus.CONFIRMED) {
      updateData.confirmedAt = new Date();
    }
    if (status === RefereeStatus.DECLINED && declinedReason) {
      updateData.declinedReason = declinedReason;
    }

    return this.refereeModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .exec();
  }

  async linkToSubmission(id: string, submissionId: string): Promise<Referee | null> {
    return this.refereeModel
      .findByIdAndUpdate(
        id,
        { $addToSet: { submissionIds: new Types.ObjectId(submissionId) } },
        { new: true },
      )
      .exec();
  }

  async delete(id: string): Promise<void> {
    const result = await this.refereeModel
      .findByIdAndUpdate(id, { $set: { deletedAt: new Date() } })
      .exec();

    if (!result) {
      throw new NotFoundException(`Referee with ID ${id} not found`);
    }
  }

  async exportToSpreadsheet(submissionId: string): Promise<{
    headers: string[];
    rows: string[][];
  }> {
    const referees = await this.refereeModel
      .find({
        deletedAt: null,
        submissionIds: new Types.ObjectId(submissionId),
      })
      .exec();

    const headers = [
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Company',
      'Title',
      'Position',
      'Relationship Type',
      'Years Known',
      'Matters They Can Discuss',
      'Speaking Points',
      'Status',
    ];

    const rows = referees.map(ref => [
      ref.firstName,
      ref.lastName,
      ref.email,
      ref.phone || '',
      ref.company,
      ref.title || '',
      ref.position || '',
      ref.relationshipType || '',
      ref.relationshipYears?.toString() || '',
      ref.matterReferences?.map(m => m.matterTitle).join('; ') || '',
      ref.speakingPoints?.join('; ') || '',
      ref.status,
    ]);

    return { headers, rows };
  }
}
