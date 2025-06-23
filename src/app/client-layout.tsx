'use client';

import React, { ReactNode } from 'react';
import { Providers } from './providers';
import RegionSwitchModal from '@/components/region/RegionSwitchModal';
import Header from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PageTransition } from '@/components/ui/PageTransition';
import BottomNavigation from '@/components/layout/BottomNavigation';
import MobileProductBar from '@/components/layout/MobileProductBar';
import PageContainer from '@/components/layout/PageContainer';

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow no-shift pt-2 pb-20 md:pb-0">
          <div className="container-layout py-4">
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
        <Footer />
        <BottomNavigation />
        <MobileProductBar />
        <RegionSwitchModal />
      </div>
    </Providers>
  );
}
