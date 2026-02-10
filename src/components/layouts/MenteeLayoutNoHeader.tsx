import { Outlet } from 'react-router-dom';
import { TabBar } from '@/components/mentee/TabBar';

export function MenteeLayoutNoHeader() {
  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-white shadow-sm sm:max-w-lg md:shadow-lg">
      <main className="pb-20">
        <Outlet />
      </main>

      <TabBar />
    </div>
  );
}
