import { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Sparkles,
  FileOutput,
  LogOut,
  Send,
  Users,
  Briefcase,
  Bell,
  Settings,
  HelpCircle,
  ChevronDown,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

// Navigation items grouped by section
const mainNavigation = [
  { key: 'nav.dashboard', href: '/dashboard', icon: LayoutDashboard },
  { key: 'nav.submissions', href: '/submissions', icon: Send },
  { key: 'nav.matters', href: '/matters', icon: FileText },
  { key: 'nav.lawyers', href: '/lawyers', icon: Briefcase },
  { key: 'nav.referees', href: '/referees', icon: Users },
  { key: 'nav.imanage', href: '/imanage', icon: FolderOpen },
];

const toolsNavigation = [
  { key: 'nav.aiSynthesis', href: '/synthesis', icon: Sparkles },
  { key: 'nav.templates', href: '/templates', icon: FileOutput },
];

const supportNavigation = [
  { key: 'nav.notifications', href: '/notifications', icon: Bell, badge: 2 },
  { key: 'nav.support', href: '/support', icon: HelpCircle },
  { key: 'nav.settings', href: '/settings', icon: Settings },
];

interface NavItemProps {
  item: {
    key: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  };
  isActive: boolean;
}

function NavItem({ item, isActive }: NavItemProps) {
  const { t } = useTranslation();
  const Icon = item.icon;

  return (
    <Link
      to={item.href}
      className={cn(
        'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
        isActive
          ? 'bg-blue-50 text-blue-600'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
      )}
    >
      <Icon className={cn('h-5 w-5', isActive ? 'text-blue-600' : 'text-gray-400')} />
      <span className="flex-1">{t(item.key)}</span>
      {item.badge && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-500 px-1.5 text-xs font-medium text-white">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2 px-4 text-xs font-medium uppercase tracking-wider text-gray-400">
      {children}
    </h3>
  );
}

export function AppLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get user initials for avatar
  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.firstName) {
      return user.firstName.slice(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="flex h-screen bg-gray-100" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Sidebar */}
      <aside className="flex w-72 flex-col bg-white/80 backdrop-blur-sm m-3 rounded-2xl shadow-sm border border-gray-100">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-semibold tracking-tight text-gray-800">Lera AI</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          {/* Main Section */}
          <div className="mb-6">
            <SectionHeader>{t('nav.sections.general', 'General')}</SectionHeader>
            <div className="space-y-1">
              {mainNavigation.map((item) => (
                <NavItem
                  key={item.key}
                  item={item}
                  isActive={location.pathname === item.href}
                />
              ))}
            </div>
          </div>

          {/* Tools Section */}
          <div className="mb-6">
            <SectionHeader>{t('nav.sections.tools', 'Tools')}</SectionHeader>
            <div className="space-y-1">
              {toolsNavigation.map((item) => (
                <NavItem
                  key={item.key}
                  item={item}
                  isActive={location.pathname === item.href}
                />
              ))}
            </div>
          </div>

          {/* Support Section */}
          <div className="mb-6">
            <SectionHeader>{t('nav.sections.support', 'Support')}</SectionHeader>
            <div className="space-y-1">
              {supportNavigation.map((item) => (
                <NavItem
                  key={item.key}
                  item={item}
                  isActive={location.pathname === item.href}
                />
              ))}
            </div>
          </div>
        </nav>

        {/* Bottom Section - User Profile */}
        <div className="border-t border-gray-100 p-4">
          <div className="relative" ref={userMenuRef}>
            <div
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-gray-50 cursor-pointer group"
            >
              {/* Avatar */}
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-sm font-medium text-white shadow-md">
                {getInitials()}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user?.firstName || user?.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || 'user@example.com'}
                </p>
              </div>

              {/* Dropdown Arrow */}
              <ChevronDown className={cn(
                "h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-all duration-200",
                isUserMenuOpen && "-rotate-90"
              )} />
            </div>

            {/* Dropdown Menu - Opens to the side */}
            {isUserMenuOpen && (
              <div className={cn(
                "absolute bottom-0 w-48 rounded-xl bg-white border border-gray-100 shadow-lg py-2 z-50",
                isRTL ? "right-full mr-2" : "left-full ml-2"
              )}>
                <Link
                  to="/profile"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <User className="h-4 w-4 text-gray-400" />
                  {t('nav.myProfile', 'My Profile')}
                </Link>
                <div className="my-1 border-t border-gray-100" />
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  {t('auth.signOut')}
                </button>
              </div>
            )}
          </div>
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
