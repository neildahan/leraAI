import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChartCardProps {
  title: string;
  filterOptions?: string[];
  selectedFilter?: string;
  onFilterChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export function ChartCard({
  title,
  filterOptions,
  selectedFilter,
  onFilterChange,
  children,
  className,
  action,
}: ChartCardProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn('rounded-2xl border border-gray-100 bg-white p-6 shadow-sm', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>

        {filterOptions && filterOptions.length > 0 ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {selectedFilter || filterOptions[0]}
              <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
            </button>

            {isOpen && (
              <div className="absolute right-0 top-full mt-2 w-36 rounded-xl border border-gray-100 bg-white py-1 shadow-lg z-10">
                {filterOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      onFilterChange?.(option);
                      setIsOpen(false);
                    }}
                    className={cn(
                      'w-full px-4 py-2 text-start text-sm hover:bg-gray-50 transition-colors',
                      selectedFilter === option ? 'text-lera-800 font-medium' : 'text-gray-700'
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : action ? (
          action
        ) : null}
      </div>

      {/* Content */}
      <div>{children}</div>
    </div>
  );
}
