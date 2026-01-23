import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SubmissionDocument = Submission & Document;

export enum RankingType {
  FIRM = 'firm',
  DEPARTMENT = 'department',
  LAWYER = 'lawyer',
}

export enum TargetDirectory {
  CHAMBERS = 'chambers',
  LEGAL_500 = 'legal_500',
  DUNS_100 = 'duns_100',
}

export enum SubmissionStatus {
  DRAFT = 'draft',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  APPROVED = 'approved',
  EXPORTED = 'exported',
  SUBMITTED = 'submitted',
}

export interface DirectoryContent {
  directory: TargetDirectory;
  overview: string;
  keyAchievements: string[];
  marketPosition: string;
  generatedAt: Date;
  editedAt?: Date;
  editedBy?: Types.ObjectId;
}

export interface LawyerAttribution {
  lawyerId: Types.ObjectId;
  name: string;
  role: 'lead' | 'supporting' | 'contributor';
  title: string;
  practiceArea: string;
}

@Schema({ timestamps: true })
export class Submission {
  @Prop({ required: true })
  title: string;

  @Prop({ type: String, enum: RankingType, required: true, index: true })
  rankingType: RankingType;

  @Prop({ type: [String], enum: TargetDirectory, required: true })
  targetDirectories: TargetDirectory[];

  @Prop({ type: String, enum: SubmissionStatus, default: SubmissionStatus.DRAFT, index: true })
  status: SubmissionStatus;

  @Prop()
  year: number;

  // For department ranking
  @Prop()
  departmentName?: string;

  @Prop()
  practiceArea?: string;

  // For lawyer ranking
  @Prop({ type: Types.ObjectId, ref: 'Lawyer' })
  targetLawyerId?: Types.ObjectId;

  // Linked matters (up to 20)
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Matter' }] })
  matterIds: Types.ObjectId[];

  // Linked referees
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Referee' }] })
  refereeIds: Types.ObjectId[];

  // AI-generated content per directory
  @Prop({ type: [Object] })
  directoryContents: DirectoryContent[];

  // Lawyer attributions across all matters
  @Prop({ type: [Object] })
  lawyerAttributions: LawyerAttribution[];

  // Workflow
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assignedTo?: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  reviewers: Types.ObjectId[];

  @Prop()
  submissionDeadline?: Date;

  @Prop()
  approvedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  approvedBy?: Types.ObjectId;

  @Prop()
  exportedAt?: Date;

  @Prop()
  submittedAt?: Date;

  @Prop()
  notes?: string;

  @Prop()
  deletedAt?: Date;
}

export const SubmissionSchema = SchemaFactory.createForClass(Submission);

// Indexes
SubmissionSchema.index({ status: 1, createdAt: -1 });
SubmissionSchema.index({ rankingType: 1 });
SubmissionSchema.index({ targetDirectories: 1 });
SubmissionSchema.index({ year: 1 });
SubmissionSchema.index({ createdBy: 1 });
SubmissionSchema.index({ deletedAt: 1 });
