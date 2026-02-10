import {
  Bold,
  Code,
  Image,
  Italic,
  Link,
  List,
  ListOrdered,
  Strikethrough,
  Underline,
} from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';

import { cn } from '@/lib/utils';

interface ColumnEditorProps {
  /** 초기값 (key 변경 시 리셋용) */
  defaultValue?: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

const TOOLBAR_BUTTONS: Array<{
  cmd: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value?: string;
  /** 이미지처럼 별도 처리 필요 시 */
  custom?: boolean;
}> = [
  { cmd: 'bold', icon: Bold, title: '굵게' },
  { cmd: 'italic', icon: Italic, title: '기울임' },
  { cmd: 'underline', icon: Underline, title: '밑줄' },
  { cmd: 'strikeThrough', icon: Strikethrough, title: '취소선' },
  { cmd: 'insertUnorderedList', icon: List, title: '글머리 기호' },
  { cmd: 'insertOrderedList', icon: ListOrdered, title: '번호 매기기' },
  { cmd: 'createLink', icon: Link, title: '링크' },
  { cmd: 'insertImage', icon: Image, title: '이미지', custom: true },
  { cmd: 'formatBlock', icon: Code, title: '코드 블록', value: 'pre' },
];

export function ColumnEditor({
  defaultValue = '',
  onChange,
  placeholder = '내용을 입력하세요...',
  className,
  minHeight = '200px',
}: ColumnEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = defaultValue;
    }
  }, []);

  const handleInput = useCallback(() => {
    const html = editorRef.current?.innerHTML ?? '';
    onChange(html);
  }, [onChange]);

  const insertImageFromFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        editorRef.current?.focus();
        document.execCommand('insertImage', false, dataUrl);
        handleInput();
      };
      reader.readAsDataURL(file);
    },
    [handleInput]
  );

  const handleImageClick = useCallback(() => {
    imageInputRef.current?.click();
  }, []);

  const handleImageFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith('image/')) {
        insertImageFromFile(file);
      }
      e.target.value = '';
    },
    [insertImageFromFile]
  );

  const handleToolbarClick = useCallback(
    (cmd: string, value?: string, custom?: boolean) => {
      if (custom && cmd === 'insertImage') {
        handleImageClick();
        return;
      }
      editorRef.current?.focus();
      let finalValue = value;
      if (cmd === 'createLink') {
        const url = prompt('링크 URL을 입력하세요:', 'https://');
        if (!url?.trim()) return;
        finalValue = url.trim();
      }
      document.execCommand(cmd, false, finalValue ?? undefined);
      handleInput();
    },
    [handleInput, handleImageClick]
  );

  /** 툴바 클릭 시 에디터 포커스 유지 (mousedown에서 preventDefault) */
  const handleToolbarMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div className={cn('rounded-lg border border-slate-200 bg-white', className)}>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageFileChange}
      />
      {/* 툴바 */}
      <div className="flex flex-wrap gap-0.5 border-b border-slate-200 p-1.5">
        {TOOLBAR_BUTTONS.map(({ cmd, icon: Icon, title, value: cmdValue, custom }) => (
          <button
            key={cmd}
            type="button"
            onMouseDown={handleToolbarMouseDown}
            onClick={() => handleToolbarClick(cmd, cmdValue, custom)}
            className="flex h-8 w-8 items-center justify-center rounded text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
            title={title}
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </div>
      {/* 에디터 영역 */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        data-placeholder={placeholder}
        className="min-w-0 overflow-auto px-3 py-3 text-sm text-slate-900 outline-none [&:empty::before]:content-[attr(data-placeholder)] [&:empty::before]:text-slate-400"
        style={{ minHeight }}
      />
    </div>
  );
}
