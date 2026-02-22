import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Check, CheckCheck, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  user: {
    name: string;
    initials: string;
    color: string;
  };
  action: string;
  target: string;
  time: string;
  date: string;
  isRead: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    user: { name: 'David Cohen', initials: 'DC', color: 'bg-lera-800' },
    action: 'approved matter',
    target: 'Acme Corp Acquisition',
    time: '2 hours ago',
    date: 'Today',
    isRead: false,
  },
  {
    id: '2',
    user: { name: 'Sarah Levi', initials: 'SL', color: 'bg-purple-500' },
    action: 'added comment on',
    target: 'Beta Industries M&A',
    time: '4 hours ago',
    date: 'Today',
    isRead: false,
  },
  {
    id: '3',
    user: { name: 'Michael Ben', initials: 'MB', color: 'bg-green-500' },
    action: 'exported submission',
    target: "Dun's 100 - Real Estate",
    time: '6 hours ago',
    date: 'Today',
    isRead: true,
  },
  {
    id: '4',
    user: { name: 'Rachel Stern', initials: 'RS', color: 'bg-orange-500' },
    action: 'created new matter',
    target: 'Delta Corp Financing',
    time: '1 day ago',
    date: 'Yesterday',
    isRead: true,
  },
  {
    id: '5',
    user: { name: 'Yossi Katz', initials: 'YK', color: 'bg-red-500' },
    action: 'requested review on',
    target: 'Gamma Holdings Deal',
    time: '1 day ago',
    date: 'Yesterday',
    isRead: true,
  },
];

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isRTL?: boolean;
}

export function NotificationsPanel({ isOpen, onClose, isRTL = false }: NotificationsPanelProps) {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState(mockNotifications);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const filteredNotifications = activeTab === 'unread'
    ? notifications.filter((n) => !n.isRead)
    : notifications;

  // Group notifications by date
  const groupedNotifications = filteredNotifications.reduce((acc, notification) => {
    if (!acc[notification.date]) {
      acc[notification.date] = [];
    }
    acc[notification.date].push(notification);
    return acc;
  }, {} as Record<string, Notification[]>);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map((n) =>
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - subtle */}
      <div
        className="fixed inset-0 bg-black/10 z-40"
        onClick={onClose}
      />

      {/* Floating Panel - positioned next to sidebar */}
      <div
        ref={panelRef}
        className={cn(
          "fixed top-3 z-50 w-96 max-h-[calc(100vh-24px)] bg-white rounded-2xl shadow-2xl border border-gray-200/50 flex flex-col overflow-hidden",
          "animate-in fade-in slide-in-from-left-2 duration-200",
          isRTL ? "right-[16rem]" : "left-[16rem]"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-lera-100">
              <Bell className="h-4.5 w-4.5 text-lera-800" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                {t('notifications.title', 'Notifications')}
              </h2>
              {unreadCount > 0 && (
                <p className="text-xs text-gray-500">{t('notifications.unreadCount', { count: unreadCount })}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        {/* Tabs & Actions */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('all')}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                activeTab === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              {t('notifications.all', 'All')}
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5',
                activeTab === 'unread'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              {t('notifications.unread', 'Unread')}
              {unreadCount > 0 && (
                <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-lera-800 px-1 text-[10px] text-white">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-1 text-xs font-medium text-lera-800 hover:text-lera-900 transition-colors"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              {t('notifications.markAllRead', 'Mark all read')}
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto max-h-[400px]">
          {Object.keys(groupedNotifications).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <Check className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm font-medium">{t('notifications.noNotifications', 'All caught up!')}</p>
              <p className="text-xs text-gray-400 mt-1">{t('notifications.noNewNotifications', 'No new notifications')}</p>
            </div>
          ) : (
            Object.entries(groupedNotifications).map(([date, items]) => (
              <div key={date}>
                {/* Date Header */}
                <div className="px-5 py-2 bg-gray-50/80 sticky top-0">
                  <p className="text-xs font-medium text-gray-500">{date}</p>
                </div>

                {/* Notifications for this date */}
                <div>
                  {items.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleMarkAsRead(notification.id)}
                      className={cn(
                        'flex items-start gap-3 px-5 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50 last:border-0',
                        !notification.isRead && 'bg-lera-50/40'
                      )}
                    >
                      {/* Avatar */}
                      <div className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-medium text-white',
                        notification.user.color
                      )}>
                        {notification.user.initials}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 leading-snug">
                          <span className="font-semibold">{notification.user.name}</span>
                          {' '}{notification.action}{' '}
                          <span className="font-medium text-gray-700">{notification.target}</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{notification.time}</p>
                      </div>

                      {/* Unread indicator */}
                      {!notification.isRead && (
                        <div className="shrink-0 mt-1.5">
                          <div className="h-2 w-2 rounded-full bg-lera-800" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
          <button className="w-full text-xs font-medium text-lera-800 hover:text-lera-900 transition-colors">
            {t('notifications.viewAll', 'View all notifications')}
          </button>
        </div>
      </div>
    </>
  );
}
