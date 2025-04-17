import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'custom';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
}

const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'md',
  rounded = false,
  children,
  ...props
}) => {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-primary-100 text-primary-800',
    secondary: 'bg-secondary-100 text-secondary-800',
    success: 'bg-success-100 text-success-800',
    warning: 'bg-warning-100 text-warning-800',
    danger: 'bg-danger-100 text-danger-800',
    info: 'bg-blue-100 text-blue-800',
    custom: '',
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-0.5',
    lg: 'text-sm px-3 py-1',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium',
        variant !== 'custom' && variantClasses[variant],
        sizeClasses[size],
        rounded ? 'rounded-full' : 'rounded',
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;


