import { cn } from '@/lib/utils';

interface LeraLogoProps {
  className?: string;
  variant?: 'default' | 'white';
}

export function LeraLogo({ className, variant = 'default' }: LeraLogoProps) {
  const primaryColor = variant === 'white' ? '#ffffff' : '#003545';
  const accentColor = variant === 'white' ? 'rgba(255,255,255,0.6)' : '#0087b1';

  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-10 w-10', className)}
    >
      {/* Modern AI Brain/Network inspired logo */}
      {/* Central hexagon - represents AI core */}
      <path
        d="M20 6L28.66 11V21L20 26L11.34 21V11L20 6Z"
        fill={primaryColor}
      />

      {/* Neural connection nodes */}
      <circle cx="20" cy="6" r="2.5" fill={accentColor} />
      <circle cx="28.66" cy="11" r="2" fill={accentColor} />
      <circle cx="28.66" cy="21" r="2" fill={accentColor} />
      <circle cx="20" cy="26" r="2.5" fill={accentColor} />
      <circle cx="11.34" cy="21" r="2" fill={accentColor} />
      <circle cx="11.34" cy="11" r="2" fill={accentColor} />

      {/* Outer orbital rings - AI processing */}
      <circle
        cx="20"
        cy="16"
        r="14"
        stroke={accentColor}
        strokeWidth="1.5"
        fill="none"
        strokeDasharray="4 6"
        opacity="0.5"
      />

      {/* Inner L letterform subtly integrated */}
      <path
        d="M17 11V19H23"
        stroke={variant === 'white' ? '#003545' : '#ffffff'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
