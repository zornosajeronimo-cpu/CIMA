import { useApp } from '@/state/AppContext';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ClientCard } from './ClientCard';

export function ClientList() {
  const { state } = useApp();
  const hasStack = state.clients.length > 1;

  return (
    <div className="cima-stack-wrap" style={{ height: '100%' }}>
      {/* Layered ghost cards behind the main surface — echoes the
          fanned card-stack visual from the reference, pure CSS. */}
      {hasStack && (
        <>
          <div className="cima-stack-ghost" style={{ inset: '10px -10px -10px 10px', opacity: 0.45 }} aria-hidden="true" />
          <div className="cima-stack-ghost" style={{ inset: '5px -5px -5px 5px', opacity: 0.7 }} aria-hidden="true" />
        </>
      )}
      <GlassSurface style={{ position: 'relative', padding: 'var(--space-5)', height: '100%' }}>
        <SectionHeader eyebrow="Clients" title="Active engagements" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {state.clients.map((c) => (
            <ClientCard key={c.id} client={c} />
          ))}
        </div>
      </GlassSurface>
    </div>
  );
}
