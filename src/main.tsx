import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { QueryClientProvider } from '@tanstack/react-query';

import App from './App';
import { applyPaletteAsBrand, getTimetablePaletteId } from '@/lib/timetableColorStorage';
import { getCustomBrandColor, applyCustomBrandColor } from '@/lib/customColorStorage';
import { queryClient } from '@/lib/queryClient';

import './index.css';

// 테마 초기화: 커스텀 컬러 있으면 적용, 없으면 타임테이블 팔레트 기반
const custom = getCustomBrandColor();
if (custom) {
  applyCustomBrandColor(custom);
} else {
  applyPaletteAsBrand(getTimetablePaletteId());
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
