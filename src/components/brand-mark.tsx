import * as React from 'react';
import { cn } from '@/lib/utils';

interface BrandMarkProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  withWordmark?: boolean;
}

/**
 * BrandMark — özel "MD" monogram. İç içe geçmiş iki kare, tek stroke.
 * Geometrik, hızlı tanınır, hiçbir metne bağlı değil.
 */
export function BrandMark({
  size = 22,
  className,
  withWordmark = false,
  ...props
}: BrandMarkProps) {
  const id = React.useId();
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        aria-hidden
        {...props}
      >
        <defs>
          <clipPath id={`${id}-clip`}>
            <rect x="3" y="3" width="18" height="18" rx="3" />
          </clipPath>
        </defs>
        {/* Outer square frame */}
        <rect
          x="3.5"
          y="3.5"
          width="17"
          height="17"
          rx="2.5"
          stroke="currentColor"
          strokeWidth="1.25"
        />
        {/* Inner "M"+"D" monogram — single path */}
        <g
          clipPath={`url(#${id}-clip)`}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          {/* M */}
          <path d="M6.5 16.5 L6.5 7.5 L9.5 13 L12.5 7.5 L12.5 16.5" />
          {/* D */}
          <path d="M14.5 7.5 L17.5 7.5 Q18.5 7.5 18.5 8.5 L18.5 15.5 Q18.5 16.5 17.5 16.5 L14.5 16.5 Z" />
        </g>
      </svg>
      {withWordmark ? (
        <span className="font-display text-sm font-semibold tracking-tight text-ink-primary">
          MD
        </span>
      ) : null}
    </span>
  );
}
