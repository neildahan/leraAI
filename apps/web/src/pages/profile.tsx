import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Check, Camera, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const languages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱' },
];

export function ProfilePage() {
  const { t, i18n } = useTranslation();
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: 'destructive',
          title: t('profile.fileTooLarge', 'File too large'),
          description: t('profile.maxFileSize', 'Maximum file size is 5MB'),
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarUrl(e.target?.result as string);
        toast({
          title: t('profile.avatarUpdated', 'Avatar updated'),
          description: t('profile.avatarUpdatedDescription', 'Your profile picture has been updated'),
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLanguageChange = (langCode: string) => {
    setSelectedLanguage(langCode);
    i18n.changeLanguage(langCode);
    document.documentElement.dir = langCode === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = langCode;
    toast({
      title: t('profile.languageChanged', 'Language changed'),
      description: t('profile.languageChangedDescription', 'Your language preference has been updated'),
    });
  };

  const handleSave = async () => {
    try {
      await updateUser({ firstName, lastName });
      toast({
        title: t('common.success', 'Success'),
        description: t('profile.profileUpdated', 'Your profile has been updated'),
      });
    } catch {
      toast({
        variant: 'destructive',
        title: t('common.error', 'Error'),
        description: t('profile.updateFailed', 'Failed to update profile'),
      });
    }
  };

  // Get user initials for avatar
  const getInitials = () => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return firstName.slice(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('nav.myProfile', 'My Profile')}</h1>
        <p className="text-muted-foreground">{t('profile.subtitle', 'Manage your account settings and preferences')}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Profile Header with Avatar */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-10">
            <div className="flex items-end gap-6">
              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="h-24 w-24 rounded-full object-cover shadow-lg border-4 border-white/30"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl font-semibold text-white shadow-lg border-4 border-white/30">
                    {getInitials()}
                  </div>
                )}
                <button
                  onClick={handleAvatarClick}
                  className="absolute -bottom-1 -right-1 h-9 w-9 rounded-full bg-white shadow-md flex items-center justify-center text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div className="pb-1">
                <h2 className="text-xl font-semibold text-white">
                  {firstName && lastName ? `${firstName} ${lastName}` : firstName || user?.email?.split('@')[0] || 'User'}
                </h2>
                <p className="text-blue-100">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8">
            {/* Personal Information */}
            <div className="mb-10">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-6">
                {t('profile.personalInfo', 'Personal Information')}
              </h3>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-gray-700">{t('profile.firstName', 'First Name')}</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder={t('profile.firstNamePlaceholder', 'Enter your first name')}
                    className="h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-gray-700">{t('profile.lastName', 'Last Name')}</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder={t('profile.lastNamePlaceholder', 'Enter your last name')}
                    className="h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <Label htmlFor="email" className="text-gray-700">{t('common.email', 'Email')}</Label>
                <div className="relative">
                  <Mail className="absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    defaultValue={user?.email || ''}
                    className="h-12 ps-12 rounded-xl border-gray-200 bg-gray-50 text-gray-500"
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 my-8" />

            {/* Language Settings */}
            <div className="mb-10">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-6">
                {t('profile.languageSettings', 'Language Settings')}
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={cn(
                      'flex items-center gap-4 rounded-xl border-2 p-5 transition-all duration-200 text-start',
                      selectedLanguage === lang.code
                        ? 'border-blue-500 bg-blue-50/50'
                        : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                    )}
                  >
                    <span className="text-4xl">{lang.flag}</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{lang.nativeName}</p>
                      <p className="text-sm text-gray-500">{lang.name}</p>
                    </div>
                    <div className={cn(
                      'h-6 w-6 rounded-full flex items-center justify-center transition-all',
                      selectedLanguage === lang.code
                        ? 'bg-blue-500'
                        : 'border-2 border-gray-200'
                    )}>
                      {selectedLanguage === lang.code && (
                        <Check className="h-4 w-4 text-white" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 my-8" />

            {/* Security */}
            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-6">
                {t('profile.security', 'Security')}
              </h3>

              <div className="flex items-center justify-between p-5 rounded-xl bg-gray-50 border border-gray-100">
                <div>
                  <p className="font-medium text-gray-900">{t('profile.password', 'Password')}</p>
                  <p className="text-sm text-gray-500 mt-0.5">••••••••••••</p>
                </div>
                <Button variant="outline" className="rounded-xl">
                  {t('profile.changePassword', 'Change')}
                </Button>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <Button
                onClick={handleSave}
                className="h-12 px-8 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium"
              >
                {t('profile.saveChanges', 'Save Changes')}
              </Button>
            </div>
          </div>
        </div>
      </div>
  );
}
