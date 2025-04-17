'use client';

import React, { PropsWithChildren } from 'react';
import { useUI } from '@/contexts/UIContext';
import { cn } from '@/lib/utils';
import Header from './Header';
import Sidebar from './Sidebar';

interface MainLayoutProps extends PropsWithChildren {
  title?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, title }) => {
  const { isMobile } = useUI();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div
        className={cn(
          'flex flex-1 flex-col overflow-hidden',
          isMobile ? 'w-full' : 'ml-64'
        )}
      >
        <Header title={title} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;

