import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

// Button variants based on Blue & White theme
export type ButtonVariant = 
  | 'primary'      // Primary Blue (#2563EB)
  | 'secondary'    // Outlined Blue
  | 'accent'       // Light Blue
  | 'outline'      // Outlined style with blue border
  | 'ghost'        // Transparent background with blue text
  | 'danger'       // Error state (red)
  | 'success'      // Success state (green)
  | 'warning'      // Warning state (amber)
  | 'custom';      // Custom style

// Button sizes
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Button states
export type ButtonState = 'default' | 'loading' | 'disabled' | 'success';

// Button props interface
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  state?: ButtonState;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  rounded?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

// Button component with forwardRef for accessibility
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      state = 'default',
      leftIcon,
      rightIcon,
      fullWidth = false,
      rounded = false,
      loadingText,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    // Determine if button should be disabled
    const isDisabled = disabled || state === 'disabled' || state === 'loading';

    // Base button classes
    const baseClasses = [
      'inline-flex items-center justify-center font-medium transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'transform active:scale-[0.98]',
    ];

    // Variant-specific classes using new Blue & White theme
    const variantClasses = {
      primary: [
        'bg-primary text-text-inverse shadow-soft hover:shadow-elevated',
        'hover:-translate-y-0.5 hover:bg-primary-hover',
      ],
      secondary: [
        'bg-white border-2 border-primary text-primary shadow-soft hover:shadow-elevated',
        'hover:-translate-y-0.5 hover:bg-primary-50',
      ],
      accent: [
        'bg-primary-muted text-text-primary shadow-soft hover:shadow-elevated',
        'hover:-translate-y-0.5 hover:bg-primary-300',
      ],
      outline: [
        'border border-primary text-primary bg-transparent',
        'hover:bg-primary-50 hover:border-primary-hover',
      ],
      ghost: [
        'bg-transparent text-primary',
        'hover:bg-primary-50',
      ],
      danger: [
        'bg-error text-white shadow-soft hover:shadow-elevated',
        'hover:-translate-y-0.5 hover:bg-error/90',
      ],
      success: [
        'bg-success text-white shadow-soft hover:shadow-elevated',
        'hover:-translate-y-0.5 hover:bg-success/90',
      ],
      warning: [
        'bg-warning text-white shadow-soft hover:shadow-elevated',
        'hover:-translate-y-0.5 hover:bg-warning/90',
      ],
      custom: [
        'border border-primary text-primary bg-surface',
        'hover:bg-primary-50',
      ],
    };

    // Size-specific classes
    const sizeClasses = {
      xs: 'px-2.5 py-1.5 text-xs rounded-lg',
      sm: 'px-3.5 py-2 text-sm rounded-lg',
      md: 'px-4.5 py-2.5 text-sm rounded-xl',
      lg: 'px-6 py-3 text-base rounded-xl',
      xl: 'px-8 py-4 text-lg rounded-2xl',
    };

    // State-specific classes
    const stateClasses = {
      default: '',
      loading: 'cursor-wait',
      disabled: 'cursor-not-allowed opacity-50',
      success: 'bg-green-500 hover:bg-green-600',
    };

    // Width and border radius classes
    const widthClasses = fullWidth ? 'w-full' : '';
    const radiusClasses = rounded ? 'rounded-full' : '';

    // Combine all classes
    const buttonClasses = cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      stateClasses[state],
      widthClasses,
      radiusClasses,
      className
    );

    // Custom inline styles for different variants
    // Loading spinner component
    const LoadingSpinner = () => (
      <div className="loading-spinner w-4 h-4 mr-2" />
    );

    // Success checkmark icon
    const SuccessIcon = () => (
      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    );

    // Render button content based on state
    const renderContent = () => {
      if (state === 'loading') {
        return (
          <>
            <LoadingSpinner />
            {loadingText || children}
          </>
        );
      }

      if (state === 'success') {
        return (
          <>
            <SuccessIcon />
            {children}
          </>
        );
      }

      return (
        <>
          {leftIcon && <span className="mr-2">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="ml-2">{rightIcon}</span>}
        </>
      );
    };

    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={isDisabled}
        {...props}
      >
        {renderContent()}
      </button>
    );
  }
);

// Set display name for debugging
Button.displayName = 'Button';

// Pre-configured button variants for easy use
export const ButtonVariants = {
  Primary: (props: Omit<ButtonProps, 'variant'>) => <Button variant="primary" {...props} />,
  Secondary: (props: Omit<ButtonProps, 'variant'>) => <Button variant="secondary" {...props} />,
  Accent: (props: Omit<ButtonProps, 'variant'>) => <Button variant="accent" {...props} />,
  Outline: (props: Omit<ButtonProps, 'variant'>) => <Button variant="outline" {...props} />,
  Ghost: (props: Omit<ButtonProps, 'variant'>) => <Button variant="ghost" {...props} />,
  Danger: (props: Omit<ButtonProps, 'variant'>) => <Button variant="danger" {...props} />,
  Success: (props: Omit<ButtonProps, 'variant'>) => <Button variant="success" {...props} />,
  Warning: (props: Omit<ButtonProps, 'variant'>) => <Button variant="warning" {...props} />,
  Custom: (props: Omit<ButtonProps, 'variant'>) => <Button variant="custom" {...props} />,
};

// Pre-configured button sizes for easy use
export const ButtonSizes = {
  ExtraSmall: (props: Omit<ButtonProps, 'size'>) => <Button size="xs" {...props} />,
  Small: (props: Omit<ButtonProps, 'size'>) => <Button size="sm" {...props} />,
  Medium: (props: Omit<ButtonProps, 'size'>) => <Button size="md" {...props} />,
  Large: (props: Omit<ButtonProps, 'size'>) => <Button size="lg" {...props} />,
  ExtraLarge: (props: Omit<ButtonProps, 'size'>) => <Button size="xl" {...props} />,
};

// Specialized button components
export const IconButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'children'> & { icon: React.ReactNode }>(
  ({ icon, size = 'md', className, ...props }, ref) => {
    const iconSizeClasses = {
      xs: 'w-6 h-6',
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-12 h-12',
      xl: 'w-16 h-16',
    };

    return (
      <Button
        ref={ref}
        size={size}
        className={cn('p-0', iconSizeClasses[size], className)}
        {...props}
      >
        {icon}
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';

// Loading button component
export const LoadingButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'state'> & { loadingText?: string }>(
  ({ loadingText, children, ...props }, ref) => (
    <Button ref={ref} state="loading" loadingText={loadingText} {...props}>
      {children}
    </Button>
  )
);

LoadingButton.displayName = 'LoadingButton';

// Success button component
export const SuccessButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'state'>>(
  (props, ref) => (
    <Button ref={ref} state="success" {...props} />
  )
);

SuccessButton.displayName = 'SuccessButton';