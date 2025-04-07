"use client";

import React, { ReactNode } from "react";
import { Providers } from "./providers";
import RegionSwitchModal from "@/components/RegionSwitchModal";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow no-shift">{children}</main>
        <Footer />
        <RegionSwitchModal />
      </div>
    </Providers>
  );
}
