'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useUI } from '@/contexts/UIContext';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import {
  AcademicCapIcon,
  ArrowRightOnRectangleIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  Cog6ToothIcon,
  HomeIcon,
  UsersIcon,
  UserIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
  children?: NavItem[];
}

const navigation: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
    roles: [UserRole.SUPER_ADMIN, UserRole.UNIVERSITY_ADMIN, UserRole.SUB_USER, UserRole.STUDENT],
  },
  {
    name: 'Universities',
    href: '/admin/universities',
    icon: AcademicCapIcon,
    roles: [UserRole.SUPER_ADMIN],
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: UsersIcon,
    roles: [UserRole.SUPER_ADMIN],
  },
  {
    name: 'Jobs',
    href: '/university/jobs',
    icon: BriefcaseIcon,
    roles: [UserRole.UNIVERSITY_ADMIN, UserRole.SUB_USER],
  },
  {
    name: 'Students',
    href: '/university/students',
    icon: UserIcon,
    roles: [UserRole.UNIVERSITY_ADMIN],
  },
  {
    name: 'Companies',
    href: '/university/companies',
    icon: BuildingOfficeIcon,
    roles: [UserRole.UNIVERSITY_ADMIN],
  },
  {
    name: 'Sub-Users',
    href: '/university/sub-users',
    icon: UsersIcon,
    roles: [UserRole.UNIVERSITY_ADMIN],
  },
  {
    name: 'Assigned Jobs',
    href: '/sub-user/jobs',
    icon: ClipboardDocumentCheckIcon,
    roles: [UserRole.SUB_USER],
  },
  {
    name: 'Available Jobs',
    href: '/student/jobs',
    icon: BriefcaseIcon,
    roles: [UserRole.STUDENT],
  },
  {
    name: 'My Applications',
    href: '/student/applications',
    icon: ClipboardDocumentCheckIcon,
    roles: [UserRole.STUDENT],
  },
  {
    name: 'My Profile',
    href: '/student/profile',
    icon: UserIcon,
    roles: [UserRole.STUDENT],
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: ChartBarIcon,
    roles: [UserRole.SUPER_ADMIN, UserRole.UNIVERSITY_ADMIN],
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Cog6ToothIcon,
    roles: [UserRole.SUPER_ADMIN, UserRole.UNIVERSITY_ADMIN, UserRole.SUB_USER, UserRole.STUDENT],
  },
];

const Sidebar: React.FC = () => {
  const { sidebarOpen, closeSidebar, isMobile } = useUI();
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const filteredNavigation = navigation.filter((item) => 
    item.roles.includes(user.role)
  );

  return (
    <>
      {/* Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75"
          onClick={closeSidebar}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-300 ease-in-out',
          isMobile && !sidebarOpen && '-translate-x-full',
          isMobile && sidebarOpen && 'translate-x-0',
          !isMobile && 'translate-x-0',
        )}
      >
        <div className="flex h-16 flex-shrink-0 items-center border-b border-gray-200 px-4">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/images/logo.svg"
              alt="University Placement Tracker"
              width={40}
              height={40}
            />
            <span className="text-lg font-semibold text-gray-900">UniPlacement</span>
          </Link>
        </div>
        
        <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
          <nav className="mt-5 flex-1 space-y-1 px-2">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center rounded-md px-2 py-2 text-sm font-medium',
                    isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                  onClick={isMobile ? closeSidebar : undefined}
                >
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0',
                      isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        
        {/* User section */}
        <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
          <div className="flex items-center">
            <div>
              {user.avatar ? (
                <Image
                  className="inline-block h-9 w-9 rounded-full"
                  src={user.avatar}
                  alt=""
                  width={36}
                  height={36}
                />
              ) : (
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gray-200">
                  <span className="text-sm font-medium text-gray-500">
                    {user.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                {user.name}
              </p>
              <button
                onClick={logout}
                className="flex items-center text-xs font-medium text-gray-500 hover:text-gray-700"
              >
                <ArrowRightOnRectangleIcon className="mr-1 h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;


