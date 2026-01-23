import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TemplateDocument = Template & Document;

export enum TemplateType {
  DUNS_100 = 'duns_100',
  CHAMBERS = 'chambers',
  LEGAL_500 = 'legal_500',
  CUSTOM = 'custom',
}

export enum OutputFormat {
  DOCX = 'docx',
  XLSX = 'xlsx',
  PDF = 'pdf',
}

export interface TemplateField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea';
  required: boolean;
  maxLength?: number;
  options?: string[];
  mappedFrom?: string;
}

@Schema({ timestamps: true })
export class Template {
  @Prop({ required: true })
  name: string;

  @Prop({ type: String, enum: TemplateType, required: true })
  type: TemplateType;

  @Prop()
  description?: string;

  @Prop({ type: String, enum: OutputFormat, default: OutputFormat.DOCX })
  outputFormat: OutputFormat;

  @Prop({ type: [Object], required: true })
  fields: TemplateField[];

  @Prop()
  templateFileUrl?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  version: string;
}

export const TemplateSchema = SchemaFactory.createForClass(Template);

TemplateSchema.index({ type: 1, isActive: 1 });
