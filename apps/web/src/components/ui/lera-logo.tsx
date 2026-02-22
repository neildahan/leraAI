import { cn } from '@/lib/utils';

interface LeraLogoProps {
  className?: string;
  variant?: 'default' | 'white';
}

export function LeraLogo({ className, variant = 'default' }: LeraLogoProps) {
  const colors = variant === 'white'
    ? { primary: '#ffffff', secondary: 'rgba(255,255,255,0.6)', accent: 'rgba(255,255,255,0.8)' }
    : { primary: '#003545', secondary: '#0097b2', accent: '#00d4aa' };

  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-10 w-10', className)}
    >
      {/* Clean overlapping circles */}
      <circle cx="16" cy="20" r="12" fill={colors.secondary} />
      <circle cx="24" cy="20" r="10" fill={colors.primary} />

      {/* AI Sparkle instead of dot */}
      <path
        d="M34 14 L36 18 L40 20 L36 22 L34 26 L32 22 L28 20 L32 18 Z"
        fill={colors.accent}
      />
    </svg>
  );
}
