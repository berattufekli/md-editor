import * as React from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  hint?: string;
  action?: React.ReactNode;
  className?: string;
  /** Optional keyboard shortcut hint rendered as a monospace row. */
  shortcut?: string;
}

export function EmptyState({
  icon,
  title,
  hint,
  action,
  className,
  shortcut,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex h-full w-full flex-col items-center justify-center px-6 text-center',
        className,
      )}
    >
      {icon ? (
        <div
          className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full border border-rule text-ink-tertiary"
          aria-hidden
        >
          {icon}
        </div>
      ) : null}
      <h2 className="font-display text-base font-semibold text-ink-primary tracking-tight">
        {title}
      </h2>
      {hint ? (
        <p className="mt-1.5 max-w-sm text-[0.8125rem] leading-relaxed text-ink-secondary">
          {hint}
        </p>
      ) : null}
      {shortcut ? (
        <p className="mt-3 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-ink-tertiary">
          {shortcut}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
