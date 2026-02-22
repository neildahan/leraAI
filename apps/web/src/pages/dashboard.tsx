import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, CheckCircle, Clock, FileOutput, Bell, Sparkles } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { ChartCard } from '@/components/ui/chart-card';
import { PromoCard } from '@/components/ui/promo-card';
import { api } from '@/services/api';
import { useAuth } from '@/hooks/use-auth';

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
  const { user } = useAuth();
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

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  const userName = user?.firstName || user?.email?.split('@')[0] || 'User';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          {t('dashboard.welcomeBack', 'Welcome Back')}, {userName}
        </h1>
        <p className="text-gray-500 mt-1">
          {t('dashboard.subtitle')}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('dashboard.totalMatters')}
          value={stats?.total || 0}
          icon={FileText}
          iconColor="blue"
        />
        <StatCard
          title={t('dashboard.pendingReview')}
          value={stats?.pendingReview || 0}
          icon={Clock}
          iconColor="orange"
        />
        <StatCard
          title={t('dashboard.approved')}
          value={stats?.byStatus?.approved || 0}
          icon={CheckCircle}
          iconColor="green"
        />
        <StatCard
          title={t('dashboard.exportedThisMonth')}
          value={stats?.exportedThisMonth || 0}
          icon={FileOutput}
          iconColor="purple"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Activity Chart */}
        <ChartCard
          title={t('dashboard.recentActivity', 'Recent Activity')}
          filterOptions={['Weekly', 'Monthly', 'Yearly']}
          selectedFilter="Monthly"
          className="lg:col-span-1"
        >
          <div className="space-y-4">
            {[
              { action: t('activity.matterApproved'), matter: 'Acme Corp Acquisition', time: t('activity.hoursAgo', { count: 2 }), color: 'bg-green-500' },
              { action: t('activity.aiSynthesisComplete'), matter: 'Beta Industries M&A', time: t('activity.hoursAgo', { count: 4 }), color: 'bg-blue-500' },
              { action: t('activity.exportGenerated'), matter: 'Gamma Holdings Deal', time: t('activity.daysAgo', { count: 1 }), color: 'bg-purple-500' },
              { action: t('activity.newMatterCreated'), matter: 'Delta Corp Financing', time: t('activity.daysAgo', { count: 2 }), color: 'bg-orange-500' },
            ].map((activity, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className={`h-2.5 w-2.5 rounded-full ${activity.color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{activity.action}</p>
                  <p className="text-xs text-gray-500 truncate">{activity.matter}</p>
                </div>
                <p className="text-xs text-gray-400 whitespace-nowrap">{activity.time}</p>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Stats Card */}
        <ChartCard
          title={t('dashboard.quickStats', 'Quick Stats')}
          className="lg:col-span-1"
        >
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">{t('dashboard.aiConfidenceScore')}</span>
                <span className="text-sm font-semibold text-green-600">87%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100">
                <div className="h-2 w-[87%] rounded-full bg-gradient-to-r from-green-400 to-green-500" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">{t('dashboard.submissionSuccessRate')}</span>
                <span className="text-sm font-semibold text-blue-600">94%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100">
                <div className="h-2 w-[94%] rounded-full bg-gradient-to-r from-blue-400 to-blue-500" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">{t('dashboard.timeSaved')}</span>
                <span className="text-sm font-semibold text-purple-600">85%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100">
                <div className="h-2 w-[85%] rounded-full bg-gradient-to-r from-purple-400 to-purple-500" />
              </div>
            </div>
          </div>
        </ChartCard>

        {/* Promo Card */}
        <PromoCard
          title={t('dashboard.stayOnTrack', 'Stay on track with your submissions!')}
          subtitle={t('dashboard.getAutomaticReminders', 'Get automatic reminders for deadlines')}
          buttonText={t('dashboard.tryNow', 'Try now')}
          buttonIcon={Bell}
          gradient="blue"
          className="lg:col-span-1 min-h-[200px]"
        />
      </div>

      {/* Status Distribution */}
      <ChartCard
        title={t('dashboard.statusDistribution', 'Status Distribution')}
        filterOptions={['This Week', 'This Month', 'This Year']}
        selectedFilter="This Month"
      >
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: t('matters.status.draft', 'Draft'), value: stats?.byStatus?.draft || 0, color: 'bg-gray-400' },
            { label: t('matters.status.review', 'In Review'), value: stats?.byStatus?.review || 0, color: 'bg-orange-400' },
            { label: t('matters.status.approved', 'Approved'), value: stats?.byStatus?.approved || 0, color: 'bg-green-400' },
            { label: t('matters.status.exported', 'Exported'), value: stats?.byStatus?.exported || 0, color: 'bg-purple-400' },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <div className={`mx-auto h-16 w-16 rounded-2xl ${item.color} flex items-center justify-center mb-3`}>
                <span className="text-xl font-bold text-white">{item.value}</span>
              </div>
              <p className="text-sm text-gray-600">{item.label}</p>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  );
}
