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
  BriefcaseIcon,
  ClipboardDocumentCheckIcon,
  UserGroupIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { jobs, companies, students } from '@/data/dummy-data';
import { formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Link from 'next/link';

const SubUserDashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== UserRole.SUB_USER) {
      router.push('/login');
    }
  }, [isAuthenticated, router, user]);

  if (!user || user.role !== UserRole.SUB_USER) {
    return null;
  }

  // Filter data for assigned jobs to this sub-user
  const universityId = user.universityId;
  const assignedJobs = jobs.filter(job => 
    job.universityId === universityId && 
    job.assignedUsers.includes(user.id)
  );
  
  // Calculate stats
  const totalAssignedJobs = assignedJobs.length;
  const activeJobs = assignedJobs.filter(job => job.status === 'OPEN' || job.status === 'IN_PROGRESS').length;
  const completedJobs = assignedJobs.filter(job => job.status === 'COMPLETED').length;
  const totalApplications = assignedJobs.reduce((sum, job) => sum + job.applications.length, 0);
  const totalInterviews = assignedJobs.reduce((sum, job) => {
    return sum + job.applications.reduce((interviewCount, app) => 
      interviewCount + (app.interviewFeedback?.length || 0), 0);
  }, 0);
  
  // Upcoming interviews
  const today = new Date();
  const upcomingInterviews = assignedJobs.flatMap(job => {
    return job.interviewProcess
      .filter(round => round.status === 'SCHEDULED' && round.date && new Date(round.date) > today)
      .map(round => ({
        jobId: job.id,
        jobTitle: job.title,
        company: companies.find(c => c.id === job.companyId)?.name || 'Unknown',
        round: round.name,
        date: round.date || '',
        location: round.location || 'Online',
        online: round.online || false,
      }));
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Application status data for chart
  const applicationStatusData = assignedJobs.flatMap(job => job.applications).reduce((acc, app) => {
    if (!acc[app.status]) {
      acc[app.status] = 0;
    }
    acc[app.status]++;
    return acc;
  }, {} as Record<string, number>);

  const statusLabels = Object.keys(applicationStatusData);
  const statusCounts = Object.values(applicationStatusData);

  return (
    <MainLayout title="Sub-User Dashboard">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Assigned Jobs"
            value={totalAssignedJobs}
            icon={<BriefcaseIcon className="h-6 w-6" />}
          />
          <StatCard
            title="Active Jobs"
            value={activeJobs}
            icon={<ClipboardDocumentCheckIcon className="h-6 w-6" />}
          />
          <StatCard
            title="Total Applications"
            value={totalApplications}
            icon={<UserGroupIcon className="h-6 w-6" />}
          />
          <StatCard
            title="Total Interviews"
            value={totalInterviews}
            icon={<CalendarIcon className="h-6 w-6" />}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Application Status Chart */}
          <Chart
            title="Application Status Distribution"
            type="pie"
            series={statusCounts}
            options={{
              labels: statusLabels.map(status => status.replace('_', ' ')),
              legend: {
                position: 'bottom',
              },
            }}
            height={350}
          />

          {/* Upcoming Interviews */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Upcoming Interviews</CardTitle>
              <Link href="/sub-user/jobs">
                <Button variant="outline" size="sm">View All Jobs</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {upcomingInterviews.length > 0 ? (
                <div className="space-y-4">
                  {upcomingInterviews.slice(0, 5).map((interview, index) => (
                    <div key={index} className="flex items-start space-x-4 rounded-lg border border-gray-200 bg-white p-4">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                        <CalendarIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900">{interview.jobTitle}</h4>
                          <span className="text-xs text-gray-500">{formatDate(interview.date, 'MMM dd, yyyy')}</span>
                        </div>
                        <p className="text-sm text-gray-600">{interview.company} - {interview.round}</p>
                        <p className="text-xs text-gray-500">
                          {interview.online ? 'Online Interview' : `Location: ${interview.location}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-40 flex-col items-center justify-center text-center">
                  <p className="text-gray-500">No upcoming interviews scheduled</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Assigned Jobs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Assigned Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-50 text-xs font-medium text-gray-500">
                    <th className="px-4 py-2 text-left">Job Title</th>
                    <th className="px-4 py-2 text-left">Company</th>
                    <th className="px-4 py-2 text-left">Applications</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Next Steps</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {assignedJobs.slice(0, 5).map((job) => {
                    const company = companies.find(c => c.id === job.companyId);
                    const nextInterview = job.interviewProcess.find(round => round.status === 'SCHEDULED');
                    
                    return (
                      <tr key={job.id} className="text-sm text-gray-800">
                        <td className="px-4 py-3">{job.title}</td>
                        <td className="px-4 py-3">{company?.name}</td>
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
                          {nextInterview ? (
                            <div>
                              <div className="font-medium">{nextInterview.name}</div>
                              <div className="text-xs text-gray-500">
                                {nextInterview.date ? formatDate(nextInterview.date, 'MMM dd, yyyy') : 'Date TBD'}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/sub-user/jobs/${job.id}`}>
                            <Button variant="outline" size="sm">Manage</Button>
                          </Link>
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

export default SubUserDashboard;


