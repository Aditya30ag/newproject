'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { jobs, companies, students } from '@/data/dummy-data';
import { formatCurrency, formatDate, formatJobType } from '@/lib/utils';
import {
  BriefcaseIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  ClockIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

interface JobDetailPageProps {
  params: {
    id: string;
  };
}

const JobDetailPage: React.FC<JobDetailPageProps> = ({ params }) => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const jobId = params.id;

  useEffect(() => {
    if (!isAuthenticated || user?.role !== UserRole.STUDENT) {
      router.push('/login');
    }
  }, [isAuthenticated, router, user]);

  if (!user || user.role !== UserRole.STUDENT) {
    return null;
  }

  // Get job data
  const job = jobs.find(j => j.id === jobId);
  
  if (!job) {
    return (
      <MainLayout title="Job Not Found">
        <div className="flex h-full flex-col items-center justify-center text-center">
          <h2 className="text-xl font-semibold text-gray-700">Job not found</h2>
          <p className="mt-2 text-gray-600">The job you're looking for doesn't exist or has been removed.</p>
          <Link href="/student/jobs" className="mt-4">
            <Button leftIcon={<ArrowLeftIcon className="h-4 w-4" />}>Back to Jobs</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  // Get company data
  const company = companies.find(c => c.id === job.companyId);
  
  // Get student data
  const student = students.find(s => s.email === user.email);
  const hasApplied = student?.appliedJobs.includes(job.id) || false;
  
  // Check eligibility
  const isEligible = student && 
    job.eligibilityCriteria.departments.includes(student.department) && 
    job.eligibilityCriteria.minCGPA <= student.cgpa;

  return (
    <MainLayout title="Job Details">
      <div className="space-y-6">
        {/* Back button */}
        <div>
          <Link href="/student/jobs">
            <Button 
              variant="outline" 
              size="sm" 
              leftIcon={<ArrowLeftIcon className="h-4 w-4" />}
            >
              Back to Jobs
            </Button>
          </Link>
        </div>

        {/* Job Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between">
              <div className="flex items-start">
                <div className="mr-4 h-16 w-16 overflow-hidden rounded-lg bg-gray-100">
                  {company?.logo ? (
                    <img 
                      src={company.logo} 
                      alt={company?.name} 
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-200 text-xl font-bold text-gray-500">
                      {company?.name.charAt(0) || '?'}
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                  <p className="mt-1 text-gray-600">{company?.name}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                      {formatJobType(job.jobType)}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      {job.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-col items-end md:mt-0">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Application Deadline</p>
                  <p className="font-medium text-gray-900">{formatDate(job.applicationDeadline, 'MMMM dd, yyyy')}</p>
                </div>
                <div className="mt-4">
                  {hasApplied ? (
                    <Button variant="secondary" disabled>Already Applied</Button>
                  ) : (
                    <>
                      {isEligible ? (
                        <Link href={`/student/jobs/${job.id}/apply`}>
                          <Button>Apply Now</Button>
                        </Link>
                      ) : (
                        <Button variant="danger" disabled>Not Eligible</Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Details */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Job Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
              </CardContent>
            </Card>

            {/* Responsibilities */}
            <Card>
              <CardHeader>
                <CardTitle>Responsibilities</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-line">{job.responsibilities}</p>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-line">{job.requirements}</p>
              </CardContent>
            </Card>

            {/* Interview Process */}
            <Card>
              <CardHeader>
                <CardTitle>Interview Process</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {job.interviewProcess.map((round, index) => (
                    <div key={round.id} className="relative pl-8 pb-4">
                      {/* Vertical line connecting steps */}
                      {index < job.interviewProcess.length - 1 && (
                        <div className="absolute top-4 bottom-0 left-3 w-0.5 bg-gray-200"></div>
                      )}
                      {/* Step circle */}
                      <div className="absolute top-0 left-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                        <span className="text-xs font-medium">{index + 1}</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{round.name}</h3>
                        {round.description && (
                          <p className="mt-1 text-sm text-gray-500">{round.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Job Details & Company Info */}
          <div className="space-y-6">
            {/* Job Details */}
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-primary-100 text-primary-600">
                      <BriefcaseIcon className="h-5 w-5" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">Job Type</h3>
                      <p className="text-sm text-gray-500">{formatJobType(job.jobType)}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-primary-100 text-primary-600">
                      <MapPinIcon className="h-5 w-5" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">Location</h3>
                      <p className="text-sm text-gray-500">{job.location}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-primary-100 text-primary-600">
                      <CurrencyDollarIcon className="h-5 w-5" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">Salary Range</h3>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(job.ctcRange.min)} - {formatCurrency(job.ctcRange.max)} per year
                      </p>
                      {job.ctcBreakup && (
                        <p className="mt-1 text-xs text-gray-500">{job.ctcBreakup}</p>
                      )}
                    </div>
                  </div>

                  {job.jobType === 'INTERNSHIP' && job.internshipDetails && (
                    <div className="flex items-start">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-primary-100 text-primary-600">
                        <ClockIcon className="h-5 w-5" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-gray-900">Internship Details</h3>
                        <p className="text-sm text-gray-500">
                          Duration: {job.internshipDetails.duration}
                        </p>
                        <p className="text-sm text-gray-500">
                          Stipend: ${job.internshipDetails.stipend}/month
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-primary-100 text-primary-600">
                      <AcademicCapIcon className="h-5 w-5" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">Eligibility</h3>
                      <p className="text-sm text-gray-500">
                        Departments: {job.eligibilityCriteria.departments.join(', ')}
                      </p>
                      <p className="text-sm text-gray-500">
                        Minimum CGPA: {job.eligibilityCriteria.minCGPA}
                      </p>
                      {job.eligibilityCriteria.otherRequirements && (
                        <p className="mt-1 text-xs text-gray-500">{job.eligibilityCriteria.otherRequirements}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-primary-100 text-primary-600">
                      <CalendarIcon className="h-5 w-5" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">Application Deadline</h3>
                      <p className="text-sm text-gray-500">
                        {formatDate(job.applicationDeadline, 'MMMM dd, yyyy')}
                      </p>
                    </div>
                  </div>

                  {job.documents.length > 0 && (
                    <div className="flex items-start">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-primary-100 text-primary-600">
                        <DocumentTextIcon className="h-5 w-5" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-gray-900">Documents</h3>
                        <ul className="mt-1 space-y-1">
                          {job.documents.map((doc, index) => (
                            <li key={index}>
                              <a 
                                href={doc.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-primary-600 hover:text-primary-700"
                              >
                                {doc.name}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle>About the Company</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 overflow-hidden rounded-md bg-gray-100">
                      {company?.logo ? (
                        <img 
                          src={company.logo} 
                          alt={company?.name} 
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-200 text-xl font-bold text-gray-500">
                          {company?.name.charAt(0) || '?'}
                        </div>
                      )}
                    </div>
                    <div className="ml-3">
                      <h3 className="font-medium text-gray-900">{company?.name}</h3>
                      <p className="text-sm text-gray-500">{company?.industry}</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600">{company?.description}</p>

                  <div className="flex items-start">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-primary-100 text-primary-600">
                      <BuildingOfficeIcon className="h-5 w-5" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">Headquarters</h3>
                      <p className="text-sm text-gray-500">{company?.address}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Website</h3>
                    <a 
                      href={`https://${company?.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      {company?.website}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Application Action */}
            <Card>
              <CardContent className="p-6">
                {hasApplied ? (
                  <div className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="mt-3 text-lg font-medium text-gray-900">Application Submitted</h3>
                    <p className="mt-1 text-sm text-gray-500">You have already applied for this position.</p>
                    <div className="mt-4">
                      <Link href="/student/applications">
                        <Button variant="outline" fullWidth>View Your Applications</Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    {isEligible ? (
                      <>
                        <h3 className="text-lg font-medium text-gray-900">Ready to Apply?</h3>
                        <p className="mt-1 text-sm text-gray-500">Submit your application today!</p>
                        <div className="mt-4">
                          <Link href={`/student/jobs/${job.id}/apply`}>
                            <Button fullWidth>Apply Now</Button>
                          </Link>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                        <h3 className="mt-3 text-lg font-medium text-gray-900">Not Eligible</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          You don't meet the eligibility criteria for this job.
                        </p>
                        <div className="mt-4">
                          <Link href="/student/jobs">
                            <Button variant="outline" fullWidth>Browse Other Jobs</Button>
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default JobDetailPage;


