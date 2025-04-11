"use client";

import React, { ReactNode } from "react";
import { Providers } from "./providers";
import RegionSwitchModal from "@/components/region/RegionSwitchModal";
import Header from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/ui/PageTransition";

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow no-shift">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer />
        <RegionSwitchModal />
      </div>
    </Providers>
  );
}
