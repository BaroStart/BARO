import { Calendar, Plus } from 'lucide-react';

import { ScheduleCalendar, type ScheduleItem } from '@/components/mentor/ScheduleCalendar';
import { ScheduleItemContextMenu } from '@/components/mentor/ScheduleItemContextMenu';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import type { ScheduleState } from '@/types';

export function CalendarSection({
  year,
  month,
  selectedDate,
  scheduleItems,
  scheduleState,
  onDateSelect,
  onMonthChange,
  onItemClick,
  onItemRightClick,
  onItemDelete,
  onScheduleStateChange,
  onScheduleMove,
  onScheduleCopy,
  onAddClick,
}: {
  year: number;
  month: number;
  selectedDate: string;
  scheduleItems: ScheduleItem[];
  scheduleState: ScheduleState;
  onDateSelect: (date: string) => void;
  onMonthChange: (y: number, m: number) => void;
  onItemClick: (item: ScheduleItem) => void;
  onItemRightClick: (e: React.MouseEvent, item: ScheduleItem) => void;
  onItemDelete: (id: string) => void;
  onScheduleStateChange: (state: ScheduleState) => void;
  onScheduleMove: (id: string, date: string, skip?: boolean) => void;
  onScheduleCopy: (id: string, date: string, skip?: boolean) => void;
  onAddClick: () => void;
}) {
  const { searchQuery, contextMenu, draggedItem } = scheduleState;

  return (
    <div className="rounded-xl border border-border/50 bg-white">
      <div className="flex flex-col gap-3 border-b border-border/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Calendar className="h-4 w-4" />
          일정 캘린더
        </h3>
        <div className="flex items-center gap-2">
          <SearchInput
            value={searchQuery}
            onChange={(v) => onScheduleStateChange({ ...scheduleState, searchQuery: v })}
            placeholder="할일 검색..."
            className="flex-1 sm:max-w-xs"
          />
          <Button variant="outline" icon={Plus} onClick={onAddClick}>
            일정 추가
          </Button>
        </div>
      </div>

      <div className="p-4">
        <ScheduleCalendar
          year={year}
          month={month}
          selectedDate={selectedDate}
          scheduleItems={scheduleItems}
          searchQuery={searchQuery}
          onDateSelect={onDateSelect}
          onMonthChange={onMonthChange}
          onItemClick={onItemClick}
          onItemRightClick={onItemRightClick}
          onItemDelete={onItemDelete}
          onItemDragStart={(item) => onScheduleStateChange({ ...scheduleState, draggedItem: item })}
          onItemDragEnd={() => onScheduleStateChange({ ...scheduleState, draggedItem: null })}
          onDropOnDate={
            draggedItem && (draggedItem.type === 'personal' || draggedItem.type === 'learning')
              ? (dateStr, isCopy) => {
                  if (isCopy) onScheduleCopy(draggedItem.id, dateStr, true);
                  else onScheduleMove(draggedItem.id, dateStr, true);
                  onScheduleStateChange({ ...scheduleState, draggedItem: null });
                }
              : undefined
          }
          draggedItemId={draggedItem?.id}
        />

        {draggedItem && (
          <p className="mt-2 text-xs text-muted-foreground">
            다른 날짜에 놓으면 이동 · <kbd className="rounded border border-border px-1">Ctrl</kbd>
            +드롭하면 복사
          </p>
        )}

        {contextMenu && (
          <ScheduleItemContextMenu
            item={contextMenu.item}
            position={contextMenu.position}
            onClose={() => onScheduleStateChange({ ...scheduleState, contextMenu: null })}
            onMove={onScheduleMove}
            onCopy={onScheduleCopy}
            onDelete={onItemDelete}
          />
        )}

        {searchQuery && (
          <div className="mt-3 text-sm text-muted-foreground">
            검색 결과:{' '}
            {
              scheduleItems.filter(
                (item) =>
                  item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  item.subject.toLowerCase().includes(searchQuery.toLowerCase()),
              ).length
            }
            개
          </div>
        )}
      </div>
    </div>
  );
}
