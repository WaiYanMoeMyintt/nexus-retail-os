'use client';

import dynamic from 'next/dynamic';

// Dynamic import with SSR false for smooth client-side state hydration
const AppLayout = dynamic(
  () => import('@/components/layout/AppLayout').then((mod) => mod.AppLayout),
  { ssr: false }
);

export default function Home() {
  return <AppLayout />;
}
