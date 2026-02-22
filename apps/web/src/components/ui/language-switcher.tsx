import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית' },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  // Direction is automatically updated by i18n event listener in i18n/index.ts
  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
  };

  return (
    <Select value={i18n.language} onValueChange={changeLanguage}>
      <SelectTrigger className="w-[140px]">
        <Languages className="me-2 h-4 w-4" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {languages.map((language) => (
          <SelectItem key={language.code} value={language.code}>
            {language.nativeName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
