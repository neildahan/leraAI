import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Lawyer, LawyerDocument, LawyerLevel } from './schemas/lawyer.schema';
import { CreateLawyerDto } from './dto/create-lawyer.dto';

@Injectable()
export class LawyersService {
  constructor(
    @InjectModel(Lawyer.name) private lawyerModel: Model<LawyerDocument>,
  ) {}

  async create(createDto: CreateLawyerDto, userId: string): Promise<Lawyer> {
    // Check if email already exists
    const existing = await this.lawyerModel.findOne({ email: createDto.email, deletedAt: null });
    if (existing) {
      throw new ConflictException('Lawyer with this email already exists');
    }

    const lawyer = new this.lawyerModel({
      ...createDto,
      createdBy: new Types.ObjectId(userId),
    });
    return lawyer.save();
  }

  async findAll(filters?: {
    level?: LawyerLevel;
    department?: string;
    practiceArea?: string;
    search?: string;
  }): Promise<Lawyer[]> {
    const query: Record<string, unknown> = { deletedAt: null };

    if (filters?.level) query.level = filters.level;
    if (filters?.department) query.department = filters.department;
    if (filters?.practiceArea) query.practiceAreas = filters.practiceArea;
    if (filters?.search) {
      query.$or = [
        { firstName: { $regex: filters.search, $options: 'i' } },
        { lastName: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
      ];
    }

    return this.lawyerModel
      .find(query)
      .sort({ level: 1, lastName: 1, firstName: 1 })
      .exec();
  }

  async findOne(id: string): Promise<Lawyer> {
    const lawyer = await this.lawyerModel
      .findOne({ _id: id, deletedAt: null })
      .exec();

    if (!lawyer) {
      throw new NotFoundException(`Lawyer with ID ${id} not found`);
    }
    return lawyer;
  }

  async findByEmail(email: string): Promise<Lawyer | null> {
    return this.lawyerModel.findOne({ email, deletedAt: null }).exec();
  }

  async findPartners(): Promise<Lawyer[]> {
    return this.lawyerModel
      .find({
        deletedAt: null,
        level: {
          $in: [LawyerLevel.PARTNER, LawyerLevel.SENIOR_PARTNER, LawyerLevel.MANAGING_PARTNER],
        },
      })
      .sort({ lastName: 1, firstName: 1 })
      .exec();
  }

  async findByPracticeArea(practiceArea: string): Promise<Lawyer[]> {
    return this.lawyerModel
      .find({
        deletedAt: null,
        practiceAreas: practiceArea,
      })
      .sort({ level: 1, lastName: 1 })
      .exec();
  }

  async update(id: string, updateDto: Partial<CreateLawyerDto>): Promise<Lawyer> {
    const lawyer = await this.lawyerModel
      .findOneAndUpdate(
        { _id: id, deletedAt: null },
        { $set: updateDto },
        { new: true },
      )
      .exec();

    if (!lawyer) {
      throw new NotFoundException(`Lawyer with ID ${id} not found`);
    }
    return lawyer;
  }

  async addPreviousRanking(
    id: string,
    ranking: {
      directory: string;
      year: number;
      ranking: string;
      practiceArea: string;
    },
  ): Promise<Lawyer | null> {
    return this.lawyerModel
      .findByIdAndUpdate(
        id,
        { $push: { previousRankings: ranking } },
        { new: true },
      )
      .exec();
  }

  async addAchievement(id: string, achievement: string): Promise<Lawyer | null> {
    return this.lawyerModel
      .findByIdAndUpdate(
        id,
        { $addToSet: { achievements: achievement } },
        { new: true },
      )
      .exec();
  }

  async linkToUser(id: string, userId: string): Promise<Lawyer | null> {
    return this.lawyerModel
      .findByIdAndUpdate(
        id,
        { $set: { userId: new Types.ObjectId(userId) } },
        { new: true },
      )
      .exec();
  }

  async delete(id: string): Promise<void> {
    const result = await this.lawyerModel
      .findByIdAndUpdate(id, { $set: { deletedAt: new Date() } })
      .exec();

    if (!result) {
      throw new NotFoundException(`Lawyer with ID ${id} not found`);
    }
  }

  async getStats(): Promise<{
    total: number;
    byLevel: Record<string, number>;
    byDepartment: Record<string, number>;
    byPracticeArea: Record<string, number>;
  }> {
    const lawyers = await this.lawyerModel.find({ deletedAt: null }).exec();

    const byLevel: Record<string, number> = {};
    const byDepartment: Record<string, number> = {};
    const byPracticeArea: Record<string, number> = {};

    lawyers.forEach(lawyer => {
      byLevel[lawyer.level] = (byLevel[lawyer.level] || 0) + 1;
      if (lawyer.department) {
        byDepartment[lawyer.department] = (byDepartment[lawyer.department] || 0) + 1;
      }
      lawyer.practiceAreas.forEach(area => {
        byPracticeArea[area] = (byPracticeArea[area] || 0) + 1;
      });
    });

    return {
      total: lawyers.length,
      byLevel,
      byDepartment,
      byPracticeArea,
    };
  }
}
