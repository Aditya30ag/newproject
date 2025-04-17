'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, ApplicationStatus } from '@/types';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Select from '@/components/ui/Select';
import { jobs, companies, students } from '@/data/dummy-data';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import { BriefcaseIcon } from '@heroicons/react/24/outline';

const StudentApplications: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>('');

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
      <MainLayout title="My Applications">
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
      interviewCount: application?.interviewFeedback?.length || 0,
      interviewFeedback: application?.interviewFeedback || [],
      jobType: job.jobType,
      location: job.location,
    };
  });

  // Filter applications by status if selected
  const filteredApplications = statusFilter 
    ? applications.filter(app => app.status === statusFilter)
    : applications;

  // Sort applications by applied date (newest first)
  const sortedApplications = [...filteredApplications].sort((a, b) => 
    new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime()
  );

  // Status filter options
  const statusOptions = [
    { value: '', label: 'All Applications' },
    { value: ApplicationStatus.APPLIED, label: 'Applied' },
    { value: ApplicationStatus.SHORTLISTED, label: 'Shortlisted' },
    { value: ApplicationStatus.INTERVIEW, label: 'In Interview Process' },
    { value: ApplicationStatus.OFFERED, label: 'Offered' },
    { value: ApplicationStatus.ACCEPTED, label: 'Accepted' },
    { value: ApplicationStatus.REJECTED, label: 'Rejected' },
    { value: ApplicationStatus.WITHDRAWN, label: 'Withdrawn' },
  ];

  return (
    <MainLayout title="My Applications">
      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex-1 md:max-w-xs">
                <Select
                  options={statusOptions}
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value)}
                  fullWidth
                />
              </div>
              <div className="text-sm text-gray-500">
                Showing {sortedApplications.length} of {applications.length} applications
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applications List */}
        {sortedApplications.length > 0 ? (
          <div className="space-y-4">
            {sortedApplications.map((application) => (
              <Card key={application.jobId} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Left Side - Company */}
                    <div className="flex w-full items-center justify-center border-b border-gray-200 bg-gray-50 p-6 md:w-48 md:border-b-0 md:border-r">
                      <div className="flex flex-col items-center text-center">
                        <div className="mb-2 h-16 w-16 overflow-hidden rounded-md">
                          {application.companyLogo ? (
                            <img
                              src={application.companyLogo}
                              alt={application.company}
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gray-200 text-xl font-bold text-gray-500">
                              {application.company.charAt(0)}
                            </div>
                          )}
                        </div>
                        <h4 className="font-medium text-gray-900">{application.company}</h4>
                      </div>
                    </div>
                    
                    {/* Right Side - Job Details */}
                    <div className="flex flex-1 flex-col p-6">
                      <div className="mb-4 flex flex-col justify-between space-y-2 md:flex-row md:space-y-0">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{application.jobTitle}</h3>
                          <p className="text-sm text-gray-600">{application.location}</p>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(application.status)}>
                            {application.status.replace('_', ' ')}
                          </Badge>
                          <p className="mt-1 text-xs text-gray-500">
                            Applied on {formatDate(application.appliedDate, 'MMMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                      
                      {/* Application Details */}
                      <div className="mb-4 grid grid-cols-2 gap-4 border-b border-gray-200 pb-4 md:grid-cols-4">
                        <div>
                          <p className="text-xs text-gray-500">Job Type</p>
                          <p className="text-sm font-medium text-gray-900">
                            {application.jobType.replace('_', ' ')}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Salary Range</p>
                          <p className="text-sm font-medium text-gray-900">
                            {formatCurrency(application.ctcRange.min)} - {formatCurrency(application.ctcRange.max)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Interviews</p>
                          <p className="text-sm font-medium text-gray-900">
                            {application.interviewCount > 0 
                              ? `${application.interviewCount} completed` 
                              : 'No interviews yet'}
                          </p>
                        </div>
                        <div>
                          {application.offer ? (
                            <>
                              <p className="text-xs text-gray-500">Offer</p>
                              <p className="text-sm font-medium text-green-600">
                                {formatCurrency(application.offer.ctc)} per year
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="text-xs text-gray-500">Offer</p>
                              <p className="text-sm text-gray-500">No offer yet</p>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Action Button */}
                      <div className="flex justify-end">
                        <Link href={`/student/applications/${application.jobId}`}>
                          <Button variant="outline" size="sm">View Details</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-10 text-center">
              <div className="mb-4 rounded-full bg-gray-100 p-3">
                <BriefcaseIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No applications found</h3>
              <p className="mt-1 text-gray-500">
                {statusFilter 
                  ? `You don't have any applications with "${statusOptions.find(o => o.value === statusFilter)?.label}" status.` 
                  : "You haven't applied to any jobs yet."}
              </p>
              {!statusFilter ? (
                <div className="mt-4">
                  <Link href="/student/jobs">
                    <Button>Browse Available Jobs</Button>
                  </Link>
                </div>
              ) : (
                <div className="mt-4">
                  <Button variant="outline" onClick={() => setStatusFilter('')}>
                    Show All Applications
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default StudentApplications;


