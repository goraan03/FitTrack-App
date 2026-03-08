import React, { cloneElement, isValidElement } from 'react';
import { cn } from '../utils/cn';

type ButtonVariant = 'default' | 'ghost' | 'outline';
type ButtonSize = 'default' | 'sm' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  default: 'bg-amber-400 text-[#0a0a0f] hover:bg-amber-500',
  ghost: 'hover:bg-white/5 text-slate-300',
  outline: 'border border-[#27273a] bg-transparent text-white hover:bg-white/5',
};

const sizeClasses: Record<ButtonSize, string> = {
  default: 'h-11 px-4 py-2 text-sm',
  sm: 'h-9 px-3 text-sm',
  lg: 'h-12 px-6 text-base',
};

const baseClasses =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-semibold transition-all disabled:pointer-events-none disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-amber-400/50';

export function Button({ asChild, className, variant = 'default', size = 'default', children, ...rest }: ButtonProps) {
  const classes = cn(baseClasses, variantClasses[variant], sizeClasses[size], className);

  if (asChild && isValidElement(children)) {
    return cloneElement(children as React.ReactElement<any>, {
      className: cn(classes, (children.props as any)?.className),
      ...rest,
    } as any);
  }

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}

export default Button;
