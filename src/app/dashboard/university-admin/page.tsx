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
  UserIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { companies, students, jobs } from '@/data/dummy-data';
import { formatCurrency, formatNumber, calculatePercentage } from '@/lib/utils';

const UniversityAdminDashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== UserRole.UNIVERSITY_ADMIN) {
      router.push('/login');
    }
  }, [isAuthenticated, router, user]);

  if (!user || user.role !== UserRole.UNIVERSITY_ADMIN) {
    return null;
  }

  // Filter data for this university
  const universityId = user.universityId;
  const universityStudents = students.filter(s => s.universityId === universityId);
  const universityJobs = jobs.filter(j => j.universityId === universityId);
  const participatingCompanies = Array.from(new Set(universityJobs.map(j => j.companyId))).length;

  
  // Calculate stats
  const totalStudents = universityStudents.length;
  const placedStudents = universityStudents.filter(s => s.placementStatus === 'PLACED').length;
  const offeredStudents = universityStudents.filter(s => s.placementStatus === 'OFFERED').length;
  const inProcessStudents = universityStudents.filter(s => s.placementStatus === 'INTERVIEW_PROCESS').length;
  const placementPercentage = calculatePercentage(placedStudents, totalStudents);
  
  // Get highest & average packages
  const placedStudentsArray = universityStudents.filter(s => s.highestPackage);
  const highestPackage = placedStudentsArray.reduce((max, student) => 
    student.highestPackage && student.highestPackage > max ? student.highestPackage : max, 0);
  
  const averagePackage = placedStudentsArray.length > 0 
    ? placedStudentsArray.reduce((sum, student) => 
      sum + (student.highestPackage || 0), 0) / placedStudentsArray.length 
    : 0;

  // Prepare chart data
  const departmentWisePlacement = universityStudents.reduce((acc, student) => {
    const dept = student.department;
    if (!acc[dept]) {
      acc[dept] = { total: 0, placed: 0 };
    }
    acc[dept].total += 1;
    if (student.placementStatus === 'PLACED') {
      acc[dept].placed += 1;
    }
    return acc;
  }, {} as Record<string, { total: number; placed: number }>);

  const departmentData = Object.entries(departmentWisePlacement).map(([dept, data]) => ({
    department: dept,
    placementRate: calculatePercentage(data.placed, data.total)
  }));

  const monthlyStat = [
    { month: 'Jan', applications: 15, offers: 3 },
    { month: 'Feb', applications: 22, offers: 5 },
    { month: 'Mar', applications: 28, offers: 8 },
    { month: 'Apr', applications: 35, offers: 12 },
    { month: 'May', applications: 42, offers: 15 },
    { month: 'Jun', applications: 38, offers: 14 },
    { month: 'Jul', applications: 30, offers: 10 },
    { month: 'Aug', applications: 25, offers: 8 },
    { month: 'Sep', applications: 32, offers: 11 },
    { month: 'Oct', applications: 40, offers: 18 },
    { month: 'Nov', applications: 45, offers: 22 },
    { month: 'Dec', applications: 38, offers: 19 },
  ];

  // CTC ranges for distribution chart
  const ctcRanges = [
    { range: '<40K', count: 5 },
    { range: '40K-60K', count: 12 },
    { range: '60K-80K', count: 18 },
    { range: '80K-100K', count: 22 },
    { range: '100K-120K', count: 15 },
    { range: '>120K', count: 8 },
  ];

  return (
    <MainLayout title="University Admin Dashboard">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Registered Students"
            value={totalStudents}
            icon={<UserIcon className="h-6 w-6" />}
          />
          <StatCard
            title="Placement Rate"
            value={`${placementPercentage}%`}
            icon={<CheckCircleIcon className="h-6 w-6" />}
          />
          <StatCard
            title="Active Jobs"
            value={universityJobs.length}
            icon={<BriefcaseIcon className="h-6 w-6" />}
          />
          <StatCard
            title="Participating Companies"
            value={participatingCompanies}
            icon={<BuildingOfficeIcon className="h-6 w-6" />}
          />
        </div>

        {/* Placement Status & CTC */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Placement Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Placement Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500">Highest Package</p>
                    <p className="text-2xl font-semibold">{formatCurrency(highestPackage)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Average Package</p>
                    <p className="text-2xl font-semibold">{formatCurrency(averagePackage)}</p>
                  </div>
                </div>
                
                {/* CTC Range Chart */}
                <div className="mt-4">
                  <p className="mb-3 text-sm font-medium text-gray-700">CTC Distribution</p>
                  <div className="space-y-2">
                    {ctcRanges.map((range) => (
                      <div key={range.range}>
                        <div className="mb-1 flex justify-between text-xs">
                          <span>{range.range}</span>
                          <span>{range.count} students</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-200">
                          <div
                            className="h-2 rounded-full bg-primary-600"
                            style={{ width: `${(range.count / 80) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Department-wise Placement */}
          <Chart
            title="Department-wise Placement Rate"
            type="bar"
            series={[
              {
                name: 'Placement Rate (%)',
                data: departmentData.map(data => data.placementRate),
              },
            ]}
            xaxis={{
              categories: departmentData.map(data => data.department),
            }}
            height={350}
          />

          {/* Monthly Applications & Offers */}
          <Chart
            title="Monthly Applications & Offers"
            type="line"
            series={[
              {
                name: 'Applications',
                data: monthlyStat.map(data => data.applications),
              },
              {
                name: 'Offers',
                data: monthlyStat.map(data => data.offers),
              },
            ]}
            xaxis={{
              categories: monthlyStat.map(data => data.month),
            }}
            height={350}
          />
        </div>

        {/* Recent Jobs */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Job Postings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-50 text-xs font-medium text-gray-500">
                    <th className="px-4 py-2 text-left">Job Title</th>
                    <th className="px-4 py-2 text-left">Company</th>
                    <th className="px-4 py-2 text-left">CTC Range</th>
                    <th className="px-4 py-2 text-left">Applications</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Deadline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {universityJobs.slice(0, 5).map((job) => {
                    const company = companies.find(c => c.id === job.companyId);
                    return (
                      <tr key={job.id} className="text-sm text-gray-800">
                        <td className="px-4 py-3">{job.title}</td>
                        <td className="px-4 py-3">{company?.name}</td>
                        <td className="px-4 py-3">
                          {formatCurrency(job.ctcRange.min)} - {formatCurrency(job.ctcRange.max)}
                        </td>
                        <td className="px-4 py-3">{job.applications.length}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 
                            ${job.status === 'OPEN' ? 'bg-green-100 text-green-800' : 
                              job.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 
                              job.status === 'COMPLETED' ? 'bg-purple-100 text-purple-800' : 
                              'bg-gray-100 text-gray-800'}`}
                          >
                            {job.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {new Date(job.applicationDeadline).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};
export default UniversityAdminDashboard;