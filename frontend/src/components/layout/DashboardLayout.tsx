import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { AnimatedBackground } from '../motion/AnimatedBackground';
import { PageTransition } from '../motion/PageTransition';

export function DashboardLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AnimatedBackground />
      <Sidebar />
      <main className="flex-1 px-6 lg:px-10 py-6 max-w-7xl mx-auto w-full">
        <Header title={title} />
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}
