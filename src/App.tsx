import { ApiErrorBanner } from '@/components/ui/ApiErrorBanner';
import { Toaster } from '@/components/ui/Toast';
import { AppRoutes } from '@/routes';
import { useApiErrorStore } from '@/stores/useApiErrorStore';

function App() {
  const hasError = useApiErrorStore((s) => !!s.error);

  return (
    <>
      <ApiErrorBanner />
      <div className={hasError ? 'pt-12' : undefined}>
        <AppRoutes />
      </div>
      <Toaster />
    </>
  );
}

export default App;
