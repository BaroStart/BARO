import * as React from 'react';

import { cn } from '@/lib/utils';

import { Label } from './Label';

interface InputProps extends React.ComponentProps<'input'> {
  label?: string;
  labelClassName?: string;
  endAdornment?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, labelClassName, endAdornment, id, ...props }, ref) => {
    const inputElement = endAdornment ? (
      <div className="relative">
        <input
          type={type}
          id={id}
          className={cn(
            'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 pr-10 text-sm shadow-sm transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
          ref={ref}
          {...props}
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 [&>*]:pointer-events-auto">
          {endAdornment}
        </div>
      </div>
    ) : (
      <input
        type={type}
        id={id}
        className={cn(
          'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        ref={ref}
        {...props}
      />
    );

    if (label) {
      return (
        <div className="space-y-2">
          <Label htmlFor={id} className={cn('text-sm font-medium text-foreground', labelClassName)}>
            {label}
          </Label>
          {inputElement}
        </div>
      );
    }

    return inputElement;
  },
);
Input.displayName = 'Input';

export { Input };
