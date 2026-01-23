import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ExportDocument = Export & Document;

export enum ExportStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Schema({ timestamps: true })
export class Export {
  @Prop({ type: Types.ObjectId, ref: 'Template', required: true })
  templateId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Matter', required: true })
  matterId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: String, enum: ExportStatus, default: ExportStatus.PENDING })
  status: ExportStatus;

  @Prop()
  fileName?: string;

  @Prop()
  fileUrl?: string;

  @Prop()
  fileSize?: number;

  @Prop({ type: Object })
  fieldValues?: Record<string, any>;

  @Prop()
  errorMessage?: string;

  @Prop()
  completedAt?: Date;

  @Prop()
  downloadedAt?: Date;
}

export const ExportSchema = SchemaFactory.createForClass(Export);

ExportSchema.index({ matterId: 1 });
ExportSchema.index({ createdBy: 1, createdAt: -1 });
ExportSchema.index({ status: 1 });
