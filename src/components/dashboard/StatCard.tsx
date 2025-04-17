import React from 'react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    isIncrease: boolean;
  };
  icon?: React.ReactNode;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, className }) => {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="flex items-center p-5">
        {icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600">
            {icon}
          </div>
        )}
        <div className={cn('flex flex-col', icon && 'ml-4')}>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
          {change && (
            <div className="mt-1 flex items-center text-xs">
              <span
                className={cn(
                  'font-medium',
                  change.isIncrease ? 'text-success-600' : 'text-danger-600'
                )}
              >
                {change.isIncrease ? '+' : '-'}{Math.abs(change.value)}%
              </span>
              <span className="ml-1 text-gray-500">from previous period</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default StatCard;


