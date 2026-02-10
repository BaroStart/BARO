import { useCallback, useEffect, useRef, useState } from 'react';

import { ImageIcon, Maximize2, Minus, Move, Plus, RotateCcw, RotateCw } from 'lucide-react';

import { cn } from '@/lib/utils';

const MIN_SCALE = 0.25;
const MAX_SCALE = 5;
const ZOOM_STEP = 0.25;
const WHEEL_SENSITIVITY = 0.002;

interface AuthPhotoViewerProps {
  photos: { id: string; url: string; caption?: string }[];
  className?: string;
  /** 다크 배경 (이미지 검토에 집중) */
  darkMode?: boolean;
}

function getFileName(caption?: string, index?: number): string {
  if (caption) return caption;
  return `과제_인증${index != null ? index + 1 : ''}.jpg`;
}

export function AuthPhotoViewer({ photos, className, darkMode = false }: AuthPhotoViewerProps) {
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const currentPhoto = photos[currentIndex];
  const fileName = getFileName(currentPhoto?.caption, currentIndex);

  const resetView = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setRotate(0);
  }, []);

  const zoomTo = useCallback((newScale: number) => {
    setScale(Math.min(MAX_SCALE, Math.max(MIN_SCALE, newScale)));
  }, []);

  // 휠 이벤트 핸들러를 useEffect로 등록 (passive: false 필요)
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = -e.deltaY * WHEEL_SENSITIVITY;
      setScale((s) => {
        const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, s + delta * s));
        return next;
      });
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    },
    [position],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    },
    [isDragging, dragStart],
  );

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  const handleDoubleClick = useCallback(() => {
    if (scale >= 2) {
      resetView();
    } else {
      zoomTo(2);
    }
  }, [scale, zoomTo, resetView]);

  /** 이미지 로드 시 뷰포트에 맞게 최대 크기로 표시 */
  const fitImageToContainer = useCallback(() => {
    const viewport = viewportRef.current;
    const img = imgRef.current;
    if (!viewport || !img || !img.naturalWidth || !img.naturalHeight) return;
    const cw = viewport.clientWidth;
    const ch = viewport.clientHeight;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    if (cw <= 0 || ch <= 0) return;
    const fitScale = Math.min(cw / iw, ch / ih, MAX_SCALE);
    const clamped = Math.max(MIN_SCALE, Math.min(MAX_SCALE, fitScale));
    setScale(clamped);
    setPosition({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    const up = () => setIsDragging(false);
    window.addEventListener('mouseup', up);
    return () => window.removeEventListener('mouseup', up);
  }, []);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      if (imageLoaded && !imageError) fitImageToContainer();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [imageLoaded, imageError, fitImageToContainer]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current?.closest(':focus-within') && !document.fullscreenElement) return;
      switch (e.key) {
        case 'Escape':
          document.exitFullscreen?.();
          break;
        case '+':
        case '=':
          setScale((s) => Math.min(MAX_SCALE, s + ZOOM_STEP));
          e.preventDefault();
          break;
        case '-':
          setScale((s) => Math.max(MIN_SCALE, s - ZOOM_STEP));
          e.preventDefault();
          break;
        case 'r':
        case 'R':
          setRotate((r) => r + 90);
          e.preventDefault();
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const zoomIn = () => zoomTo(scale + ZOOM_STEP);
  const zoomOut = () => zoomTo(scale - ZOOM_STEP);
  const rotateLeft = () => setRotate((r) => r - 90);
  const rotateRight = () => setRotate((r) => r + 90);
  const fitToScreen = () => {
    setPosition({ x: 0, y: 0 });
    setRotate(0);
    fitImageToContainer();
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else {
      containerRef.current.requestFullscreen?.();
    }
  };

  const goToPhoto = (index: number) => {
    setCurrentIndex(index);
    resetView();
    setImageLoaded(false);
    setImageError(false);
  };

  if (photos.length === 0) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-lg border',
          darkMode ? 'border-slate-600 bg-slate-800/50' : 'border-slate-200 bg-slate-100/50',
          className,
        )}
      >
        <div
          className={cn(
            'flex h-64 w-full flex-col items-center justify-center gap-3',
            darkMode ? 'text-slate-400' : 'text-slate-500',
          )}
        >
          <div
            className={cn(
              'flex h-16 w-16 items-center justify-center rounded-full',
              darkMode ? 'bg-slate-700' : 'bg-slate-200',
            )}
          >
            <ImageIcon className="h-8 w-8" />
          </div>
          <p className="text-sm font-medium">과제 인증 사진</p>
          <p className="text-xs">제출된 사진이 없습니다</p>
          <p className="text-xs opacity-70">마우스 휠로 확대/축소 · 드래그로 이동 가능</p>
        </div>
      </div>
    );
  }

  const bgClass = darkMode ? 'bg-slate-900' : 'bg-slate-100';
  const borderClass = darkMode ? 'border-slate-700' : 'border-slate-200';
  const textClass = darkMode ? 'text-slate-300' : 'text-slate-600';
  const hoverClass = darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-200';
  const btnClass = cn('rounded p-2 transition-colors', textClass, hoverClass);

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex flex-col overflow-hidden rounded-lg border',
        borderClass,
        darkMode && 'bg-slate-800',
        className,
      )}
    >
      {/* 상단: 파일 탭 + 컨트롤 */}
      <div
        className={cn(
          'flex shrink-0 flex-col gap-2 border-b px-3 py-2 sm:flex-row sm:items-center sm:justify-between',
          borderClass,
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {photos.length > 1 ? (
            <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
              {photos.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => goToPhoto(i)}
                  className={cn(
                    'flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors',
                    i === currentIndex
                      ? darkMode
                        ? 'border-slate-500 bg-slate-700 text-white'
                        : 'border-slate-300 bg-slate-100 text-slate-900'
                      : darkMode
                        ? 'border-slate-600 bg-transparent text-slate-400 hover:bg-slate-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                  )}
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  {getFileName(p.caption, i)}
                </button>
              ))}
            </div>
          ) : (
            <span className={cn('truncate text-sm', textClass)}>{fileName}</span>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-0.5 sm:flex-nowrap">
          <button type="button" onClick={zoomOut} className={btnClass} title="축소 (-)">
            <Minus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => zoomTo(1)}
            className={cn('min-w-[3.5rem] px-2 py-1.5 text-center text-xs', textClass)}
            title="줌 레벨"
          >
            {Math.round(scale * 100)}%
          </button>
          <button type="button" onClick={zoomIn} className={btnClass} title="확대 (+)">
            <Plus className="h-4 w-4" />
          </button>
          <div className="mx-1 w-px self-stretch bg-slate-300" />
          <button type="button" onClick={rotateLeft} className={btnClass} title="왼쪽 90° 회전">
            <RotateCcw className="h-4 w-4" />
          </button>
          <button type="button" onClick={rotateRight} className={btnClass} title="오른쪽 90° 회전">
            <RotateCw className="h-4 w-4" />
          </button>
          <div className="mx-1 w-px self-stretch bg-slate-300" />
          <button
            type="button"
            onClick={fitToScreen}
            className={btnClass}
            title="화면에 맞춤 (최대 크기로 표시)"
          >
            <Move className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            className={btnClass}
            title="전체화면 (최대 크기로 보기, Esc로 종료)"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 이미지 영역 */}
      <div
        ref={viewportRef}
        className={cn(
          'relative flex min-h-[360px] flex-1 items-center justify-center overflow-hidden',
          bgClass,
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        {!imageLoaded && !imageError && (
          <div
            className={cn(
              'absolute inset-0 flex flex-col items-center justify-center gap-2',
              textClass,
            )}
          >
            <div className="h-8 w-8 animate-pulse rounded-full bg-slate-400/30" />
            <span className="text-sm">이미지 로딩 중...</span>
          </div>
        )}
        {imageError && (
          <div className={cn('flex flex-col items-center justify-center gap-2', textClass)}>
            <ImageIcon className="h-12 w-12 opacity-50" />
            <span className="text-sm">이미지를 불러올 수 없습니다</span>
          </div>
        )}
        <img
          ref={imgRef}
          src={currentPhoto.url}
          alt={currentPhoto.caption ?? '과제 인증 사진'}
          className={cn(
            'select-none transition-opacity duration-200',
            imageLoaded ? 'opacity-100' : 'opacity-0',
          )}
          style={
            {
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotate}deg)`,
              transformOrigin: 'center center',
              maxWidth: '100%',
              maxHeight: '100%',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
              imageRendering: '-webkit-optimize-contrast',
            } as React.CSSProperties
          }
          draggable={false}
          onLoad={() => {
            setImageLoaded(true);
            requestAnimationFrame(() => fitImageToContainer());
          }}
          onError={() => setImageError(true)}
          fetchPriority="high"
        />
        {photos.length > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/40 px-2 py-1.5">
            {photos.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goToPhoto(i)}
                className={cn(
                  'h-2 w-2 rounded-full transition-all',
                  i === currentIndex ? 'w-4 bg-white' : 'bg-white/50 hover:bg-white/80',
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* 하단 힌트 */}
      <div
        className={cn(
          'flex shrink-0 flex-col gap-1 border-t px-3 py-2 text-xs sm:flex-row sm:items-center sm:justify-between',
          borderClass,
          textClass,
        )}
      >
        <span className="truncate">
          마우스 휠 확대/축소 · 드래그 이동 · 더블클릭 2배 줌 · <strong>전체화면 버튼(↗)</strong>
          으로 최대 크기
        </span>
        <span className="shrink-0 opacity-70">+ / - / R / Esc</span>
      </div>
    </div>
  );
}
