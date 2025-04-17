'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Chart from '@/components/dashboard/Chart';
import { students, jobs, companies } from '@/data/dummy-data';
import { formatDate, getStatusColor, formatCurrency } from '@/lib/utils';
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  DocumentArrowDownIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

interface StudentDetailPageProps {
  params: {
    id: string;
  };
}

const StudentDetailPage: React.FC<StudentDetailPageProps> = ({ params }) => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [studentData, setStudentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [studentApplications, setStudentApplications] = useState<any[]>([]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== UserRole.UNIVERSITY_ADMIN) {
      router.push('/login');
      return;
    }

    // Simulate API fetch
    const fetchStudentData = () => {
      const student = students.find(s => s.id === params.id);
      
      if (!student || student.universityId !== user.universityId) {
        router.push('/university/students');
        return;
      }

      setStudentData(student);

      // Get student applications
      if (student.appliedJobs.length > 0) {
        const applications = student.appliedJobs.map(jobId => {
          const job = jobs.find(j => j.id === jobId);
          if (!job) return null;
          
          const company = companies.find(c => c.id === job.companyId);
          const application = job.applications.find(app => app.studentId === student.id);
          
          return {
            jobId,
            jobTitle: job.title,
            company: company?.name || 'Unknown Company',
            companyLogo: company?.logo,
            status: application?.status || 'APPLIED',
            appliedDate: application?.appliedDate || '',
            ctcRange: job.ctcRange,
            offer: application?.offer,
            interviewFeedback: application?.interviewFeedback || [],
          };
        }).filter(Boolean);
        
        setStudentApplications(applications);
      }
      
      setIsLoading(false);
    };

    fetchStudentData();
  }, [isAuthenticated, router, user, params.id]);

  if (!user || user.role !== UserRole.UNIVERSITY_ADMIN || !user.universityId) {
    return null;
  }

  if (isLoading) {
    return (
      <MainLayout title="Student Details">
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <div className="mb-3 h-10 w-10 animate-spin rounded-full border-2 border-gray-300 border-t-primary-600"></div>
            <p className="text-gray-500">Loading student details...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!studentData) {
    return (
      <MainLayout title="Student Not Found">
        <div className="flex h-full flex-col items-center justify-center text-center">
          <h2 className="text-xl font-semibold text-gray-700">Student not found</h2>
          <p className="mt-2 text-gray-600">The student you're looking for doesn't exist or you don't have permission to view their details.</p>
          <Link href="/university/students" className="mt-4">
            <Button leftIcon={<ArrowLeftIcon className="h-4 w-4" />}>Back to Students</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  // Calculate application status distribution for chart
  const applicationStatusCounts: Record<string, number> = {};
  studentApplications.forEach(app => {
    const status = app.status;
    applicationStatusCounts[status] = (applicationStatusCounts[status] || 0) + 1;
  });

  const statusLabels = Object.keys(applicationStatusCounts);
  const statusValues = Object.values(applicationStatusCounts);

  return (
    <MainLayout title={`Student: ${studentData.name}`}>
      <div className="space-y-6">
        {/* Back button */}
        <div className="flex items-center justify-between">
          <Link href="/university/students">
            <Button 
              variant="outline" 
              size="sm" 
              leftIcon={<ArrowLeftIcon className="h-4 w-4" />}
            >
              Back to Students
            </Button>
          </Link>
          <Link href={`/university/students/${studentData.id}/edit`}>
            <Button 
              variant="outline" 
              leftIcon={<PencilIcon className="h-4 w-4" />}
            >
              Edit Student
            </Button>
          </Link>
        </div>

        {/* Student Profile Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-start gap-6 md:flex-row">
              {/* Profile Picture */}
              <div className="flex flex-col items-center">
                <div className="h-32 w-32 overflow-hidden rounded-xl">
                  {studentData.profilePicture ? (
                    <img
                      src={studentData.profilePicture}
                      alt={studentData.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-100 text-4xl font-medium text-gray-500">
                      {studentData.name.charAt(0)}
                    </div>
                  )}
                </div>
                
                {studentData.resumeUrl && (
                  <a 
                    href={studentData.resumeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="mt-4 flex items-center text-sm text-primary-600 hover:text-primary-700"
                  >
                    <DocumentArrowDownIcon className="mr-1 h-4 w-4" />
                    View Resume
                  </a>
                )}
              </div>
              
              {/* Student Information */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">{studentData.name}</h2>
                  <Badge className={getStatusColor(studentData.placementStatus)}>
                    {studentData.placementStatus.replace('_', ' ')}
                  </Badge>
                </div>
                
                <div className="mt-1 text-lg text-gray-700">
                  {studentData.degree} in {studentData.department}
                </div>
                
                <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2 md:grid-cols-3">
                  <div className="flex items-center gap-2">
                    <AcademicCapIcon className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700">Batch: {studentData.batch}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AcademicCapIcon className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700">CGPA: {studentData.cgpa}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AcademicCapIcon className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700">Roll: {studentData.rollNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700">{studentData.email}</span>
                  </div>
                  {studentData.phone && (
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-700">{studentData.phone}</span>
                    </div>
                  )}
                  {studentData.dateOfBirth && (
                    <div className="flex items-center gap-2">
                      <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-700">DOB: {formatDate(studentData.dateOfBirth, 'MMM dd, yyyy')}</span>
                    </div>
                  )}
                </div>
                
                {/* Skills */}
                {studentData.skills && studentData.skills.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-700">Skills</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {studentData.skills.map((skill: string, index: number) => (
                        <span 
                          key={index} 
                          className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Placement Summary */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Application Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Application Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-blue-50 p-4">
                  <p className="text-sm font-medium text-blue-700">Applied Jobs</p>
                  <p className="mt-1 text-2xl font-semibold text-blue-900">{studentData.appliedJobs.length}</p>
                </div>
                
                <div className="rounded-lg bg-green-50 p-4">
                  <p className="text-sm font-medium text-green-700">Offers Received</p>
                  <p className="mt-1 text-2xl font-semibold text-green-900">{studentData.offeredJobs.length}</p>
                </div>
                
                {studentData.highestPackage && (
                  <div className="col-span-2 rounded-lg bg-purple-50 p-4">
                    <p className="text-sm font-medium text-purple-700">Highest Package</p>
                    <p className="mt-1 text-2xl font-semibold text-purple-900">
                      {formatCurrency(studentData.highestPackage)}
                    </p>
                  </div>
                )}
              </div>

              {statusLabels.length > 0 && (
                <div className="mt-6">
                  <h4 className="mb-4 text-sm font-medium text-gray-700">Application Status Distribution</h4>
                  <div className="h-64">
                    <Chart
                      title=""
                      type="pie"
                      series={statusValues}
                      options={{
                        labels: statusLabels.map(status => status.replace('_', ' ')),
                        legend: {
                          position: 'bottom',
                        },
                      }}
                      height={250}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Applications */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Applications</CardTitle>
              {studentApplications.length > 3 && (
                <Button variant="outline" size="sm">View All</Button>
              )}
            </CardHeader>
            <CardContent>
              {studentApplications.length > 0 ? (
                <div className="space-y-4">
                  {studentApplications.slice(0, 3).map((app, index) => (
                    <div key={index} className="rounded-lg border border-gray-200 p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start">
                          {app.companyLogo ? (
                            <img
                              src={app.companyLogo}
                              alt={app.company}
                              className="mr-3 h-10 w-10 rounded-md object-contain"
                            />
                          ) : (
                            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 text-gray-500">
                              <BriefcaseIcon className="h-6 w-6" />
                            </div>
                          )}
                          <div>
                            <h4 className="font-medium text-gray-900">{app.jobTitle}</h4>
                            <p className="text-sm text-gray-600">{app.company}</p>
                            <p className="mt-1 text-xs text-gray-500">
                              Applied on {formatDate(app.appliedDate, 'MMM dd, yyyy')}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(app.status)}>
                          {app.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      {app.offer && (
                        <div className="mt-3 rounded-md bg-green-50 p-2 text-sm">
                          <span className="font-medium text-green-700">Offer: </span>
                          <span className="text-green-800">{formatCurrency(app.offer.ctc)}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-48 flex-col items-center justify-center text-center">
                  <BriefcaseIcon className="h-10 w-10 text-gray-300" />
                  <p className="mt-2 text-gray-500">No applications yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Applications Table */}
        {studentApplications.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>All Applications</CardTitle>
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
                      <th className="px-4 py-2 text-left">CTC</th>
                      <th className="px-4 py-2 text-left">Interviews</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {studentApplications.map((app, index) => (
                      <tr key={index} className="text-sm">
                        <td className="px-4 py-3">{app.company}</td>
                        <td className="px-4 py-3">{app.jobTitle}</td>
                        <td className="px-4 py-3">{formatDate(app.appliedDate, 'MMM dd, yyyy')}</td>
                        <td className="px-4 py-3">
                          <Badge className={getStatusColor(app.status)}>
                            {app.status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {app.offer ? (
                            <span className="font-medium text-green-600">{formatCurrency(app.offer.ctc)}</span>
                          ) : (
                            <span className="text-gray-500">
                              {formatCurrency(app.ctcRange.min)} - {formatCurrency(app.ctcRange.max)}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {app.interviewFeedback.length > 0 ? (
                            <Button variant="outline" size="sm">
                              View {app.interviewFeedback.length} {app.interviewFeedback.length === 1 ? 'Round' : 'Rounds'}
                            </Button>
                          ) : (
                            <span className="text-gray-500">No interviews yet</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default StudentDetailPage;

