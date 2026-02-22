import { cn } from '@/lib/utils';

interface LeraLogoProps {
  className?: string;
  variant?: 'default' | 'white';
}

export function LeraLogo({ className, variant = 'default' }: LeraLogoProps) {
  const colors = variant === 'white'
    ? {
        primary: '#ffffff',
        secondary: 'rgba(255,255,255,0.6)',
        accent: 'rgba(255,255,255,0.85)',
      }
    : {
        primary: '#003545',
        secondary: '#0097b2',
        accent: '#00c2cb',
      };

  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-10 w-10', className)}
    >
      {/* Clean checkmark style - like Customer.io */}

      {/* Short arm of checkmark (back) */}
      <path
        d="M8 20 L14 26"
        stroke={colors.secondary}
        strokeWidth="7"
        strokeLinecap="round"
      />

      {/* Long arm of checkmark (front) */}
      <path
        d="M14 26 L32 8"
        stroke={colors.primary}
        strokeWidth="7"
        strokeLinecap="round"
      />

      {/* AI dot */}
      <circle
        cx="32"
        cy="8"
        r="4.5"
        fill={colors.accent}
      />
    </svg>
  );
}
