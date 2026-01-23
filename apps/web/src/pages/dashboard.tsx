import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, CheckCircle, Clock, FileOutput, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/services/api';
import { cn } from '@/lib/utils';

interface Statistics {
  total: number;
  byStatus: {
    draft: number;
    review: number;
    approved: number;
    exported: number;
  };
  pendingReview: number;
  exportedThisMonth: number;
}

export function DashboardPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get<Statistics>('/matters/statistics');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch statistics:', error);
        // Set mock data for demo
        setStats({
          total: 42,
          byStatus: { draft: 12, review: 8, approved: 15, exported: 7 },
          pendingReview: 8,
          exportedThisMonth: 7,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: t('dashboard.totalMatters'),
      value: stats?.total || 0,
      description: t('dashboard.allMattersDescription'),
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: t('dashboard.pendingReview'),
      value: stats?.pendingReview || 0,
      description: t('dashboard.awaitingApproval'),
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: t('dashboard.approved'),
      value: stats?.byStatus?.approved || 0,
      description: t('dashboard.readyForExport'),
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: t('dashboard.exportedThisMonth'),
      value: stats?.exportedThisMonth || 0,
      description: t('dashboard.submissionsGenerated'),
      icon: FileOutput,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.title')}</h1>
        <p className="text-muted-foreground">
          {t('dashboard.subtitle')}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={cn('rounded-full p-2', stat.bgColor)}>
                <stat.icon className={cn('h-4 w-4', stat.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.recentActivity')}</CardTitle>
            <CardDescription>{t('dashboard.latestActions')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: t('activity.matterApproved'), matter: 'Acme Corp Acquisition', time: t('activity.hoursAgo', { count: 2 }) },
                { action: t('activity.aiSynthesisComplete'), matter: 'Beta Industries M&A', time: t('activity.hoursAgo', { count: 4 }) },
                { action: t('activity.exportGenerated'), matter: 'Gamma Holdings Deal', time: t('activity.daysAgo', { count: 1 }) },
                { action: t('activity.newMatterCreated'), matter: 'Delta Corp Financing', time: t('activity.daysAgo', { count: 2 }) },
              ].map((activity, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.matter}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.quickStats')}</CardTitle>
            <CardDescription>{t('dashboard.performanceMetrics')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">{t('dashboard.aiConfidenceScore')}</span>
                <span className="flex items-center gap-1 text-sm font-medium text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  87%
                </span>
              </div>
              <div className="h-2 rounded-full bg-gray-200">
                <div className="h-2 w-[87%] rounded-full bg-green-600" />
              </div>

              <div className="flex items-center justify-between pt-4">
                <span className="text-sm">{t('dashboard.submissionSuccessRate')}</span>
                <span className="flex items-center gap-1 text-sm font-medium text-blue-600">
                  <TrendingUp className="h-4 w-4" />
                  94%
                </span>
              </div>
              <div className="h-2 rounded-full bg-gray-200">
                <div className="h-2 w-[94%] rounded-full bg-blue-600" />
              </div>

              <div className="flex items-center justify-between pt-4">
                <span className="text-sm">{t('dashboard.timeSaved')}</span>
                <span className="text-sm font-medium text-purple-600">~85%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
