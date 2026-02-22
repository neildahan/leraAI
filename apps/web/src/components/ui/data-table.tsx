import * as React from 'react';
import { SlidersHorizontal, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  title?: string;
  columns: Column<T>[];
  data: T[];
  showFilters?: boolean;
  showRowNumbers?: boolean;
  showActions?: boolean;
  onFilter?: () => void;
  onRowAction?: (item: T) => void;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  title,
  columns,
  data,
  showFilters = true,
  showRowNumbers = true,
  showActions = true,
  onFilter,
  onRowAction,
  emptyMessage = 'No data found',
  className,
}: DataTableProps<T>) {
  return (
    <div className={cn('rounded-2xl border border-gray-100 bg-white shadow-sm', className)}>
      {/* Header */}
      {(title || showFilters) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          )}
          {showFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onFilter}
              className="rounded-xl gap-2"
            >
              Filters
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {showRowNumbers && (
                <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wider text-gray-400">
                  No.
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={cn(
                    'px-6 py-4 text-start text-xs font-medium uppercase tracking-wider text-gray-400',
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
              {showActions && (
                <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wider text-gray-400">

                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (showRowNumbers ? 1 : 0) + (showActions ? 1 : 0)}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  {showRowNumbers && (
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {index + 1}
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className={cn('px-6 py-4 text-sm text-gray-900', col.className)}
                    >
                      {col.render
                        ? col.render(item, index)
                        : String(item[col.key as keyof T] ?? '')}
                    </td>
                  ))}
                  {showActions && (
                    <td className="px-6 py-4">
                      <button
                        onClick={() => onRowAction?.(item)}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
