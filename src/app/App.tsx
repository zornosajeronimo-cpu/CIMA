import { AppProvider } from '@/state/AppContext';
import { AppShell } from '@/components/shell/AppShell';

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
