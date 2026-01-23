import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AuditModule } from './audit/audit.module';
import { MattersModule } from './matters/matters.module';
import { SynthesisModule } from './synthesis/synthesis.module';
import { ImanageModule } from './imanage/imanage.module';
import { TemplatesModule } from './templates/templates.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { RefereesModule } from './referees/referees.module';
import { LawyersModule } from './lawyers/lawyers.module';
import { AuditInterceptor } from './audit/audit.interceptor';
import { HealthController } from './health.controller';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),

    // MongoDB connection
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        autoIndex: configService.get<string>('NODE_ENV') !== 'production',
      }),
      inject: [ConfigService],
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: configService.get<number>('RATE_LIMIT_WINDOW_MS', 900000),
            limit: configService.get<number>('RATE_LIMIT_MAX_REQUESTS', 100),
          },
        ],
      }),
      inject: [ConfigService],
    }),

    // Feature modules
    AuthModule,
    UsersModule,
    AuditModule,
    MattersModule,
    SynthesisModule,
    ImanageModule,
    TemplatesModule,
    SubmissionsModule,
    RefereesModule,
    LawyersModule,
  ],
  controllers: [HealthController],
  providers: [
    // Global rate limiting guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Global audit logging interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule {}
