export interface ImanageConfig {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  createdDate: string;
  modifiedDate: string;
  owner: string;
  database: string;
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string;
  workspaceId: string;
  createdDate: string;
  modifiedDate: string;
}

export interface Document {
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
  checkoutStatus?: 'available' | 'checked_out';
  checkedOutBy?: string;
  customFields?: Record<string, string>;
}

export interface DocumentVersion {
  version: number;
  createdDate: string;
  author: string;
  comment?: string;
}

export interface SearchParams {
  query?: string;
  workspaceId?: string;
  folderId?: string;
  extension?: string;
  author?: string;
  modifiedAfter?: Date;
  modifiedBefore?: Date;
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  documents: Document[];
  total: number;
  hasMore: boolean;
}
