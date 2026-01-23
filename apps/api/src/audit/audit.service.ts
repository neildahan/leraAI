import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuditLog, AuditLogDocument, AuditAction, ResourceType } from './schemas/audit-log.schema';

export interface AuditLogEntry {
  userId: string;
  action: AuditAction;
  resourceType?: ResourceType;
  resourceId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditQueryParams {
  userId?: string;
  action?: AuditAction;
  resourceType?: ResourceType;
  resourceId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectModel(AuditLog.name)
    private readonly auditLogModel: Model<AuditLogDocument>,
  ) {}

  async log(entry: AuditLogEntry): Promise<void> {
    try {
      await this.auditLogModel.create({
        ...entry,
        userId: new Types.ObjectId(entry.userId),
        timestamp: new Date(),
      });
    } catch (error) {
      // Log error but don't fail the main operation
      this.logger.error('Failed to create audit log entry', error);
    }
  }

  async query(params: AuditQueryParams): Promise<{
    logs: AuditLogDocument[];
    total: number;
  }> {
    const query: any = {};

    if (params.userId) {
      query.userId = new Types.ObjectId(params.userId);
    }
    if (params.action) {
      query.action = params.action;
    }
    if (params.resourceType) {
      query.resourceType = params.resourceType;
    }
    if (params.resourceId) {
      query.resourceId = params.resourceId;
    }
    if (params.startDate || params.endDate) {
      query.timestamp = {};
      if (params.startDate) {
        query.timestamp.$gte = params.startDate;
      }
      if (params.endDate) {
        query.timestamp.$lte = params.endDate;
      }
    }

    const limit = params.limit || 50;
    const offset = params.offset || 0;

    const [logs, total] = await Promise.all([
      this.auditLogModel
        .find(query)
        .sort({ timestamp: -1 })
        .skip(offset)
        .limit(limit)
        .populate('userId', 'email firstName lastName')
        .exec(),
      this.auditLogModel.countDocuments(query),
    ]);

    return { logs, total };
  }

  async getRecentActivity(userId: string, limit = 10): Promise<AuditLogDocument[]> {
    return this.auditLogModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }

  async getAIOperations(params: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<AuditLogDocument[]> {
    const query: any = {
      action: {
        $in: [AuditAction.AI_SYNTHESIS, AuditAction.AI_EXTRACTION, AuditAction.AI_SCORING],
      },
    };

    if (params.startDate || params.endDate) {
      query.timestamp = {};
      if (params.startDate) {
        query.timestamp.$gte = params.startDate;
      }
      if (params.endDate) {
        query.timestamp.$lte = params.endDate;
      }
    }

    return this.auditLogModel
      .find(query)
      .sort({ timestamp: -1 })
      .limit(params.limit || 100)
      .populate('userId', 'email firstName lastName')
      .exec();
  }
}
