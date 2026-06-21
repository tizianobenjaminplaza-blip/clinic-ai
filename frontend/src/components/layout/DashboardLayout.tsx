import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function DashboardLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 px-8 py-6 max-w-6xl">
        <Header title={title} />
        {children}
      </main>
    </div>
  );
}
