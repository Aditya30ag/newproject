'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import StatCard from '@/components/dashboard/StatCard';
import Chart from '@/components/dashboard/Chart';
import {
  AcademicCapIcon,
  BuildingOfficeIcon,
  UserIcon,
  BriefcaseIcon,
} from '@heroicons/react/24/outline';
import { universities, companies, users, students, jobs } from '@/data/dummy-data';
import { formatNumber, calculatePercentage } from '@/lib/utils';

const SuperAdminDashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== UserRole.SUPER_ADMIN) {
      router.push('/login');
    }
  }, [isAuthenticated, router, user]);

  if (!user || user.role !== UserRole.SUPER_ADMIN) {
    return null;
  }

  // Calculate stats for dashboard
  const totalUniversities = universities.length;
  const activeUniversities = universities.filter(u => u.isActive).length;
  const totalUsers = users.length;
  const totalCompanies = companies.length;
  const totalStudents = students.length;
  const totalJobs = jobs.length;
  const placedStudents = students.filter(s => s.placementStatus === 'PLACED').length;
  const placementPercentage = calculatePercentage(placedStudents, totalStudents);

  // Prepare data for charts
  const universityPlacementData = universities.map(university => {
    const uniStudents = students.filter(s => s.universityId === university.id);
    const uniPlaced = uniStudents.filter(s => s.placementStatus === 'PLACED').length;
    const percentage = calculatePercentage(uniPlaced, uniStudents.length);
    
    return {
      name: university.name,
      students: uniStudents.length,
      placed: uniPlaced,
      percentage,
    };
  });

  const monthlyJobsData = [
    { month: 'Jan', count: 8 },
    { month: 'Feb', count: 12 },
    { month: 'Mar', count: 15 },
    { month: 'Apr', count: 10 },
    { month: 'May', count: 14 },
    { month: 'Jun', count: 18 },
    { month: 'Jul', count: 22 },
    { month: 'Aug', count: 25 },
    { month: 'Sep', count: 30 },
    { month: 'Oct', count: 38 },
    { month: 'Nov', count: 42 },
    { month: 'Dec', count: 35 },
  ];

  const industryDistributionData = [
    { name: 'Information Technology', value: 35 },
    { name: 'Finance', value: 20 },
    { name: 'Manufacturing', value: 15 },
    { name: 'Healthcare', value: 12 },
    { name: 'Education', value: 10 },
    { name: 'Others', value: 8 },
  ];

  return (
    <MainLayout title="Super Admin Dashboard">
      <div className="space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Universities"
            value={totalUniversities}
            icon={<AcademicCapIcon className="h-6 w-6" />}
          />
          <StatCard
            title="Total Users"
            value={totalUsers}
            icon={<UserIcon className="h-6 w-6" />}
          />
          <StatCard
            title="Total Companies"
            value={totalCompanies}
            icon={<BuildingOfficeIcon className="h-6 w-6" />}
          />
          <StatCard
            title="Total Jobs"
            value={totalJobs}
            icon={<BriefcaseIcon className="h-6 w-6" />}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* University Placement Rates */}
          <Chart
            title="University Placement Rates"
            type="bar"
            series={[
              {
                name: 'Placement Rate (%)',
                data: universityPlacementData.map(data => data.percentage),
              },
            ]}
            xaxis={{
              categories: universityPlacementData.map(data => data.name),
            }}
            height={350}
          />

          {/* Monthly Job Postings */}
          <Chart
            title="Monthly Job Postings"
            type="line"
            series={[
              {
                name: 'Jobs Posted',
                data: monthlyJobsData.map(data => data.count),
              },
            ]}
            xaxis={{
              categories: monthlyJobsData.map(data => data.month),
            }}
            height={350}
          />
        </div>

        {/* More Charts Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Industry Distribution */}
          <Chart
            title="Industry Distribution"
            type="pie"
            series={industryDistributionData.map(data => data.value)}
            options={{
              labels: industryDistributionData.map(data => data.name),
              legend: {
                position: 'bottom',
              },
            }}
            height={350}
          />

          {/* Overall Placement Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Placement Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Total Students</p>
                    <p className="text-2xl font-semibold">{formatNumber(totalStudents)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Placed Students</p>
                    <p className="text-2xl font-semibold">{formatNumber(placedStudents)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Placement Percentage</p>
                    <p className="text-2xl font-semibold">{placementPercentage}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Active Universities</p>
                    <p className="text-2xl font-semibold">{activeUniversities} of {totalUniversities}</p>
                  </div>
                </div>
                
                {/* Placement Progress Bar */}
                <div>
                  <div className="mb-1 flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Overall Placement Progress</span>
                    <span className="text-sm font-medium text-gray-700">{placementPercentage}%</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2.5 rounded-full bg-primary-600"
                      style={{ width: `${placementPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default SuperAdminDashboard;


