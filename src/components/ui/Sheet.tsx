import * as React from 'react';
import { Drawer } from 'vaul';

import { cn } from '@/lib/utils';

function Sheet({ open, onOpenChange, children, ...props }: React.ComponentProps<typeof Drawer.Root>) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} {...props}>
      {children}
    </Drawer.Root>
  );
}

function SheetOverlay({ className, ...props }: React.ComponentProps<typeof Drawer.Overlay>) {
  return (
    <Drawer.Overlay className={cn('fixed inset-0 z-[9998] bg-black/20', className)} {...props} />
  );
}

function SheetContent({
  children,
  className,
  ...props
}: React.ComponentProps<typeof Drawer.Content>) {
  return (
    <Drawer.Portal>
      <SheetOverlay />
      <Drawer.Content
        className={cn(
          'fixed inset-x-0 bottom-0 z-[9999] mx-auto flex max-w-md flex-col rounded-t-2xl border-t border-slate-100 bg-white outline-none sm:max-w-lg',
          className,
        )}
        aria-describedby={undefined}
        {...props}
      >
        <div className="mx-auto mb-2 mt-3 h-1 w-8 rounded-full bg-slate-200" />
        {children}
      </Drawer.Content>
    </Drawer.Portal>
  );
}

function SheetHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-5 pb-3', className)}>{children}</div>;
}

function SheetTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Drawer.Title className={cn('text-sm font-semibold text-slate-800', className)}>
      {children}
    </Drawer.Title>
  );
}

function SheetBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('border-t border-slate-100 px-5 py-4', className)}>{children}</div>
  );
}

function SheetFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn('flex gap-2 border-t border-slate-100 px-5 py-3', className)}
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      {children}
    </div>
  );
}

export { Sheet, SheetContent, SheetHeader, SheetTitle, SheetBody, SheetFooter };
