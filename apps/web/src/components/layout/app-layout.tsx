import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Sparkles,
  FileOutput,
  LogOut,
  User,
  Send,
  Users,
  Briefcase,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/ui/language-switcher';

const navigation = [
  { key: 'nav.dashboard', href: '/dashboard', icon: LayoutDashboard },
  { key: 'nav.submissions', href: '/submissions', icon: Send },
  { key: 'nav.matters', href: '/matters', icon: FileText },
  { key: 'nav.lawyers', href: '/lawyers', icon: Briefcase },
  { key: 'nav.referees', href: '/referees', icon: Users },
  { key: 'nav.imanage', href: '/imanage', icon: FolderOpen },
  { key: 'nav.aiSynthesis', href: '/synthesis', icon: Sparkles },
  { key: 'nav.templates', href: '/templates', icon: FileOutput },
];

export function AppLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col bg-white shadow-sm">
        <div className="flex h-16 items-center justify-center border-b">
          <Link to="/dashboard" className="flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-primary">Lera AI</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.key}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-gray-700 hover:bg-gray-100',
                )}
              >
                <item.icon className="h-5 w-5" />
                {t(item.key)}
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-4">
          <div className="mb-3">
            <LanguageSwitcher />
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
              <User className="h-5 w-5" />
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-medium text-gray-900">
                {user?.firstName || user?.email}
              </p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="mt-2 w-full justify-start gap-2 text-gray-600"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            {t('auth.signOut')}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="h-full p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
