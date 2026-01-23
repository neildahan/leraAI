import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FolderOpen, File, Search, Check, Link2, Unlink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/services/api';
import { cn, formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Workspace {
  id: string;
  name: string;
  description?: string;
  modifiedDate: string;
}

interface Document {
  id: string;
  name: string;
  extension: string;
  size: number;
  modifiedDate: string;
  workspaceId: string;
}

interface ConnectionStatus {
  connected: boolean;
  user?: string;
  expiresAt?: string;
}

export function ImanagePage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [status, setStatus] = useState<ConnectionStatus>({ connected: false });
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null);
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
  }, []);

  useEffect(() => {
    if (status.connected) {
      fetchWorkspaces();
    }
  }, [status.connected]);

  useEffect(() => {
    if (selectedWorkspace) {
      fetchDocuments(selectedWorkspace);
    }
  }, [selectedWorkspace]);

  const fetchStatus = async () => {
    try {
      const response = await api.get<ConnectionStatus>('/imanage/status');
      setStatus(response.data);
    } catch {
      // Mock connected status for demo
      setStatus({ connected: true, user: 'demo@firm.com' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWorkspaces = async () => {
    try {
      const response = await api.get<Workspace[]>('/imanage/workspaces');
      setWorkspaces(response.data);
    } catch {
      // Mock data for demo
      setWorkspaces([
        { id: 'ws-001', name: 'M&A Transactions 2024', description: 'All M&A deals', modifiedDate: '2024-01-15' },
        { id: 'ws-002', name: 'Corporate Finance', description: 'Finance matters', modifiedDate: '2024-01-10' },
        { id: 'ws-003', name: 'Litigation Cases', description: 'Active litigation', modifiedDate: '2024-01-12' },
      ]);
    }
  };

  const fetchDocuments = async (workspaceId: string) => {
    try {
      const response = await api.get<Document[]>('/imanage/documents', {
        params: { workspaceId },
      });
      setDocuments(response.data);
    } catch {
      // Mock data for demo
      setDocuments([
        { id: 'doc-001', name: 'Acquisition Agreement', extension: 'docx', size: 245000, modifiedDate: '2024-01-10', workspaceId },
        { id: 'doc-002', name: 'Due Diligence Report', extension: 'pdf', size: 1500000, modifiedDate: '2024-01-08', workspaceId },
        { id: 'doc-003', name: 'Term Sheet', extension: 'docx', size: 85000, modifiedDate: '2024-01-09', workspaceId },
        { id: 'doc-004', name: 'Financial Analysis', extension: 'xlsx', size: 320000, modifiedDate: '2024-01-07', workspaceId },
      ]);
    }
  };

  const handleConnect = async () => {
    try {
      await api.post<{ authorizationUrl: string }>('/imanage/connect');
      // In production, redirect to OAuth URL
      // For demo, simulate connection
      setStatus({ connected: true, user: 'demo@firm.com' });
      toast({ title: t('imanage.connected'), description: t('imanage.connectedDescription') });
    } catch {
      toast({ variant: 'destructive', title: t('imanage.connectionFailed') });
    }
  };

  const handleDisconnect = async () => {
    try {
      await api.post('/imanage/disconnect');
      setStatus({ connected: false });
      setWorkspaces([]);
      setDocuments([]);
      setSelectedWorkspace(null);
      toast({ title: t('imanage.disconnected'), description: t('imanage.disconnectedDescription') });
    } catch {
      setStatus({ connected: false });
    }
  };

  const toggleDocSelection = (docId: string) => {
    const newSelected = new Set(selectedDocs);
    if (newSelected.has(docId)) {
      newSelected.delete(docId);
    } else {
      newSelected.add(docId);
    }
    setSelectedDocs(newSelected);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const filteredDocuments = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('imanage.title')}</h1>
          <p className="text-muted-foreground">{t('imanage.subtitle')}</p>
        </div>
        {status.connected ? (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              {t('imanage.connectedAs', { user: status.user })}
            </span>
            <Button variant="outline" onClick={handleDisconnect}>
              <Unlink className="me-2 h-4 w-4" />
              {t('imanage.disconnect')}
            </Button>
          </div>
        ) : (
          <Button onClick={handleConnect}>
            <Link2 className="me-2 h-4 w-4" />
            {t('imanage.connect')}
          </Button>
        )}
      </div>

      {status.connected ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Workspaces */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                {t('imanage.workspaces')}
              </CardTitle>
              <CardDescription>{t('imanage.selectWorkspaceToBrowse')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {workspaces.map((workspace) => (
                  <button
                    key={workspace.id}
                    onClick={() => setSelectedWorkspace(workspace.id)}
                    className={cn(
                      'w-full rounded-lg border p-3 text-left transition-colors hover:bg-accent',
                      selectedWorkspace === workspace.id && 'border-primary bg-primary/5',
                    )}
                  >
                    <p className="font-medium">{workspace.name}</p>
                    <p className="text-xs text-muted-foreground">{workspace.description}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <File className="h-5 w-5" />
                    {t('imanage.documents')}
                  </CardTitle>
                  <CardDescription>
                    {selectedDocs.size > 0 ? `${selectedDocs.size} ${t('common.selected')}` : t('imanage.selectDocumentsForProcessing')}
                  </CardDescription>
                </div>
                {selectedDocs.size > 0 && (
                  <Button>{t('imanage.processSelected')} ({selectedDocs.size})</Button>
                )}
              </div>
              <div className="relative">
                <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t('imanage.searchDocuments')}
                  className="ps-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              {!selectedWorkspace ? (
                <p className="py-8 text-center text-muted-foreground">
                  {t('imanage.selectWorkspaceToViewDocuments')}
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredDocuments.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => toggleDocSelection(doc.id)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent',
                        selectedDocs.has(doc.id) && 'border-primary bg-primary/5',
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-5 w-5 items-center justify-center rounded border',
                          selectedDocs.has(doc.id)
                            ? 'border-primary bg-primary text-white'
                            : 'border-gray-300',
                        )}
                      >
                        {selectedDocs.has(doc.id) && <Check className="h-3 w-3" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.extension.toUpperCase()} - {formatFileSize(doc.size)} - {formatDate(doc.modifiedDate)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">{t('imanage.connectYourAccount')}</h3>
            <p className="mt-2 text-muted-foreground">
              {t('imanage.connectDescription')}
            </p>
            <Button className="mt-4" onClick={handleConnect}>
              <Link2 className="me-2 h-4 w-4" />
              {t('imanage.connectNow')}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
