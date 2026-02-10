import { useState } from 'react';
import { createPortal } from 'react-dom';

import { Send, X } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { ChatMessage } from '@/types';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  menteeName: string;
  initialContext?: string; // 오늘의 한마디 질문 내용 (답변 시 참고)
}

export function ChatModal({ isOpen, onClose, menteeName, initialContext }: ChatModalProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      content: trimmed,
      isMentor: true,
      createdAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMsg]);
    setMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />
      <div className="relative z-10 flex h-[480px] w-full max-w-md flex-col rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h3 className="font-semibold text-slate-900">{menteeName}님과 채팅</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {initialContext && (
          <div className="border-b border-slate-100 bg-slate-50 px-4 py-2">
            <p className="text-xs text-slate-500">질문 내용</p>
            <p className="text-sm text-slate-700">{initialContext}</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              메시지를 입력하고 전송하면 멘티에게 전달됩니다.
            </p>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={`flex ${m.isMentor ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    m.isMentor ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  <p className="text-sm">{m.content}</p>
                  <p
                    className={`mt-0.5 text-xs ${m.isMentor ? 'text-slate-300' : 'text-slate-500'}`}
                  >
                    {m.createdAt}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex gap-2 border-t border-slate-200 p-3">
          <Input
            placeholder="메시지를 입력하세요..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button size="sm" icon={Send} onClick={handleSend} disabled={!message.trim()}>
            전송
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
