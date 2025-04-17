'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, ApplicationStatus } from '@/types';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatCard from '@/components/dashboard/StatCard';
import Chart from '@/components/dashboard/Chart';
import {
  BriefcaseIcon,
  ClipboardDocumentCheckIcon,
  CheckCircleIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { jobs, companies, students } from '@/data/dummy-data';
import { formatDate, formatCurrency } from '@/lib/utils';

const StudentDashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== UserRole.STUDENT) {
      router.push('/login');
    }
  }, [isAuthenticated, router, user]);

  if (!user || user.role !== UserRole.STUDENT) {
    return null;
  }

  // Get student data
  const student = students.find(s => s.email === user.email);
  
  if (!student) {
    return (
      <MainLayout title="Student Dashboard">
        <div className="flex h-full flex-col items-center justify-center text-center">
          <h2 className="text-xl font-semibold text-gray-700">Student profile not found</h2>
          <p className="mt-2 text-gray-600">Please contact your university administrator.</p>
        </div>
      </MainLayout>
    );
  }

  // Get application data
  const appliedJobs = jobs.filter(job => student.appliedJobs.includes(job.id));
  const applications = appliedJobs.map(job => {
    const application = job.applications.find(app => app.studentId === student.id);
    const company = companies.find(c => c.id === job.companyId);
    
    return {
      jobId: job.id,
      jobTitle: job.title,
      company: company?.name || '',
      companyLogo: company?.logo || '',
      status: application?.status || ApplicationStatus.APPLIED,
      appliedDate: application?.appliedDate || '',
      ctcRange: job.ctcRange,
      offer: application?.offer,
    };
  });

  // Count applications by status
  const applicationsByStatus = applications.reduce((acc, app) => {
    if (!acc[app.status]) {
      acc[app.status] = 0;
    }
    acc[app.status]++;
    return acc;
  }, {} as Record<string, number>);

  // Get upcoming interviews
  const upcomingInterviews = appliedJobs.flatMap(job => {
    const application = job.applications.find(app => app.studentId === student.id);
    if (!application || application.status !== ApplicationStatus.INTERVIEW) {
      return [];
    }
    
    const today = new Date();
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
        meetingLink: round.meetingLink || '',
      }));
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Stats
  const totalApplications = applications.length;
  const offersReceived = applications.filter(app => 
    app.status === ApplicationStatus.OFFERED || app.status === ApplicationStatus.ACCEPTED).length;
  const activeApplications = applications.filter(app => 
    app.status === ApplicationStatus.APPLIED || 
    app.status === ApplicationStatus.SHORTLISTED || 
    app.status === ApplicationStatus.INTERVIEW).length;
  
  // Recommended jobs
  const universityJobs = jobs.filter(job => 
    job.universityId === student.universityId && 
    job.status === 'OPEN' && 
    !student.appliedJobs.includes(job.id) &&
    job.eligibilityCriteria.departments.includes(student.department) &&
    job.eligibilityCriteria.minCGPA <= student.cgpa
  );

  return (
    <MainLayout title="Student Dashboard">
      <div className="space-y-6">
        {/* Profile summary card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-full bg-gray-100">
                  {student.profilePicture ? (
                    <img 
                      src={student.profilePicture} 
                      alt={student.name} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary-100 text-primary-700">
                      <span className="text-xl font-bold">
                        {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{student.name}</h2>
                  <p className="text-gray-600">{student.department} • {student.degree}</p>
                  <p className="text-sm text-gray-500">CGPA: {student.cgpa}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 md:flex-row">
                <Link href="/student/profile">
                  <Button variant="outline">View Profile</Button>
                </Link>
                <Link href="/student/jobs">
                  <Button>Browse Jobs</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Applications"
            value={totalApplications}
            icon={<BriefcaseIcon className="h-6 w-6" />}
          />
          <StatCard
            title="Active Applications"
            value={activeApplications}
            icon={<ClipboardDocumentCheckIcon className="h-6 w-6" />}
          />
          <StatCard
            title="Offers Received"
            value={offersReceived}
            icon={<CheckCircleIcon className="h-6 w-6" />}
          />
          <StatCard
            title="Upcoming Interviews"
            value={upcomingInterviews.length}
            icon={<CalendarIcon className="h-6 w-6" />}
          />
        </div>

        {/* Application Status & Upcoming Interviews */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Application Status Chart */}
          <Chart
            title="Application Status"
            type="pie"
            series={Object.values(applicationsByStatus)}
            options={{
              labels: Object.keys(applicationsByStatus).map(status => 
                status.replace('_', ' ').charAt(0) + status.replace('_', ' ').slice(1).toLowerCase()
              ),
              legend: {
                position: 'bottom',
              },
            }}
            height={300}
          />

          {/* Upcoming Interviews */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Interviews</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingInterviews.length > 0 ? (
                <div className="space-y-4">
                  {upcomingInterviews.map((interview, index) => (
                    <div key={index} className="rounded-lg border border-gray-200 bg-white p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{interview.company}</h4>
                          <p className="text-sm text-gray-700">{interview.jobTitle}</p>
                          <p className="text-sm text-gray-500">{interview.round}</p>
                          <div className="mt-2 text-xs text-gray-500">
                            <p>Date: {formatDate(interview.date, 'EEEE, MMMM dd, yyyy')}</p>
                            <p>
                              {interview.online 
                                ? `Online Interview ${interview.meetingLink ? '- Meeting link provided' : ''}`
                                : `Location: ${interview.location}`
                              }
                            </p>
                          </div>
                        </div>
                        <Link href={`/student/applications/${interview.jobId}`}>
                          <Button variant="outline" size="sm">Details</Button>
                        </Link>
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

        {/* Recent Applications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Applications</CardTitle>
            <Link href="/student/applications">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-50 text-xs font-medium text-gray-500">
                    <th className="px-4 py-2 text-left">Company</th>
                    <th className="px-4 py-2 text-left">Job Title</th>
                    <th className="px-4 py-2 text-left">Applied On</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">CTC Range</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {applications.slice(0, 5).map((app) => (
                    <tr key={app.jobId} className="text-sm text-gray-800">
                      <td className="px-4 py-3">{app.company}</td>
                      <td className="px-4 py-3">{app.jobTitle}</td>
                      <td className="px-4 py-3">{formatDate(app.appliedDate, 'MMM dd, yyyy')}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 
                          ${app.status === 'APPLIED' ? 'bg-blue-100 text-blue-800' : 
                          app.status === 'SHORTLISTED' ? 'bg-yellow-100 text-yellow-800' : 
                          app.status === 'INTERVIEW' ? 'bg-indigo-100 text-indigo-800' : 
                          app.status === 'OFFERED' ? 'bg-green-100 text-green-800' : 
                          app.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' : 
                          app.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 
                          'bg-gray-100 text-gray-800'}`}
                        >
                          {app.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {formatCurrency(app.ctcRange.min)} - {formatCurrency(app.ctcRange.max)}
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/student/applications/${app.jobId}`}>
                          <Button variant="outline" size="sm">View</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Recommended Jobs */}
        <Card>
          <CardHeader>
            <CardTitle>Recommended Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            {universityJobs.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {universityJobs.slice(0, 6).map((job) => {
                  const company = companies.find(c => c.id === job.companyId);
                  return (
                    <div
                      key={job.id}
                      className="flex flex-col rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                    >
                      <div className="mb-3 flex items-center">
                        <div className="mr-3 h-10 w-10 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                          {company?.logo ? (
                            <img
                              src={company.logo}
                              alt={company?.name}
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-500">
                              {company?.name.charAt(0) || '?'}
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{company?.name}</h4>
                          <p className="text-xs text-gray-500">{job.location}</p>
                        </div>
                      </div>
                      <h3 className="mb-1 font-medium">{job.title}</h3>
                      <p className="mb-2 text-xs text-gray-500">
                        {formatCurrency(job.ctcRange.min)} - {formatCurrency(job.ctcRange.max)}
                      </p>
                      <p className="mb-3 text-xs text-gray-500 line-clamp-2">
                        {job.description.slice(0, 100)}...
                      </p>
                      <div className="mt-auto">
                        <Link href={`/student/jobs/${job.id}`}>
                          <Button size="sm" fullWidth>View Details</Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex h-32 flex-col items-center justify-center text-center">
                <p className="text-gray-500">No matching job opportunities available right now</p>
                <p className="text-sm text-gray-400">Check back later for new opportunities</p>
              </div>
            )}
            {universityJobs.length > 6 && (
              <div className="mt-4 flex justify-center">
                <Link href="/student/jobs">
                  <Button variant="outline">View All Jobs</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default StudentDashboard;


