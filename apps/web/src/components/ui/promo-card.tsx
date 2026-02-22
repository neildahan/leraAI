import * as React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface PromoCardProps {
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonIcon?: LucideIcon;
  onButtonClick?: () => void;
  gradient?: 'blue' | 'purple' | 'green' | 'orange' | 'lera';
  className?: string;
}

const gradientStyles = {
  blue: 'bg-gradient-to-br from-lera-600 via-lera-700 to-lera-800',
  lera: 'bg-gradient-to-br from-lera-600 via-lera-700 to-lera-800',
  purple: 'bg-gradient-to-br from-purple-400 via-purple-500 to-pink-500',
  green: 'bg-gradient-to-br from-green-400 via-green-500 to-teal-500',
  orange: 'bg-gradient-to-br from-orange-400 via-orange-500 to-red-500',
};

export function PromoCard({
  title,
  subtitle,
  buttonText,
  buttonIcon: ButtonIcon,
  onButtonClick,
  gradient = 'blue',
  className,
}: PromoCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl p-6 text-white shadow-lg',
        gradientStyles[gradient],
        className
      )}
    >
      {/* Decorative blobs */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute right-12 bottom-12 h-24 w-24 rounded-full bg-white/5 blur-xl" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div>
          <h3 className="text-xl font-semibold leading-tight mb-2">{title}</h3>
          {subtitle && (
            <p className="text-sm text-white/80">{subtitle}</p>
          )}
        </div>

        {buttonText && (
          <div className="mt-6 flex items-center gap-3">
            {ButtonIcon && (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <ButtonIcon className="h-5 w-5" />
              </div>
            )}
            <Button
              onClick={onButtonClick}
              variant="outline"
              className="rounded-full border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm"
            >
              {buttonText}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
