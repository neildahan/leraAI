import { cn } from '@/lib/utils';

interface LeraLogoProps {
  className?: string;
  variant?: 'default' | 'white';
}

export function LeraLogo({ className, variant = 'default' }: LeraLogoProps) {
  // Colors based on variant
  const colors = variant === 'white'
    ? {
        shape1: '#ffffff',
        shape2: 'rgba(255,255,255,0.7)',
        dot: 'rgba(255,255,255,0.9)',
      }
    : {
        shape1: '#003545',      // Main brand color
        shape2: '#0087b1',      // Lighter accent
        dot: '#00b4d8',         // Bright accent for the dot
      };

  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-10 w-10', className)}
    >
      {/* Modern abstract checkmark with overlapping shapes */}

      {/* Back shape - angled rectangle */}
      <rect
        x="6"
        y="14"
        width="8"
        height="22"
        rx="4"
        fill={colors.shape2}
        transform="rotate(-45 6 14)"
      />

      {/* Front shape - angled rectangle */}
      <rect
        x="12"
        y="8"
        width="8"
        height="28"
        rx="4"
        fill={colors.shape1}
        transform="rotate(45 12 8)"
      />

      {/* AI dot - represents intelligence/automation */}
      <circle
        cx="30"
        cy="10"
        r="5"
        fill={colors.dot}
      />
    </svg>
  );
}
