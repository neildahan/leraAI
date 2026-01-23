import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

export enum AuditAction {
  // Authentication
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  LOGIN_FAILED = 'LOGIN_FAILED',

  // Document operations
  DOCUMENT_ACCESS = 'DOCUMENT_ACCESS',
  DOCUMENT_DOWNLOAD = 'DOCUMENT_DOWNLOAD',

  // AI operations
  AI_SYNTHESIS = 'AI_SYNTHESIS',
  AI_EXTRACTION = 'AI_EXTRACTION',
  AI_SCORING = 'AI_SCORING',

  // Export operations
  EXPORT_GENERATED = 'EXPORT_GENERATED',
  EXPORT_DOWNLOADED = 'EXPORT_DOWNLOADED',

  // User management
  USER_CREATE = 'USER_CREATE',
  USER_UPDATE = 'USER_UPDATE',
  USER_DELETE = 'USER_DELETE',

  // Matter operations
  MATTER_CREATE = 'MATTER_CREATE',
  MATTER_UPDATE = 'MATTER_UPDATE',
  MATTER_APPROVE = 'MATTER_APPROVE',
  MATTER_REJECT = 'MATTER_REJECT',
}

export enum ResourceType {
  MATTER = 'MATTER',
  DOCUMENT = 'DOCUMENT',
  TEMPLATE = 'TEMPLATE',
  USER = 'USER',
  SYSTEM = 'SYSTEM',
}

@Schema({ timestamps: { createdAt: 'timestamp', updatedAt: false } })
export class AuditLog {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: String, enum: AuditAction, required: true, index: true })
  action: AuditAction;

  @Prop({ type: String, enum: ResourceType })
  resourceType?: ResourceType;

  @Prop({ index: true })
  resourceId?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop()
  ipAddress?: string;

  @Prop()
  userAgent?: string;

  @Prop({ type: Date, default: Date.now, index: true })
  timestamp: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

// Compound indexes for common queries
AuditLogSchema.index({ action: 1, timestamp: -1 });
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ resourceType: 1, resourceId: 1, timestamp: -1 });

// Make collection immutable (cannot update or delete documents)
AuditLogSchema.pre('updateOne', function () {
  throw new Error('Audit logs are immutable');
});

AuditLogSchema.pre('deleteOne', function () {
  throw new Error('Audit logs cannot be deleted');
});

AuditLogSchema.pre('deleteMany', function () {
  throw new Error('Audit logs cannot be deleted');
});
