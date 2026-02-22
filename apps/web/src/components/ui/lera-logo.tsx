import { cn } from '@/lib/utils';

interface LeraLogoProps {
  className?: string;
  color?: 'brand' | 'white' | 'current';
}

export function LeraLogo({ className, color = 'brand' }: LeraLogoProps) {
  const fillColor = {
    brand: '#003545',
    white: 'white',
    current: 'currentColor',
  }[color];

  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-10 w-10', className)}
    >
      {/* Geometric L */}
      <rect x="8" y="6" width="8" height="28" rx="2" fill={fillColor} />
      <rect x="8" y="28" width="20" height="8" rx="2" fill={fillColor} />
      {/* AI accent dot */}
      <rect x="22" y="20" width="6" height="6" rx="1.5" fill={fillColor} opacity="0.5" />
    </svg>
  );
}
