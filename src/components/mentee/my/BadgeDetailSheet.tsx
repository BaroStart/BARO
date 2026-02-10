import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LockKeyhole } from 'lucide-react';
import type { BadgeItem } from './badgeIcons';
import { iconFor } from './badgeIcons';

type Props = {
  open: boolean;
  badge: BadgeItem | null;
  onClose: () => void;
};

const BADGE_DESCRIPTIONS: Record<string, string> = {
  badge_first_assignment: '첫 번째 과제를 제출했어요! 멋져요.',
  badge_attendance_7: '7일 연속으로 출석했어요. 꾸준함이 빛나는 당신!',
  badge_attendance_30: '30일 연속 출석! 정말 대단해요.',
  badge_weekly_goal_7days: '일주일 동안 목표를 달성했어요.',
  badge_todo_streak_7: '7일 연속 할 일 완료! 습관이 되고 있어요.',
  badge_question_king: '질문을 10회 이상 남겼어요. 성장하는 학습자!',
  badge_korean_master: '국어 50시간 학습 달성!',
  badge_math_master: '수학 50시간 학습 달성!',
  badge_english_master: '영어 50시간 학습 달성!',
  badge_total_100h: '총 100시간 학습! 멋진 여정이에요.',
  badge_pomodoro_master: '포모도로 25분 집중 20회 달성!',
  badge_morning_routine: '아침 루틴 7회 달성!',
  badge_100h_study: '100시간 학습 달성!',
  badge_questions_10: '질문 10회 이상!',
};

const BADGE_LOCKED_HINTS: Record<string, string> = {
  badge_first_assignment: '첫 번째 과제를 제출하면 획득해요',
  badge_attendance_7: '7일 연속으로 출석하면 획득해요',
  badge_attendance_30: '30일 연속 출석하면 획득해요',
  badge_weekly_goal_7days: '일주일 동안 과제 목표를 달성하면 획득해요',
  badge_todo_streak_7: '7일 연속으로 할 일을 모두 완료하면 획득해요',
  badge_question_king: '질문을 10회 이상 남기면 획득해요',
  badge_korean_master: '국어 50시간 학습 시 획득해요',
  badge_math_master: '수학 50시간 학습 시 획득해요',
  badge_english_master: '영어 50시간 학습 시 획득해요',
  badge_total_100h: '총 100시간 학습 시 획득해요',
  badge_pomodoro_master: '포모도로 25분 집중 20회 달성 시 획득해요',
  badge_morning_routine: '아침(6~9시)에 완료한 활동 7회 달성 시 획득해요',
  badge_100h_study: '100시간 학습 시 획득해요',
  badge_questions_10: '질문 10회 이상 시 획득해요',
};

export function BadgeDetailSheet({ open, badge, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onEsc);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onEsc);
    };
  }, [open, onClose]);

  if (!open || !badge) return null;

  const isAcquired = badge.acquired;
  const title = badge.subtitle ? `${badge.title} · ${badge.subtitle}` : badge.title;
  const description = isAcquired
    ? BADGE_DESCRIPTIONS[badge.id] ?? '이 뱃지를 획득했어요!'
    : BADGE_LOCKED_HINTS[badge.id] ?? '조건을 달성하면 획득할 수 있어요';

  const sheet = (
    <div className="fixed inset-0 z-[9999]">
      <button
        type="button"
        className="absolute inset-0 animate-fade-in bg-black/40 backdrop-blur-sm"
        aria-label="닫기"
        onClick={onClose}
      />
      <div
        className="absolute inset-x-0 bottom-0 flex flex-col rounded-t-2xl bg-white p-6 shadow-xl animate-slideUp"
      >
        <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-slate-200" aria-hidden />

        <div className="flex flex-col items-center text-center">
          <div
            className={[
              'flex items-center justify-center rounded-2xl transition-all duration-300',
              isAcquired
                ? 'h-20 w-20 bg-[hsl(var(--brand-light))] text-[hsl(var(--brand))] animate-badgeScaleIn shadow-[0_0_24px_-4px_hsl(var(--brand)/0.4)]'
                : 'h-[64px] w-[64px] bg-slate-100 text-slate-400 grayscale',
            ].join(' ')}
          >
            {isAcquired ? (
              <span className="[&>svg]:h-10 [&>svg]:w-10">{iconFor(badge)}</span>
            ) : (
              <LockKeyhole className="h-8 w-8" strokeWidth={2} />
            )}
          </div>
          {isAcquired && (
            <p className="mt-3 animate-[fade-in-up_0.4s_ease-out_0.15s_forwards] text-sm font-semibold text-slate-600">
              축하해요!
            </p>
          )}
          <h3 className="mt-2 text-base font-bold text-slate-900">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          확인
        </button>
      </div>
    </div>
  );

  return createPortal(sheet, document.body);
}
