import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from './audit.service';
import { AuditAction, ResourceType } from './schemas/audit-log.schema';

interface AuditableRoute {
  method: string;
  path: RegExp;
  action: AuditAction;
  resourceType: ResourceType;
  extractResourceId?: (req: any) => string | undefined;
}

const AUDITABLE_ROUTES: AuditableRoute[] = [
  // AI operations
  {
    method: 'POST',
    path: /^\/api\/synthesis\/extract/,
    action: AuditAction.AI_EXTRACTION,
    resourceType: ResourceType.DOCUMENT,
    extractResourceId: (req) => req.body?.documentId,
  },
  {
    method: 'POST',
    path: /^\/api\/synthesis\/generate/,
    action: AuditAction.AI_SYNTHESIS,
    resourceType: ResourceType.MATTER,
    extractResourceId: (req) => req.body?.matterId,
  },
  {
    method: 'GET',
    path: /^\/api\/synthesis\/score\/(.+)/,
    action: AuditAction.AI_SCORING,
    resourceType: ResourceType.MATTER,
    extractResourceId: (req) => req.params?.matterId,
  },
  // Document access
  {
    method: 'GET',
    path: /^\/api\/imanage\/documents\/(.+)/,
    action: AuditAction.DOCUMENT_ACCESS,
    resourceType: ResourceType.DOCUMENT,
    extractResourceId: (req) => req.params?.id,
  },
  // Export operations
  {
    method: 'POST',
    path: /^\/api\/templates\/(.+)\/generate/,
    action: AuditAction.EXPORT_GENERATED,
    resourceType: ResourceType.TEMPLATE,
    extractResourceId: (req) => req.params?.id,
  },
  {
    method: 'GET',
    path: /^\/api\/exports\/(.+)\/download/,
    action: AuditAction.EXPORT_DOWNLOADED,
    resourceType: ResourceType.TEMPLATE,
    extractResourceId: (req) => req.params?.id,
  },
];

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, path, user, ip, headers } = request;

    // Find matching auditable route
    const auditableRoute = AUDITABLE_ROUTES.find(
      (route) => route.method === method && route.path.test(path),
    );

    if (!auditableRoute || !user) {
      return next.handle();
    }

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: (response) => {
          const duration = Date.now() - startTime;

          this.auditService.log({
            userId: user.userId,
            action: auditableRoute.action,
            resourceType: auditableRoute.resourceType,
            resourceId: auditableRoute.extractResourceId?.(request),
            metadata: {
              method,
              path,
              duration,
              success: true,
              responseSize: JSON.stringify(response || {}).length,
            },
            ipAddress: ip,
            userAgent: headers['user-agent'],
          });
        },
        error: (error) => {
          const duration = Date.now() - startTime;

          this.auditService.log({
            userId: user.userId,
            action: auditableRoute.action,
            resourceType: auditableRoute.resourceType,
            resourceId: auditableRoute.extractResourceId?.(request),
            metadata: {
              method,
              path,
              duration,
              success: false,
              error: error.message,
            },
            ipAddress: ip,
            userAgent: headers['user-agent'],
          });
        },
      }),
    );
  }
}
