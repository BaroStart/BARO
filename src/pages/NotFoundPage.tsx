import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/Button';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 sm:px-6">
      <p className="text-7xl font-bold text-primary">404</p>
      <h1 className="mt-4 text-xl font-semibold text-foreground">페이지를 찾을 수 없습니다</h1>
      <p className="mt-2 text-muted-foreground">
        요청하신 페이지가 존재하지 않거나 이동되었습니다.
      </p>
      <div className="mt-8 flex gap-3">
        <Button variant="outline" onClick={() => navigate(-1)}>
          이전으로
        </Button>
        <Button onClick={() => navigate('/login')}>홈으로</Button>
      </div>
    </div>
  );
}
