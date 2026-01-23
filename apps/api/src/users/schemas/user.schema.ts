import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  ADMIN = 'admin',
  PARTNER = 'partner',
  ASSOCIATE = 'associate',
  VIEWER = 'viewer',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ trim: true })
  firstName?: string;

  @Prop({ trim: true })
  lastName?: string;

  @Prop({ type: String, enum: UserRole, default: UserRole.VIEWER })
  role: UserRole;

  @Prop({ default: false })
  mfaEnabled: boolean;

  @Prop()
  mfaSecret?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  lastLoginAt?: Date;

  @Prop()
  deletedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1 });
UserSchema.index({ deletedAt: 1 });

// Virtual for full name
UserSchema.virtual('fullName').get(function (this: UserDocument) {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.firstName || this.lastName || this.email;
});

// Ensure virtuals are included in JSON output
UserSchema.set('toJSON', {
  virtuals: true,
  transform: function (_doc, ret) {
    const result = { ...ret } as Record<string, unknown>;
    delete result.passwordHash;
    delete result.mfaSecret;
    delete result.__v;
    return result;
  },
});
