'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getDashboardUrl } from '@/lib/utils';

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        // Redirect to appropriate dashboard
        router.push(getDashboardUrl(user.role));
      } else {
        // Redirect to login page
        router.push('/login');
      }
    }
  }, [isAuthenticated, isLoading, router, user]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-pulse text-center text-gray-500">
        Loading...
      </div>
    </div>
  );
}


