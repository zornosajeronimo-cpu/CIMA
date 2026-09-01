import { useState, useEffect, useMemo } from 'react';
import { NAV_SECTIONS } from '@/lib/nav';
import { useApp } from '@/state/AppContext';

export function TopBar() {
  const { state } = useApp();
  const activeSection = NAV_SECTIONS.find((s) => s.id === state.activeSection) ?? NAV_SECTIONS[0];

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const formatted = useMemo(
    () =>
      time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
      ' · ' +
      time.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' }),
    [time]
  );

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 28px',
        borderBottom: '1px solid var(--cima-border)',
        flexShrink: 0,
      }}
    >
      <span className="cima-mono" style={{ fontSize: 11, color: 'var(--cima-text-tertiary)' }}>
        {activeSection.label}
      </span>
      <span className="cima-mono" style={{ fontSize: 11, color: 'var(--cima-text-tertiary)' }}>
        {formatted}
      </span>
    </div>
  );
}
