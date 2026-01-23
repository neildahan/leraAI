import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RefereeDocument = Referee & Document;

export enum RefereeStatus {
  PENDING = 'pending',
  CONTACTED = 'contacted',
  CONFIRMED = 'confirmed',
  DECLINED = 'declined',
}

export interface MatterReference {
  matterId: Types.ObjectId;
  matterTitle: string;
  relationship: string;
  canDiscuss: string[];
}

@Schema({ timestamps: true })
export class Referee {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  phone?: string;

  @Prop({ required: true })
  company: string;

  @Prop()
  title?: string;

  @Prop()
  position?: string;

  // Relationship to the firm
  @Prop()
  relationshipType?: string; // e.g., 'client', 'co-counsel', 'opposing counsel'

  @Prop()
  relationshipYears?: number;

  // Matters this referee can speak about
  @Prop({ type: [Object] })
  matterReferences: MatterReference[];

  // What they can speak to
  @Prop({ type: [String] })
  speakingPoints: string[];

  // Contact status
  @Prop({ type: String, enum: RefereeStatus, default: RefereeStatus.PENDING })
  status: RefereeStatus;

  @Prop()
  contactedAt?: Date;

  @Prop()
  confirmedAt?: Date;

  @Prop()
  declinedReason?: string;

  // Linked to which submissions
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Submission' }] })
  submissionIds: Types.ObjectId[];

  // Notes
  @Prop()
  notes?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop()
  deletedAt?: Date;
}

export const RefereeSchema = SchemaFactory.createForClass(Referee);

// Indexes
RefereeSchema.index({ email: 1 });
RefereeSchema.index({ company: 1 });
RefereeSchema.index({ status: 1 });
RefereeSchema.index({ lastName: 1, firstName: 1 });
RefereeSchema.index({ createdBy: 1 });
RefereeSchema.index({ deletedAt: 1 });
