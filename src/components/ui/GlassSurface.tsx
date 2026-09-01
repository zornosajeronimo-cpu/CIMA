import type { CSSProperties, ReactNode } from 'react';

interface GlassSurfaceProps {
  children: ReactNode;
  /** Standard elevated card — use for most secondary surfaces. */
  raised?: boolean;
  /** The single most prominent surface on a screen. Use at most once per view. */
  hero?: boolean;
  radius?: 'md' | 'lg' | 'xl';
  className?: string;
  style?: CSSProperties;
}

export function GlassSurface({
  children,
  raised = false,
  hero = false,
  radius = 'lg',
  className = '',
  style = {},
}: GlassSurfaceProps) {
  const variant = hero ? 'cima-glass-hero' : raised ? 'cima-glass-raised' : 'cima-glass';
  return (
    <div
      className={`${variant} ${className}`}
      style={{ borderRadius: `var(--radius-${radius})`, ...style }}
    >
      {children}
    </div>
  );
}
