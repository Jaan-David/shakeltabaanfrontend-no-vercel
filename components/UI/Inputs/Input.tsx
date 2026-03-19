import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  onIconClick?: () => void;
  iconAriaLabel?: string;
  error?: boolean;
  iconPosition?: 'left' | 'right';
  readOnly?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      icon,
      onIconClick,
      iconAriaLabel,
      error,
      iconPosition = 'right',
      readOnly = false,
      ...props
    },
    ref
  ) => {
    const sidePadding = icon
      ? iconPosition === 'right'
        ? 'pr-12 pl-4'
        : 'pl-12 pr-4'
      : 'px-4';
    
    return (
      <div className="relative w-full">
        <input
          ref={ref}
          readOnly={readOnly}
          className={cn(
            'w-full h-[44px] rounded-xl border bg-surface-2 text-right py-3 appearance-none',
            sidePadding,
            'border-border text-text-1 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand',
            'transition-all duration-200 placeholder-text-3',
            error ? 'border-error focus:ring-error' : '',
            readOnly ? 'cursor-not-allowed opacity-60 bg-surface-3' : '',
            className
          )}
          {...props}
        />
        {icon && (
          onIconClick ? (
            <button
              type="button"
              onClick={onIconClick}
              aria-label={iconAriaLabel || 'input action'}
              className={cn(
                'absolute top-1/2 transform -translate-y-1/2 text-text-3 hover:text-text-2 transition-colors',
                iconPosition === 'right' ? 'right-4' : 'left-4'
              )}
            >
              {icon}
            </button>
          ) : (
            <span
              aria-hidden="true"
              className={cn(
                'absolute top-1/2 transform -translate-y-1/2 text-text-3 pointer-events-none',
                iconPosition === 'right' ? 'right-4' : 'left-4'
              )}
            >
              {icon}
            </span>
          )
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;