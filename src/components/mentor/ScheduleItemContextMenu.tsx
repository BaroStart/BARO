import { Copy, Move, Trash2, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { ScheduleItem } from '@/components/mentor/ScheduleCalendar';

interface ScheduleItemContextMenuProps {
  item: ScheduleItem;
  position: { x: number; y: number };
  onClose: () => void;
  onMove: (itemId: string, newDate: string) => void;
  onCopy: (itemId: string, newDate: string) => void;
  onDelete: (itemId: string) => void;
}

export function ScheduleItemContextMenu({
  item,
  position,
  onClose,
  onMove,
  onCopy,
  onDelete,
}: ScheduleItemContextMenuProps) {
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [copyModalOpen, setCopyModalOpen] = useState(false);

  const handleMove = (date: string) => {
    onMove(item.id, date);
    setMoveModalOpen(false);
    onClose();
  };

  const handleCopy = (date: string) => {
    onCopy(item.id, date);
    setCopyModalOpen(false);
    onClose();
  };

  const [moveDate, setMoveDate] = useState(item.date);
  const [copyDate, setCopyDate] = useState(item.date);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        if (!moveModalOpen && !copyModalOpen) {
          onClose();
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [moveModalOpen, copyModalOpen, onClose]);

  const handleDelete = () => {
    if (window.confirm(`"${item.title}" 할일을 삭제하시겠습니까?`)) {
      onDelete(item.id);
      onClose();
    }
  };

  const handleMoveSubmit = () => {
    if (moveDate !== item.date) {
      handleMove(moveDate);
    } else {
      setMoveModalOpen(false);
    }
  };

  const handleCopySubmit = () => {
    handleCopy(copyDate);
  };

  return (
    <>
      {!moveModalOpen && !copyModalOpen && (
        <div
          ref={menuRef}
          className="fixed z-50 rounded-lg border border-slate-200 bg-white shadow-lg"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="py-1">
            <button
              type="button"
              onClick={() => setMoveModalOpen(true)}
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
            >
              <Move className="h-4 w-4" />
              이동
            </button>
            <button
              type="button"
              onClick={() => setCopyModalOpen(true)}
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
            >
              <Copy className="h-4 w-4" />
              복사
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              삭제
            </button>
          </div>
        </div>
      )}

      {/* 이동 모달 */}
      {moveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            ref={menuRef}
            className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">할일 이동</h3>
              <button
                type="button"
                onClick={() => setMoveModalOpen(false)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-4 text-sm text-slate-600">
              <span className="font-medium">{item.title}</span>을(를) 이동할 날짜를 선택하세요.
            </p>
            <div className="space-y-4">
              <Input
                id="move-date"
                label="날짜"
                type="date"
                value={moveDate}
                onChange={(e) => setMoveDate(e.target.value)}
              />
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setMoveModalOpen(false)}>
                  취소
                </Button>
                <Button type="button" className="flex-1" onClick={handleMoveSubmit}>
                  이동
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 복사 모달 */}
      {copyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            ref={menuRef}
            className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">할일 복사</h3>
              <button
                type="button"
                onClick={() => setCopyModalOpen(false)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-4 text-sm text-slate-600">
              <span className="font-medium">{item.title}</span>을(를) 복사할 날짜를 선택하세요.
            </p>
            <div className="space-y-4">
              <Input
                id="copy-date"
                label="날짜"
                type="date"
                value={copyDate}
                onChange={(e) => setCopyDate(e.target.value)}
              />
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setCopyModalOpen(false)}>
                  취소
                </Button>
                <Button type="button" className="flex-1" onClick={handleCopySubmit}>
                  복사
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
