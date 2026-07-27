'use client';

import { useEffect, useState } from 'react';
import { formatSavedAgo } from '@/lib/editor-utils';

interface RelativeTimeProps {
  value: Date | string | number;
  className?: string;
  /** Render an empty string on the server / before mount. */
  fallback?: string;
}

/**
 * RelativeTime — renders a relative date string that is only computed on the
 * client (after mount) to avoid SSR/CSR hydration mismatches.
 */
export function RelativeTime({
  value,
  className,
  fallback = '',
}: RelativeTimeProps) {
  const [text, setText] = useState<string>(fallback);
  useEffect(() => {
    // Client-only computation — the value depends on current time.
    /* eslint-disable react-hooks/set-state-in-effect */
    setText(formatSavedAgo(value));
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [value]);

  return <span className={className}>{text}</span>;
}
