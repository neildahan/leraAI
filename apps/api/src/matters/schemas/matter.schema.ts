import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MatterDocument = Matter & Document;

export enum MatterStatus {
  DRAFT = 'draft',
  REVIEW = 'review',
  APPROVED = 'approved',
  EXPORTED = 'exported',
}

export interface DealValue {
  amount: number;
  currency: string;
  isEstimated: boolean;
}

export interface SynthesizedData {
  description: string;
  keyAchievements: string[];
  legalNovelty: string;
  practiceAreas: string[];
  generatedAt: Date;
  modelUsed: string;
}

// Opposing counsel - other law firms involved in the matter
export interface OpposingCounsel {
  firmName: string;           // Law firm name
  representedParty: string;   // Party they represented
  practiceArea?: string;      // Practice area
}

@Schema({ timestamps: true })
export class Matter {
  @Prop({ required: true })
  title: string;

  @Prop()
  imanageId?: string;

  @Prop()
  imanageWorkspaceId?: string;

  @Prop({ type: String, enum: MatterStatus, default: MatterStatus.DRAFT, index: true })
  status: MatterStatus;

  @Prop()
  clientName?: string;

  @Prop({ type: [String] })
  counterparties?: string[];

  // Opposing counsel - other law firms involved
  @Prop({ type: [Object] })
  opposingCounsel?: OpposingCounsel[];

  // Detailed description of services provided
  @Prop()
  serviceDescription?: string;

  @Prop()
  practiceArea?: string;

  @Prop({ type: Object })
  dealValue?: DealValue;

  @Prop()
  completionDate?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  leadPartner?: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  teamMembers?: Types.ObjectId[];

  @Prop({ type: Object })
  synthesizedData?: SynthesizedData;

  @Prop({ min: 0, max: 100 })
  confidenceScore?: number;

  @Prop({ min: 0, max: 100 })
  submissionScore?: number;

  @Prop({ type: [String] })
  documentIds?: string[];

  @Prop()
  notes?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop()
  approvedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  approvedBy?: Types.ObjectId;

  @Prop()
  exportedAt?: Date;

  @Prop()
  deletedAt?: Date;
}

export const MatterSchema = SchemaFactory.createForClass(Matter);

// Indexes
MatterSchema.index({ status: 1, createdAt: -1 });
MatterSchema.index({ leadPartner: 1 });
MatterSchema.index({ imanageId: 1 });
MatterSchema.index({ clientName: 'text', title: 'text' });
MatterSchema.index({ deletedAt: 1 });
