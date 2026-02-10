import { NotificationFeedbackIcon, ReminderIcon, SystemIcon } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { NotificationItem, NotificationType } from '@/stores/useNotificationStore';

const TYPE_CONFIG: Record<NotificationType, { icon: React.ReactNode; dot: string }> = {
  feedback: {
    icon: <NotificationFeedbackIcon className="h-4 w-4 text-sky-500" />,
    dot: 'bg-sky-500',
  },
  reminder: {
    icon: <ReminderIcon className="h-4 w-4 text-rose-400" />,
    dot: 'bg-rose-400',
  },
  system: {
    icon: <SystemIcon className="h-4 w-4 text-slate-400" />,
    dot: 'bg-slate-400',
  },
};

interface NotificationRowProps {
  item: NotificationItem;
  onPress: () => void;
}

export function NotificationRow({ item, onPress }: NotificationRowProps) {
  const config = TYPE_CONFIG[item.type];

  return (
    <button
      type="button"
      onClick={onPress}
      className={cn(
        'flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors',
        item.isRead ? 'hover:bg-slate-50/70' : 'bg-sky-50/40',
      )}
    >
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.04)]">
        {config.icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              'text-[13px] leading-5',
              item.isRead ? 'font-medium text-slate-500' : 'font-semibold text-slate-800',
            )}
          >
            {item.title}
          </p>
          <div className="flex shrink-0 items-center gap-1.5 pt-0.5">
            {!item.isRead && <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />}
            <span className="text-[11px] text-slate-300">{item.time}</span>
          </div>
        </div>

        <p
          className={cn(
            'mt-0.5 line-clamp-2 text-[12px] leading-relaxed',
            item.isRead ? 'text-slate-350' : 'text-slate-400',
          )}
        >
          {item.message}
        </p>
      </div>
    </button>
  );
}
