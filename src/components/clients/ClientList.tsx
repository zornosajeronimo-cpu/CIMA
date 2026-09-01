import { useApp } from '@/state/AppContext';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ClientCard } from './ClientCard';

export function ClientList() {
  const { state } = useApp();

  return (
    <GlassSurface style={{ padding: 'var(--space-5)', height: '100%' }}>
      <SectionHeader eyebrow="Clients" title="Active engagements" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {state.clients.map((c) => (
          <ClientCard key={c.id} client={c} />
        ))}
      </div>
    </GlassSurface>
  );
}
