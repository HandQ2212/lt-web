import type { ReactNode } from 'react';

export const xssLabEnabled = import.meta.env.DEV && import.meta.env.VITE_XSS_LAB === 'true';

type XssLabTextProps = {
  value?: string | null;
  fallback?: ReactNode;
};

export function XssLabText({ value, fallback = '' }: XssLabTextProps) {
  const text = value || (typeof fallback === 'string' ? fallback : '');

  if (!xssLabEnabled) {
    return <>{value || fallback}</>;
  }

  return <span dangerouslySetInnerHTML={{ __html: text }} />;
}
