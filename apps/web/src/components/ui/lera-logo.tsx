import { cn } from '@/lib/utils';

interface LeraLogoProps {
  className?: string;
  variant?: 'default' | 'white';
}

export function LeraLogo({ className, variant = 'default' }: LeraLogoProps) {
  const id = `lera-grad-${Math.random().toString(36).substr(2, 9)}`;

  const colors = variant === 'white'
    ? { c1: '#ffffff', c2: 'rgba(255,255,255,0.7)', c3: 'rgba(255,255,255,0.5)' }
    : { c1: '#003545', c2: '#0097b2', c3: '#00d4aa' };

  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-10 w-10', className)}
    >
      <defs>
        <linearGradient id={id} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={colors.c1} />
          <stop offset="100%" stopColor={colors.c2} />
        </linearGradient>
      </defs>

      {/* Abstract flowing shapes - represents AI synthesis/flow */}

      {/* Main curved shape */}
      <path
        d="M8 32 Q8 8 20 8 Q32 8 32 20 Q32 28 24 28 Q18 28 18 22 Q18 16 24 16"
        stroke={`url(#${id})`}
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />

      {/* Accent dot */}
      <circle cx="30" cy="10" r="4" fill={colors.c3} />
    </svg>
  );
}
