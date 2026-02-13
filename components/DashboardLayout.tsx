"use client";

import { useState } from "react";
import Sidebar from "./dashboard/Sidebar";
import Topbar from "./dashboard/Topbar";
import HelpButton from "./HelpButton"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [topbarTitle, setTopbarTitle] = useState("Dashboard");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - Fixed Position */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} setTopbarTitle={setTopbarTitle}/>

      {/* Main Content Area */}
      {/* lg:pl-64 pushes content to the right on large screens to accommodate the fixed sidebar */}
      <div className="lg:pl-64 flex flex-col min-h-screen transition-all duration-300">
        
        {/* Topbar - Fixed at top of main content */}
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} topbarTitle={topbarTitle} setTopbarTitle={setTopbarTitle}/>

        {/* Page Content */}
        {/* pt-20 accounts for the fixed Topbar height (h-16 = 64px) + some padding */}
        <main className="flex-1 p-6 sm:p-8 pt-24 animate-in fade-in duration-500">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      <HelpButton />
    </div>
  );
}