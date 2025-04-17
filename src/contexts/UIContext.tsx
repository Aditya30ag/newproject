'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface UIContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  isMobile: boolean;
}

const UIContext = createContext<UIContextType>({
  sidebarOpen: false,
  toggleSidebar: () => {},
  closeSidebar: () => {},
  isMobile: false,
});

export const useUI = () => useContext(UIContext);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Detect mobile screens
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    // Set initial value
    checkIsMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkIsMobile);

    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Close sidebar on mobile when navigating
  useEffect(() => {
    if (isMobile) {
      closeSidebar();
    }
  }, [isMobile]);

  return (
    <UIContext.Provider
      value={{
        sidebarOpen,
        toggleSidebar,
        closeSidebar,
        isMobile,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

