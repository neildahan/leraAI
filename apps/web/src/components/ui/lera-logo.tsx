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

      {/* Accent dot */}
      <circle cx="34" cy="14" r="4" fill={colors.accent} />
    </svg>
  );
}
