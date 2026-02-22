import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Settings as SettingsIcon,
  Bell,
  Wrench,
  Shield,
  Database,
  Sparkles,
  FileOutput,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type TabKey = 'general' | 'notifications' | 'tools' | 'security' | 'integrations';

interface Tab {
  key: TabKey;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
}

const tabs: Tab[] = [
  { key: 'general', labelKey: 'settings.tabs.general', icon: SettingsIcon },
  { key: 'notifications', labelKey: 'settings.tabs.notifications', icon: Bell },
  { key: 'tools', labelKey: 'settings.tabs.tools', icon: Wrench },
  { key: 'security', labelKey: 'settings.tabs.security', icon: Shield },
  { key: 'integrations', labelKey: 'settings.tabs.integrations', icon: Database },
];

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label: string;
  description?: string;
}

function ToggleSwitch({ enabled, onChange, label, description }: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between py-4">
      <div>
        <p className="font-medium text-gray-900">{label}</p>
        {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
          enabled ? 'bg-lera-800' : 'bg-gray-200'
        )}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm',
            enabled ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
    </div>
  );
}

function SettingCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="divide-y divide-gray-100">{children}</div>
    </div>
  );
}

export function SettingsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabKey>('general');

  // Toggle states
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [deadlineReminders, setDeadlineReminders] = useState(true);
  const [aiAutoSynthesis, setAiAutoSynthesis] = useState(true);
  const [smartSuggestions, setSmartSuggestions] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(true);
  const [imanageSync, setImanageSync] = useState(false);
  const [apiAccess, setApiAccess] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <SettingCard title={t('settings.general.preferences', 'Preferences')}>
              <ToggleSwitch
                enabled={autoSave}
                onChange={setAutoSave}
                label={t('settings.general.autoSave', 'Auto-save drafts')}
                description={t('settings.general.autoSaveDesc', 'Automatically save your work every few minutes')}
              />
              <ToggleSwitch
                enabled={smartSuggestions}
                onChange={setSmartSuggestions}
                label={t('settings.general.smartSuggestions', 'Smart suggestions')}
                description={t('settings.general.smartSuggestionsDesc', 'Show AI-powered suggestions while editing')}
              />
            </SettingCard>

            <SettingCard title={t('settings.general.display', 'Display')}>
              <div className="py-4">
                <Label className="text-gray-900 font-medium">{t('settings.general.timezone', 'Timezone')}</Label>
                <select className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-lera-800 focus:ring-lera-800">
                  <option>Asia/Jerusalem (GMT+3)</option>
                  <option>Europe/London (GMT+0)</option>
                  <option>America/New_York (GMT-5)</option>
                </select>
              </div>
              <div className="py-4">
                <Label className="text-gray-900 font-medium">{t('settings.general.dateFormat', 'Date format')}</Label>
                <select className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-lera-800 focus:ring-lera-800">
                  <option>DD/MM/YYYY</option>
                  <option>MM/DD/YYYY</option>
                  <option>YYYY-MM-DD</option>
                </select>
              </div>
            </SettingCard>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <SettingCard title={t('settings.notifications.email', 'Email Notifications')}>
              <ToggleSwitch
                enabled={emailNotifications}
                onChange={setEmailNotifications}
                label={t('settings.notifications.emailEnabled', 'Email notifications')}
                description={t('settings.notifications.emailDesc', 'Receive updates and alerts via email')}
              />
              <ToggleSwitch
                enabled={weeklyDigest}
                onChange={setWeeklyDigest}
                label={t('settings.notifications.weeklyDigest', 'Weekly digest')}
                description={t('settings.notifications.weeklyDigestDesc', 'Get a summary of activity every week')}
              />
            </SettingCard>

            <SettingCard title={t('settings.notifications.push', 'Push Notifications')}>
              <ToggleSwitch
                enabled={pushNotifications}
                onChange={setPushNotifications}
                label={t('settings.notifications.pushEnabled', 'Push notifications')}
                description={t('settings.notifications.pushDesc', 'Receive real-time notifications in browser')}
              />
              <ToggleSwitch
                enabled={deadlineReminders}
                onChange={setDeadlineReminders}
                label={t('settings.notifications.deadlines', 'Deadline reminders')}
                description={t('settings.notifications.deadlinesDesc', 'Get notified before submission deadlines')}
              />
            </SettingCard>
          </div>
        );

      case 'tools':
        return (
          <div className="space-y-6">
            {/* Quick Access Tools */}
            <SettingCard title={t('settings.tools.quickAccess', 'Quick Access')}>
              <Link
                to="/synthesis"
                className="flex items-center justify-between py-4 hover:bg-gray-50 -mx-6 px-6 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{t('nav.aiSynthesis', 'AI Synthesis')}</p>
                    <p className="text-sm text-gray-500">{t('settings.tools.aiSynthesisDesc', 'Generate directory descriptions with AI')}</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </Link>
              <Link
                to="/templates"
                className="flex items-center justify-between py-4 hover:bg-gray-50 -mx-6 px-6 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-lera-100 flex items-center justify-center">
                    <FileOutput className="h-6 w-6 text-lera-800" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{t('nav.templates', 'Templates')}</p>
                    <p className="text-sm text-gray-500">{t('settings.tools.templatesDesc', 'Manage export templates')}</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </Link>
            </SettingCard>

            <SettingCard title={t('settings.tools.aiFeatures', 'AI Features')}>
              <ToggleSwitch
                enabled={aiAutoSynthesis}
                onChange={setAiAutoSynthesis}
                label={t('settings.tools.autoSynthesis', 'Auto AI Synthesis')}
                description={t('settings.tools.autoSynthesisDesc', 'Automatically generate descriptions when matters are added')}
              />
              <ToggleSwitch
                enabled={smartSuggestions}
                onChange={setSmartSuggestions}
                label={t('settings.tools.smartMatching', 'Smart matter matching')}
                description={t('settings.tools.smartMatchingDesc', 'AI suggests relevant matters for submissions')}
              />
            </SettingCard>

            <SettingCard title={t('settings.tools.export', 'Export Settings')}>
              <div className="py-4">
                <Label className="text-gray-900 font-medium">{t('settings.tools.defaultFormat', 'Default export format')}</Label>
                <select className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-lera-800 focus:ring-lera-800">
                  <option>Microsoft Word (.docx)</option>
                  <option>PDF (.pdf)</option>
                  <option>Rich Text (.rtf)</option>
                </select>
              </div>
              <div className="py-4">
                <Label className="text-gray-900 font-medium">{t('settings.tools.defaultTemplate', 'Default template')}</Label>
                <select className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-lera-800 focus:ring-lera-800">
                  <option>Dun's 100</option>
                  <option>Chambers</option>
                  <option>Legal 500</option>
                </select>
              </div>
            </SettingCard>

            <SettingCard title={t('settings.tools.advanced', 'Advanced')}>
              <div className="py-4">
                <Label className="text-gray-900 font-medium">{t('settings.tools.aiModel', 'AI Model')}</Label>
                <select className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-lera-800 focus:ring-lera-800">
                  <option>Standard (Faster)</option>
                  <option>Advanced (Better quality)</option>
                </select>
                <p className="text-xs text-gray-500 mt-2">{t('settings.tools.aiModelDesc', 'Advanced model provides better synthesis but takes longer')}</p>
              </div>
            </SettingCard>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <SettingCard title={t('settings.security.authentication', 'Authentication')}>
              <ToggleSwitch
                enabled={twoFactorAuth}
                onChange={setTwoFactorAuth}
                label={t('settings.security.twoFactor', 'Two-factor authentication')}
                description={t('settings.security.twoFactorDesc', 'Add an extra layer of security to your account')}
              />
              <ToggleSwitch
                enabled={sessionTimeout}
                onChange={setSessionTimeout}
                label={t('settings.security.sessionTimeout', 'Auto session timeout')}
                description={t('settings.security.sessionTimeoutDesc', 'Automatically log out after 30 minutes of inactivity')}
              />
            </SettingCard>

            <SettingCard title={t('settings.security.sessions', 'Active Sessions')}>
              <div className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Current session</p>
                    <p className="text-sm text-gray-500">Chrome on macOS • Tel Aviv, Israel</p>
                  </div>
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Active</span>
                </div>
              </div>
            </SettingCard>
          </div>
        );

      case 'integrations':
        return (
          <div className="space-y-6">
            <SettingCard title={t('settings.integrations.connected', 'Connected Services')}>
              <div className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-lera-100 flex items-center justify-center">
                    <Database className="h-6 w-6 text-lera-800" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">iManage</p>
                    <p className="text-sm text-gray-500">{t('settings.integrations.imanageDesc', 'Document management system')}</p>
                  </div>
                </div>
                <button
                  onClick={() => setImanageSync(!imanageSync)}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                    imanageSync
                      ? 'bg-green-50 text-green-700 hover:bg-green-100'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  {imanageSync ? t('settings.integrations.connected', 'Connected') : t('settings.integrations.connect', 'Connect')}
                </button>
              </div>
            </SettingCard>

            <SettingCard title={t('settings.integrations.api', 'API Access')}>
              <ToggleSwitch
                enabled={apiAccess}
                onChange={setApiAccess}
                label={t('settings.integrations.enableApi', 'Enable API access')}
                description={t('settings.integrations.apiDesc', 'Allow external applications to access your data')}
              />
              {apiAccess && (
                <div className="py-4">
                  <Label className="text-gray-900 font-medium">{t('settings.integrations.apiKey', 'API Key')}</Label>
                  <div className="mt-2 flex gap-2">
                    <Input
                      type="password"
                      value="sk-xxxx-xxxx-xxxx-xxxx"
                      readOnly
                      className="flex-1 rounded-xl"
                    />
                    <Button variant="outline" className="rounded-xl">
                      {t('settings.integrations.regenerate', 'Regenerate')}
                    </Button>
                  </div>
                </div>
              )}
            </SettingCard>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{t('nav.settings', 'Settings')}</h1>
        <p className="text-gray-500 mt-1">{t('settings.subtitle', 'Manage your account and application preferences')}</p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Tabs */}
        <div className="w-56 shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                    isActive
                      ? 'bg-lera-50 text-lera-800'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Icon className={cn('h-5 w-5', isActive ? 'text-lera-800' : 'text-gray-400')} />
                  {t(tab.labelKey, tab.key.charAt(0).toUpperCase() + tab.key.slice(1))}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {renderContent()}

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <Button className="h-11 px-6 rounded-xl bg-lera-800 hover:bg-lera-900">
              {t('settings.saveChanges', 'Save Changes')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
