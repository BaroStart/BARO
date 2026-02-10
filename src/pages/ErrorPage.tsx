import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/Button';

interface ErrorPageProps {
  title?: string;
  message?: string;
}

export function ErrorPage({
  title = '문제가 발생했습니다',
  message = '잠시 후 다시 시도해주세요.',
}: ErrorPageProps) {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 sm:px-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <span className="text-2xl">!</span>
      </div>
      <h1 className="mt-6 text-xl font-semibold text-foreground">{title}</h1>
      <p className="mt-2 text-center text-muted-foreground">{message}</p>
      <div className="mt-8 flex gap-3">
        <Button variant="outline" onClick={() => window.location.reload()}>
          새로고침
        </Button>
        <Button onClick={() => navigate('/login')}>홈으로</Button>
      </div>
    </div>
  );
}
