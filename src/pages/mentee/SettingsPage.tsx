import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Palette, Settings, User } from 'lucide-react';

import { logout as logoutApi } from '@/api/auth';
import { Button } from '@/components/ui/Button';
import { ConsultButton } from '@/components/mentee/my/ConsultButton';
import { TimeTableColorModal } from '@/components/mentee/main/TimeTableColorModal';
import {
  clearLocalProfileImage,
  getLocalProfileImage,
  setLocalProfileImage,
} from '@/lib/profileImageStorage';
import { getPaletteDisplayInfo } from '@/lib/timetableColorStorage';
import { useAuthStore } from '@/stores/useAuthStore';

export function SettingsPage() {
  const navigate = useNavigate();
  const { logout, user: authUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const [localImage, setLocalImage] = useState<string | null>(() => getLocalProfileImage());

  const currentTheme = getPaletteDisplayInfo();
  const profileImage = localImage ?? authUser?.profileImage ?? null;

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {
      // ignore
    } finally {
      logout();
      navigate('/login');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file?.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setLocalProfileImage(dataUrl);
      setLocalImage(dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleResetProfile = () => {
    clearLocalProfileImage();
    setLocalImage(null);
  };

  return (
    <div className="min-h-screen bg-white px-4 pt-4 pb-8">
      <header className="mb-6 flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate('/mentee/mypage')}
          className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100"
          aria-label="뒤로"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="flex flex-1 items-center gap-2 text-lg font-bold text-slate-900">
          <Settings className="h-5 w-5" strokeWidth={2} />
          설정
        </h1>
      </header>

      <section className="space-y-6">
        {/* 테마 & 컬러 */}
        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            테마 & 컬러
          </h2>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setThemeModalOpen(true)}
              className="flex w-full items-center gap-4 rounded-xl border border-slate-100 bg-white p-4 text-left shadow-sm transition duration-200 hover:border-slate-200 hover:shadow-md"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50">
                <Palette className="h-5 w-5 text-slate-500" strokeWidth={1.5} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900">컬러 테마</p>
                <p className="text-xs text-slate-500">
                  달성률 · 캘린더 · 뱃지 색상 적용
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <div
                  className="h-5 w-5 rounded-full border border-slate-200"
                  style={{ background: `hsl(${currentTheme.brand})` }}
                />
                <div
                  className="h-5 w-5 rounded-full border border-slate-200"
                  style={{ background: `hsl(${currentTheme.brandLight})` }}
                />
              </div>
              <span className="text-sm font-semibold text-slate-500">{currentTheme.name}</span>
            </button>
          </div>
        </div>

        {/* 프로필 */}
        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            프로필
          </h2>
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative flex h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-dashed border-slate-200 bg-slate-50 transition hover:border-slate-300"
              >
                {profileImage ? (
                  <img src={profileImage} alt="프로필" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-400">
                    <User className="h-8 w-8" strokeWidth={1.5} />
                  </div>
                )}
              </button>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900">프로필 사진</p>
                <p className="mt-0.5 text-xs text-slate-500">새로고침 시 초기화됩니다</p>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-semibold text-[hsl(var(--brand))] hover:underline"
                  >
                    사진 변경
                  </button>
                  {localImage && (
                    <button
                      type="button"
                      onClick={handleResetProfile}
                      className="text-xs font-semibold text-slate-500 hover:underline"
                    >
                      기본으로
                    </button>
                  )}
                </div>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>

        <TimeTableColorModal
          open={themeModalOpen}
          onClose={() => setThemeModalOpen(false)}
          onSelect={() => {}}
          mode="theme"
        />
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          기타
        </h2>
        <Button variant="outline" className="w-full" onClick={handleLogout}>
          로그아웃
        </Button>
        <ConsultButton formUrl="https://forms.gle/FchKdDcm23JdGHpK9" />
      </section>
    </div>
  );
}
