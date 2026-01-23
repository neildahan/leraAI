import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ImanageWorkspace {
  id: string;
  name: string;
  description?: string;
  createdDate: string;
  modifiedDate: string;
  owner: string;
}

export interface ImanageDocument {
  id: string;
  name: string;
  extension: string;
  size: number;
  version: number;
  author: string;
  createdDate: string;
  modifiedDate: string;
  workspaceId: string;
  folderId?: string;
}

export interface ImanageConnectionStatus {
  connected: boolean;
  user?: string;
  expiresAt?: Date;
}

@Injectable()
export class ImanageService {
  private readonly logger = new Logger(ImanageService.name);
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly baseUrl: string;
  private readonly redirectUri: string;

  // In-memory token storage (would be per-user session in production)
  private tokens: Map<string, { accessToken: string; refreshToken: string; expiresAt: Date }> =
    new Map();

  constructor(private readonly configService: ConfigService) {
    this.clientId = this.configService.get<string>('IMANAGE_CLIENT_ID', '');
    this.clientSecret = this.configService.get<string>('IMANAGE_CLIENT_SECRET', '');
    this.baseUrl = this.configService.get<string>('IMANAGE_BASE_URL', '');
    this.redirectUri = this.configService.get<string>('IMANAGE_REDIRECT_URI', '');
  }

  getAuthorizationUrl(): string {
    if (!this.clientId || !this.baseUrl) {
      this.logger.warn('iManage not configured, returning mock authorization URL');
      return '/api/imanage/callback?code=mock_code';
    }

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'user',
    });

    return `${this.baseUrl}/auth/oauth2/authorize?${params.toString()}`;
  }

  async handleCallback(code: string, userId: string): Promise<void> {
    this.logger.log(`Handling OAuth callback for user ${userId}`);

    // Mock token storage for development
    this.tokens.set(userId, {
      accessToken: `mock_access_token_${userId}`,
      refreshToken: `mock_refresh_token_${userId}`,
      expiresAt: new Date(Date.now() + 3600000), // 1 hour
    });

    // In production, this would exchange the code for tokens
  }

  async getConnectionStatus(userId: string): Promise<ImanageConnectionStatus> {
    const token = this.tokens.get(userId);

    if (!token || token.expiresAt < new Date()) {
      return { connected: false };
    }

    return {
      connected: true,
      user: userId,
      expiresAt: token.expiresAt,
    };
  }

  async disconnect(userId: string): Promise<void> {
    this.tokens.delete(userId);
  }

  async getWorkspaces(userId: string): Promise<ImanageWorkspace[]> {
    await this.ensureConnected(userId);

    // Mock data for development
    return [
      {
        id: 'ws-001',
        name: 'M&A Transactions 2024',
        description: 'All M&A deals for 2024',
        createdDate: '2024-01-01T00:00:00Z',
        modifiedDate: '2024-01-15T10:30:00Z',
        owner: 'john.partner@firm.com',
      },
      {
        id: 'ws-002',
        name: 'Corporate Finance',
        description: 'Corporate finance matters',
        createdDate: '2023-06-01T00:00:00Z',
        modifiedDate: '2024-01-10T14:20:00Z',
        owner: 'jane.partner@firm.com',
      },
      {
        id: 'ws-003',
        name: 'Litigation Cases',
        description: 'Active litigation matters',
        createdDate: '2023-01-01T00:00:00Z',
        modifiedDate: '2024-01-12T09:15:00Z',
        owner: 'bob.partner@firm.com',
      },
    ];
  }

  async searchDocuments(
    userId: string,
    params: {
      workspaceId?: string;
      query?: string;
      extension?: string;
      limit?: number;
    },
  ): Promise<ImanageDocument[]> {
    await this.ensureConnected(userId);

    // Mock data for development
    const documents: ImanageDocument[] = [
      {
        id: 'doc-001',
        name: 'Acquisition Agreement',
        extension: 'docx',
        size: 245000,
        version: 3,
        author: 'john.associate@firm.com',
        createdDate: '2024-01-05T10:00:00Z',
        modifiedDate: '2024-01-10T15:30:00Z',
        workspaceId: 'ws-001',
      },
      {
        id: 'doc-002',
        name: 'Due Diligence Report',
        extension: 'pdf',
        size: 1500000,
        version: 1,
        author: 'jane.associate@firm.com',
        createdDate: '2024-01-08T09:00:00Z',
        modifiedDate: '2024-01-08T09:00:00Z',
        workspaceId: 'ws-001',
      },
      {
        id: 'doc-003',
        name: 'Term Sheet',
        extension: 'docx',
        size: 85000,
        version: 5,
        author: 'john.partner@firm.com',
        createdDate: '2024-01-02T14:00:00Z',
        modifiedDate: '2024-01-09T11:45:00Z',
        workspaceId: 'ws-001',
      },
    ];

    let filtered = documents;

    if (params.workspaceId) {
      filtered = filtered.filter((d) => d.workspaceId === params.workspaceId);
    }
    if (params.extension) {
      filtered = filtered.filter((d) => d.extension === params.extension);
    }
    if (params.query) {
      const query = params.query.toLowerCase();
      filtered = filtered.filter((d) => d.name.toLowerCase().includes(query));
    }

    return filtered.slice(0, params.limit || 50);
  }

  async getDocument(userId: string, documentId: string): Promise<ImanageDocument | null> {
    await this.ensureConnected(userId);

    const docs = await this.searchDocuments(userId, {});
    return docs.find((d) => d.id === documentId) || null;
  }

  async getDocumentContent(userId: string, documentId: string): Promise<string> {
    await this.ensureConnected(userId);

    // In production, this would fetch and extract text from the document
    return `Mock document content for ${documentId}.

This is a sample legal document that would normally contain the full text
extracted from the iManage document management system.

Client: Acme Corporation
Matter: Acquisition of Beta Industries
Deal Value: $150,000,000

Key Terms:
- Purchase price: $150 million
- Closing date: March 1, 2024
- Regulatory approvals required: FTC, EU Commission

Parties:
- Buyer: Acme Corporation
- Seller: Beta Industries Inc.
- Seller's shareholders: Various institutional investors`;
  }

  private async ensureConnected(userId: string): Promise<void> {
    const status = await this.getConnectionStatus(userId);
    if (!status.connected) {
      throw new UnauthorizedException('Not connected to iManage');
    }
  }
}
