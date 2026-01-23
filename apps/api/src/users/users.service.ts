import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const user = new this.userModel(createUserDto);
    return user.save();
  }

  async findAll(includeDeleted = false): Promise<UserDocument[]> {
    const query = includeDeleted ? {} : { deletedAt: null };
    return this.userModel.find(query).select('-passwordHash -mfaSecret').exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return this.userModel.findOne({ _id: id, deletedAt: null }).exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase(), deletedAt: null }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument> {
    const user = await this.userModel
      .findOneAndUpdate({ _id: id, deletedAt: null }, updateUserDto, { new: true })
      .select('-passwordHash -mfaSecret')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async softDelete(id: string): Promise<void> {
    const result = await this.userModel.updateOne(
      { _id: id, deletedAt: null },
      { deletedAt: new Date() },
    );

    if (result.modifiedCount === 0) {
      throw new NotFoundException('User not found');
    }
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userModel.updateOne({ _id: id }, { lastLoginAt: new Date() });
  }
}
