import { OAuth2Handler } from './auth/oauth2.js';
import {
  ImanageConfig,
  TokenPair,
  Workspace,
  Folder,
  Document,
  SearchParams,
  SearchResult,
  DocumentVersion,
} from './types.js';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export class ImanageClient {
  private config: ImanageConfig;
  private oauth: OAuth2Handler;
  private tokens: TokenPair | null = null;

  constructor(config: ImanageConfig) {
    this.config = config;
    this.oauth = new OAuth2Handler(config);
  }

  getAuthorizationUrl(state?: string): string {
    return this.oauth.getAuthorizationUrl(state);
  }

  async authenticate(code: string): Promise<void> {
    this.tokens = await this.oauth.exchangeCode(code);
  }

  setTokens(tokens: TokenPair): void {
    this.tokens = tokens;
  }

  getTokens(): TokenPair | null {
    return this.tokens;
  }

  private async ensureValidToken(): Promise<string> {
    if (!this.tokens) {
      throw new Error('Not authenticated');
    }

    if (this.tokens.expiresAt <= new Date()) {
      this.tokens = await this.oauth.refreshTokens(this.tokens.refreshToken);
    }

    return this.tokens.accessToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retries = MAX_RETRIES,
  ): Promise<T> {
    const token = await this.ensureValidToken();

    const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (response.status === 401 && retries > 0) {
      // Token might have expired, try refreshing
      this.tokens = await this.oauth.refreshTokens(this.tokens!.refreshToken);
      return this.request<T>(endpoint, options, retries - 1);
    }

    if (response.status === 429 && retries > 0) {
      // Rate limited, wait and retry
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return this.request<T>(endpoint, options, retries - 1);
    }

    if (!response.ok) {
      throw new Error(`iManage API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Workspace operations
  async getWorkspaces(): Promise<Workspace[]> {
    const result = await this.request<{ data: Workspace[] }>('/workspaces');
    return result.data;
  }

  async getWorkspace(id: string): Promise<Workspace> {
    return this.request<Workspace>(`/workspaces/${id}`);
  }

  // Folder operations
  async getFolders(workspaceId: string, parentId?: string): Promise<Folder[]> {
    const params = parentId ? `?parent_id=${parentId}` : '';
    const result = await this.request<{ data: Folder[] }>(
      `/workspaces/${workspaceId}/folders${params}`,
    );
    return result.data;
  }

  // Document operations
  async searchDocuments(params: SearchParams): Promise<SearchResult> {
    const queryParams = new URLSearchParams();

    if (params.query) queryParams.append('q', params.query);
    if (params.workspaceId) queryParams.append('workspace_id', params.workspaceId);
    if (params.folderId) queryParams.append('folder_id', params.folderId);
    if (params.extension) queryParams.append('extension', params.extension);
    if (params.author) queryParams.append('author', params.author);
    if (params.modifiedAfter) queryParams.append('modified_after', params.modifiedAfter.toISOString());
    if (params.modifiedBefore) queryParams.append('modified_before', params.modifiedBefore.toISOString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());

    const result = await this.request<{
      data: Document[];
      total_count: number;
      has_more: boolean;
    }>(`/documents?${queryParams.toString()}`);

    return {
      documents: result.data,
      total: result.total_count,
      hasMore: result.has_more,
    };
  }

  async getDocument(id: string): Promise<Document> {
    return this.request<Document>(`/documents/${id}`);
  }

  async getDocumentVersions(id: string): Promise<DocumentVersion[]> {
    const result = await this.request<{ data: DocumentVersion[] }>(`/documents/${id}/versions`);
    return result.data;
  }

  async downloadDocument(id: string, version?: number): Promise<ArrayBuffer> {
    const token = await this.ensureValidToken();
    const versionParam = version ? `?version=${version}` : '';

    const response = await fetch(`${this.config.baseUrl}/documents/${id}/download${versionParam}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`);
    }

    return response.arrayBuffer();
  }

  async getDocumentText(id: string): Promise<string> {
    const result = await this.request<{ text: string }>(`/documents/${id}/text`);
    return result.text;
  }
}
