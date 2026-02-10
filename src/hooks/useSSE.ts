import { useEffect, useRef } from 'react';

import { mapNotification } from '@/api/notifications';
import { useAuthStore } from '@/stores/useAuthStore';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { API_CONFIG } from '@/api/config';

/**
 * SSE 구독 훅
 * - 로그인 상태에서 /api/sse/subscribe?topics=user_{userId} 연결
 * - 이벤트 수신 시 알림 스토어에 추가
 * - 컴포넌트 unmount 시 연결 해제
 */
export function useSSE() {
  const user = useAuthStore((s) => s.user);
  const upsertMany = useNotificationStore((s) => s.upsertMany);
  const loadNotifications = useNotificationStore((s) => s.loadNotifications);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    // 초기 알림 로드
    loadNotifications();

    const baseURL = API_CONFIG.baseURL || '';
    const topics = `user_${user.id}`;
    const url = `${baseURL}/api/sse/subscribe?topics=${encodeURIComponent(topics)}`;

    const es = new EventSource(url);
    esRef.current = es;

    es.addEventListener('notification', (event) => {
      try {
        const data = JSON.parse(event.data);
        upsertMany([mapNotification(data)]);
      } catch {
        // ignore parse errors
      }
    });

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        upsertMany([mapNotification(data)]);
      } catch {
        // ignore parse errors
      }
    };

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [user?.id, upsertMany, loadNotifications]);
}
