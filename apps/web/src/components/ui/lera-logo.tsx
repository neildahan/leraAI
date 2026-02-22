import { cn } from '@/lib/utils';

interface LeraLogoProps {
  className?: string;
  variant?: 'default' | 'white';
}

export function LeraLogo({ className, variant = 'default' }: LeraLogoProps) {
  const id = `lera-gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-10 w-10', className)}
    >
      <defs>
        {/* Gradient for modern feel */}
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={variant === 'white' ? '#ffffff' : '#00b4d8'} />
          <stop offset="100%" stopColor={variant === 'white' ? 'rgba(255,255,255,0.7)' : '#003545'} />
        </linearGradient>
      </defs>

      {/* Modern abstract L mark with gradient */}
      {/* Vertical bar */}
      <rect
        x="8"
        y="6"
        width="10"
        height="28"
        rx="5"
        fill={`url(#${id})`}
      />

      {/* Horizontal bar - slightly overlapping */}
      <rect
        x="8"
        y="24"
        width="24"
        height="10"
        rx="5"
        fill={variant === 'white' ? 'rgba(255,255,255,0.85)' : '#003545'}
      />

      {/* Small accent dot - AI element */}
      <circle
        cx="32"
        cy="12"
        r="4"
        fill={variant === 'white' ? '#ffffff' : '#00b4d8'}
      />
    </svg>
  );
}
