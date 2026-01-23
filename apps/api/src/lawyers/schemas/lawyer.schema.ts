import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LawyerDocument = Lawyer & Document;

export enum LawyerLevel {
  PARTNER = 'partner',
  SENIOR_PARTNER = 'senior_partner',
  MANAGING_PARTNER = 'managing_partner',
  COUNSEL = 'counsel',
  SENIOR_ASSOCIATE = 'senior_associate',
  ASSOCIATE = 'associate',
}

export interface PracticeAreaExpertise {
  area: string;
  yearsExperience: number;
  isLead: boolean;
}

export interface DirectoryRanking {
  directory: string;
  year: number;
  ranking: string; // e.g., 'Band 1', 'Tier 2', 'Leading Individual'
  practiceArea: string;
}

@Schema({ timestamps: true })
export class Lawyer {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  phone?: string;

  @Prop({ type: String, enum: LawyerLevel, required: true })
  level: LawyerLevel;

  @Prop({ required: true })
  title: string;

  @Prop({ type: [String], required: true })
  practiceAreas: string[];

  @Prop({ type: [Object] })
  practiceAreaExpertise: PracticeAreaExpertise[];

  @Prop()
  department?: string;

  @Prop()
  admissionYear?: number;

  @Prop()
  bio?: string;

  // Previous directory rankings
  @Prop({ type: [Object] })
  previousRankings: DirectoryRanking[];

  // Education
  @Prop({ type: [String] })
  education: string[];

  // Languages
  @Prop({ type: [String] })
  languages: string[];

  // Notable achievements for submissions
  @Prop({ type: [String] })
  achievements: string[];

  // Link to user account if they have one
  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop()
  deletedAt?: Date;
}

export const LawyerSchema = SchemaFactory.createForClass(Lawyer);

// Indexes
LawyerSchema.index({ email: 1 }, { unique: true });
LawyerSchema.index({ lastName: 1, firstName: 1 });
LawyerSchema.index({ level: 1 });
LawyerSchema.index({ practiceAreas: 1 });
LawyerSchema.index({ department: 1 });
LawyerSchema.index({ deletedAt: 1 });

// Virtual for full name
LawyerSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});
