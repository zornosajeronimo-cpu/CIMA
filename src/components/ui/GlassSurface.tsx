import type { CSSProperties, ReactNode } from 'react';

interface GlassSurfaceProps {
  children: ReactNode;
  raised?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function GlassSurface({ children, raised = false, className = '', style = {} }: GlassSurfaceProps) {
  return (
    <div
      className={`${raised ? 'cima-glass-raised' : 'cima-glass'} ${className}`}
      style={{ borderRadius: 'var(--radius-lg)', ...style }}
    >
      {children}
    </div>
  );
}
