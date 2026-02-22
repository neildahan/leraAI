import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Play, RefreshCw, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface SynthesisJob {
  id: string;
  matterTitle: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  confidenceScore?: number;
  description?: string;
  startedAt?: string;
  completedAt?: string;
}

const mockJobs: SynthesisJob[] = [
  {
    id: '1',
    matterTitle: 'Acme Corp Acquisition of Beta Inc',
    status: 'completed',
    confidenceScore: 92,
    description: 'Advised Acme Corporation on its $150 million acquisition of Beta Industries...',
    completedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    matterTitle: 'Gamma Holdings Restructuring',
    status: 'processing',
    startedAt: '2024-01-15T11:00:00Z',
  },
  {
    id: '3',
    matterTitle: 'Delta Industries IPO',
    status: 'pending',
  },
];

export function SynthesisPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<SynthesisJob[]>(mockJobs);
  const [selectedJob, setSelectedJob] = useState<SynthesisJob | null>(null);

  const handleRunSynthesis = (jobId: string) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId ? { ...job, status: 'processing', startedAt: new Date().toISOString() } : job,
      ),
    );

    // Simulate processing
    setTimeout(() => {
      setJobs((prev) =>
        prev.map((job) =>
          job.id === jobId
            ? {
                ...job,
                status: 'completed',
                confidenceScore: Math.floor(Math.random() * 15) + 85,
                description: 'AI-generated description for the matter...',
                completedAt: new Date().toISOString(),
              }
            : job,
        ),
      );
      toast({ title: t('synthesis.synthesisComplete'), description: t('synthesis.synthesisCompleteDescription') });
    }, 3000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'processing':
        return <RefreshCw className="h-5 w-5 animate-spin text-lera-800" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    return t(`synthesis.statuses.${status}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{t('synthesis.title')}</h1>
          <p className="text-muted-foreground">{t('synthesis.subtitle')}</p>
        </div>
        <Button>
          <Sparkles className="me-2 h-4 w-4" />
          {t('synthesis.newSynthesis')}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Jobs list */}
        <Card>
          <CardHeader>
            <CardTitle>{t('synthesis.synthesisQueue')}</CardTitle>
            <CardDescription>{t('synthesis.mattersAwaitingProcessing')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className={cn(
                    'cursor-pointer rounded-lg border p-4 transition-colors hover:bg-accent',
                    selectedJob?.id === job.id && 'border-primary bg-primary/5',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(job.status)}
                      <div>
                        <p className="font-medium">{job.matterTitle}</p>
                        <p className="text-sm text-muted-foreground">
                          {getStatusLabel(job.status)}
                          {job.confidenceScore && ` - ${job.confidenceScore}% ${t('synthesis.confidence')}`}
                        </p>
                      </div>
                    </div>
                    {job.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRunSynthesis(job.id);
                        }}
                      >
                        <Play className="me-1 h-3 w-3" />
                        {t('common.run')}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Preview panel */}
        <Card>
          <CardHeader>
            <CardTitle>{t('synthesis.aiOutputPreview')}</CardTitle>
            <CardDescription>{t('synthesis.reviewAndEditContent')}</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedJob ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">{selectedJob.matterTitle}</h3>
                  <div className="mt-2 flex items-center gap-4">
                    <span className="flex items-center gap-1 text-sm">
                      {getStatusIcon(selectedJob.status)}
                      {getStatusLabel(selectedJob.status)}
                    </span>
                    {selectedJob.confidenceScore && (
                      <span className="text-sm text-muted-foreground">
                        {t('synthesis.confidenceScore')}: {selectedJob.confidenceScore}%
                      </span>
                    )}
                  </div>
                </div>

                {selectedJob.status === 'completed' && selectedJob.description && (
                  <>
                    <div className="rounded-lg bg-muted p-4">
                      <h4 className="mb-2 font-medium">{t('synthesis.generatedDescription')}</h4>
                      <p className="text-sm">{selectedJob.description}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button className="flex-1">
                        <CheckCircle className="me-2 h-4 w-4" />
                        {t('synthesis.acceptAndContinue')}
                      </Button>
                      <Button variant="outline">
                        <RefreshCw className="me-2 h-4 w-4" />
                        {t('synthesis.regenerate')}
                      </Button>
                    </div>
                  </>
                )}

                {selectedJob.status === 'processing' && (
                  <div className="flex flex-col items-center justify-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                    <p className="mt-4 text-sm text-muted-foreground">
                      {t('synthesis.aiAnalyzing')}
                    </p>
                  </div>
                )}

                {selectedJob.status === 'pending' && (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Sparkles className="h-8 w-8 text-muted-foreground" />
                    <p className="mt-4 text-sm text-muted-foreground">
                      {t('synthesis.clickRunToStart')}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Sparkles className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 font-medium">{t('synthesis.noMatterSelected')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('synthesis.selectMatterFromQueue')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
