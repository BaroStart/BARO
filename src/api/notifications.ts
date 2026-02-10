import type { NotificationResponse } from '@/generated';
import type { NotificationItem, NotificationType } from '@/stores/useNotificationStore';

import { isApiSuccess } from './response';

import { notificationsApi } from './clients';

// 전체 알림 목록 조회
export async function fetchAllNotifications(): Promise<NotificationItem[]> {
  const { data } = await notificationsApi.getNotifications();
  return (data.result ?? []).map(mapNotification);
}

// 최근 알림 조회
export async function fetchRecentNotifications(): Promise<NotificationItem[]> {
  const { data } = await notificationsApi.getRecentNotifications();
  return (data.result ?? []).map(mapNotification);
}

// 알림 읽음 처리
export async function markNotificationRead(notificationId: number): Promise<void> {
  await notificationsApi.readNotification({ notificationId });
}

// 공지 발송 (관리자)
export async function sendNotice(title: string, content: string): Promise<boolean> {
  const { data } = await notificationsApi.notice({ noticeRequest: { title, content } });
  return isApiSuccess(data);
}

// 개별 알림 발송 (관리자)
export async function sendNotificationToUser(
  receiverId: number,
  title: string,
  message: string,
): Promise<boolean> {
  const { data } = await notificationsApi.sendNotification({
    sendNotificationRequest: { receiverId, title, message },
  });
  return isApiSuccess(data);
}

// API 타입 → 스토어 타입 매핑
function mapApiType(type?: string): NotificationType {
  switch (type) {
    case 'FEEDBACK_REQUIRED':
    case 'FEEDBACK_RECEIVED':
      return 'feedback';
    case 'ASSIGNMENT_SUBMITTED':
    case 'NEW_ASSIGNMENT':
    case 'UNSUBMIT_ASSIGNMENT':
    case 'DEADLINE_ASSIGNMENT':
      return 'reminder';
    default:
      return 'system';
  }
}

function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

export function mapNotification(res: NotificationResponse): NotificationItem {
  return {
    id: res.id ?? 0,
    type: mapApiType(res.type),
    title: res.title ?? '',
    message: res.message ?? '',
    time: formatRelativeTime(res.createdAt),
    isRead: res.read ?? false,
  };
}
