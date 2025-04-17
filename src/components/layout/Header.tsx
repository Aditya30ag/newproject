'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUI } from '@/contexts/UIContext';
import { Bars3Icon, BellIcon } from '@heroicons/react/24/outline';
import { getRoleDisplayName } from '@/lib/utils';

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { user } = useAuth();
  const { toggleSidebar, isMobile } = useUI();

  return (
    <header className="sticky top-0 z-10 flex h-16 flex-shrink-0 border-b border-gray-200 bg-white">
      <div className="flex flex-1 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          {isMobile && (
            <button
              type="button"
              className="text-gray-500 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
              onClick={toggleSidebar}
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          )}
          <div className="ml-4 lg:ml-0">
            <h1 className="text-lg font-medium text-gray-900">{title}</h1>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {/* Notification button */}
          <button
            type="button"
            className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <span className="sr-only">View notifications</span>
            <BellIcon className="h-6 w-6" aria-hidden="true" />
          </button>

          {/* User info - visible on desktop */}
          <div className="hidden md:flex md:items-center md:space-x-2">
            <span className="text-sm font-medium text-gray-700">{user?.name}</span>
            <span className="text-xs text-gray-500">{user && getRoleDisplayName(user.role)}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

