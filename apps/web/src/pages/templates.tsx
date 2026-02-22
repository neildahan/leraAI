import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileOutput, Download, FileText, Table2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/services/api';
import { cn, formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Template {
  _id: string;
  name: string;
  type: string;
  description: string;
  outputFormat: string;
  version: string;
}

interface Export {
  _id: string;
  templateId: { name: string; type: string };
  matterId: { title: string };
  status: string;
  fileName: string;
  createdAt: string;
}

export function TemplatesPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [exports, setExports] = useState<Export[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [templatesRes, exportsRes] = await Promise.all([
          api.get<Template[]>('/templates'),
          api.get<Export[]>('/templates/exports/my'),
        ]);
        setTemplates(templatesRes.data);
        setExports(exportsRes.data);
      } catch {
        // Mock data for demo
        setTemplates([
          {
            _id: '1',
            name: "Dun's 100 Submission",
            type: 'duns_100',
            description: "Template for Dun's 100 legal directory submission",
            outputFormat: 'docx',
            version: '2024',
          },
          {
            _id: '2',
            name: 'Chambers Submission',
            type: 'chambers',
            description: 'Template for Chambers and Partners submission',
            outputFormat: 'xlsx',
            version: '2024',
          },
        ]);
        setExports([
          {
            _id: 'exp-1',
            templateId: { name: "Dun's 100", type: 'duns_100' },
            matterId: { title: 'Acme Corp Acquisition' },
            status: 'completed',
            fileName: 'Acme_Corp_Duns_100_2024.docx',
            createdAt: '2024-01-15T10:00:00Z',
          },
          {
            _id: 'exp-2',
            templateId: { name: 'Chambers', type: 'chambers' },
            matterId: { title: 'Beta Industries M&A' },
            status: 'completed',
            fileName: 'Beta_Industries_Chambers_2024.xlsx',
            createdAt: '2024-01-14T14:30:00Z',
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDownload = async (_exportId: string) => {
    try {
      // In production, this would trigger a file download
      toast({ title: t('templates.downloadStarted'), description: t('templates.fileBeingDownloaded') });
    } catch {
      toast({ variant: 'destructive', title: t('templates.downloadFailed') });
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'xlsx':
        return <Table2 className="h-5 w-5 text-green-600" />;
      default:
        return <FileText className="h-5 w-5 text-lera-800" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{t('templates.title')}</h1>
        <p className="text-muted-foreground">{t('templates.subtitle')}</p>
      </div>

      {/* Templates */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">{t('templates.availableTemplates')}</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template._id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  {getFormatIcon(template.outputFormat)}
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    <span className="uppercase">{template.outputFormat}</span> - v{template.version}
                  </div>
                  <Button size="sm">
                    <FileOutput className="me-2 h-4 w-4" />
                    {t('common.generate')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Exports */}
      <Card>
        <CardHeader>
          <CardTitle>{t('templates.recentExports')}</CardTitle>
          <CardDescription>{t('templates.yourGeneratedDocuments')}</CardDescription>
        </CardHeader>
        <CardContent>
          {exports.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              {t('templates.noExportsYet')}
            </p>
          ) : (
            <div className="space-y-3">
              {exports.map((exp) => (
                <div
                  key={exp._id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    {getFormatIcon(exp.fileName.split('.').pop() || 'docx')}
                    <div>
                      <p className="font-medium">{exp.matterId.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {exp.templateId.name} - {formatDate(exp.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'rounded-full px-2 py-1 text-xs font-medium',
                        exp.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700',
                      )}
                    >
                      {exp.status === 'completed' ? t('common.ready') : t('common.processing')}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={exp.status !== 'completed'}
                      onClick={() => handleDownload(exp._id)}
                    >
                      <Download className="mr-1 h-4 w-4" />
                      {t('common.download')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
