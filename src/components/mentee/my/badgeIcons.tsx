import type { ReactNode } from 'react';
import {
  Award,
  BookOpen,
  CalendarDays,
  Clock,
  Coffee,
  Crown,
  Flame,
  Hourglass,
  MessageCircleQuestion,
  Sparkles,
  Star,
  Target,
  Timer,
  TrendingUp,
  Trophy,
} from 'lucide-react';

export type BadgeItem = {
  id: string;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  acquired: boolean;
};

const iconClass = 'h-5 w-5';

export function iconFor(b: BadgeItem, _size?: 'sm' | 'lg'): ReactNode {
  if (b.icon) return b.icon;
  switch (b.id) {
    case 'badge_attendance_7':
      return <Flame className={iconClass} />;
    case 'badge_weekly_goal_7days':
      return <Trophy className={iconClass} />;
    case 'badge_first_assignment':
      return <Star className={iconClass} />;
    case 'badge_total_100h':
      return <Clock className={iconClass} />;
    case 'badge_korean_master':
      return <BookOpen className={iconClass} />;
    case 'badge_math_master':
      return <Target className={iconClass} />;
    case 'badge_english_master':
      return <Sparkles className={iconClass} />;
    case 'badge_attendance_30':
      return <CalendarDays className={iconClass} />;
    case 'badge_todo_streak_7':
      return <TrendingUp className={iconClass} />;
    case 'badge_question_king':
      return <Crown className={iconClass} />;
    case 'badge_pomodoro_master':
      return <Timer className={iconClass} />;
    case 'badge_morning_routine':
      return <Coffee className={iconClass} />;
    case 'badge_100h_study':
      return <Hourglass className={iconClass} />;
    case 'badge_questions_10':
      return <MessageCircleQuestion className={iconClass} />;
    default:
      return <Award className={iconClass} />;
  }
}
