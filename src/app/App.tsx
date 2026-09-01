import { AppProvider } from '@/state/AppContext';
import { AppShell } from '@/components/shell/AppShell';
import { ActionPreview } from '@/components/command/ActionPreview';

export default function App() {
  return (
    <AppProvider>
      <AppShell />
      {/* ActionPreview renders as overlay when a plan needs confirmation */}
      <ActionPreview />
    </AppProvider>
  );
}
