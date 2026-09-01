import type { ReactNode } from 'react';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
}

export function SectionHeader({ eyebrow, title, action }: SectionHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        marginBottom: 'var(--space-4)',
      }}
    >
      <div>
        {eyebrow && (
          <div
            className="cima-mono"
            style={{ fontSize: 10, color: 'var(--cima-text-tertiary)', marginBottom: 2, letterSpacing: '0.06em', textTransform: 'uppercase' }}
          >
            {eyebrow}
          </div>
        )}
        <h2 style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em', margin: 0 }}>
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}
