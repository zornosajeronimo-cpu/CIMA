interface StatTileProps {
  label: string;
  value: string | number;
}

/** Compact metric tile — the replacement for decorative empty cards.
 * Use in a grid of 3-4 at the top of any data-heavy view. */
export function StatTile({ label, value }: StatTileProps) {
  return (
    <div
      style={{
        background: 'var(--cima-surface-1)',
        border: '1px solid var(--cima-border)',
        borderRadius: 'var(--radius-md)',
        padding: '13px 16px',
      }}
    >
      <div
        style={{
          fontSize: 10.5,
          color: 'var(--cima-text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.01em' }}>{value}</div>
    </div>
  );
}

export function StatStrip({ items }: { items: StatTileProps[] }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 10,
        marginBottom: 16,
      }}
    >
      {items.map((it) => (
        <StatTile key={it.label} {...it} />
      ))}
    </div>
  );
}
