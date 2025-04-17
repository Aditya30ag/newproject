'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { jobs, companies, students } from '@/data/dummy-data';
import { formatCurrency, formatJobType } from '@/lib/utils';
import { ArrowLeftIcon, DocumentArrowUpIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

// Application form schema
const applicationSchema = z.object({
  resume: z.string().min(1, 'Resume is required'),
  coverLetter: z.string().optional(),
  contactEmail: z.string().email('Invalid email address'),
  contactPhone: z.string().min(10, 'Phone number must be at least 10 characters'),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

interface JobApplicationPageProps {
  params: {
    id: string;
  };
}

const JobApplicationPage: React.FC<JobApplicationPageProps> = ({ params }) => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const jobId = params.id;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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
  
  // If student has already applied, redirect to job details
  useEffect(() => {
    if (student && hasApplied) {
      router.push(`/student/jobs/${jobId}`);
    }
  }, [student, hasApplied, jobId, router]);
  
  // Check eligibility
  const isEligible = student && 
    job.eligibilityCriteria.departments.includes(student.department) && 
    job.eligibilityCriteria.minCGPA <= student.cgpa;

  // If student is not eligible, redirect to job details
  useEffect(() => {
    if (student && !isEligible) {
      router.push(`/student/jobs/${jobId}`);
    }
  }, [student, isEligible, jobId, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      resume: student?.resumeUrl || '',
      coverLetter: '',
      contactEmail: student?.email || '',
      contactPhone: student?.phone || '',
      agreeToTerms: false,
    },
  });

  const onSubmit = async (data: ApplicationFormData) => {
    setIsSubmitting(true);
    
    // Simulate API call with 1.5s delay
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // In a real app, update the student data on the backend
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/student/applications');
      }, 2000);
    }, 1500);
  };

  if (isSuccess) {
    return (
      <MainLayout title="Application Submitted">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-10 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
              <PaperAirplaneIcon className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Application Submitted!</h2>
            <p className="mt-2 text-gray-600">
              Your application for {job.title} at {company?.name} has been successfully submitted.
            </p>
            <p className="mt-1 text-gray-500">
              You will be redirected to your applications page shortly.
            </p>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Apply for Job">
      <div className="space-y-6">
        {/* Back button */}
        <div>
          <Link href={`/student/jobs/${jobId}`}>
            <Button 
              variant="outline" 
              size="sm" 
              leftIcon={<ArrowLeftIcon className="h-4 w-4" />}
            >
              Back to Job Details
            </Button>
          </Link>
        </div>

        {/* Job Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start">
              <div className="mr-4 h-14 w-14 overflow-hidden rounded-lg bg-gray-100">
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
                <h1 className="text-xl font-bold text-gray-900">{job.title}</h1>
                <p className="text-gray-600">{company?.name} • {job.location}</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                    {formatJobType(job.jobType)}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                    {formatCurrency(job.ctcRange.min)} - {formatCurrency(job.ctcRange.max)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Application Form */}
        <Card>
          <CardHeader>
            <CardTitle>Application Form</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Resume */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Resume</label>
                
                {student?.resumeUrl ? (
                  <div className="mt-1 flex items-center justify-between rounded-md border border-gray-300 bg-gray-50 p-3">
                    <div className="flex items-center">
                      <DocumentArrowUpIcon className="mr-2 h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-600">Current resume on file</span>
                    </div>
                    
                    <a 
                      href={student.resumeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-primary-600 hover:text-primary-500"
                    >
                      View
                    </a>
                  </div>
                ) : (
                  <div className="mt-1">
                    <Input 
                      type="file"
                      accept=".pdf,.doc,.docx"
                      {...register('resume')}
                      error={errors.resume?.message}
                      fullWidth
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Accepted formats: PDF, DOC, DOCX. Maximum file size: 5MB.
                    </p>
                  </div>
                )}
              </div>

              {/* Cover Letter - Optional */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Cover Letter (Optional)
                </label>
                <div className="mt-1">
                  <textarea
                    rows={4}
                    className="block w-full rounded-md border border-gray-300 p-2 text-gray-900 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Write a cover letter or upload a file..."
                    {...register('coverLetter')}
                  ></textarea>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  A cover letter can help you stand out by explaining why you're a great fit for this role.
                </p>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="Your email address"
                  {...register('contactEmail')}
                  error={errors.contactEmail?.message}
                  fullWidth
                />
                
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="Your phone number"
                  {...register('contactPhone')}
                  error={errors.contactPhone?.message}
                  fullWidth
                />
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start">
                <div className="flex h-5 items-center">
                  <input
                    id="terms"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    {...register('agreeToTerms')}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="font-medium text-gray-700">
                    Terms and Conditions
                  </label>
                  <p className="text-gray-500">
                    I confirm that all information provided is accurate and complete. I understand that any false information may result in the rejection of my application.
                  </p>
                  {errors.agreeToTerms && (
                    <p className="mt-1 text-xs text-red-500">{errors.agreeToTerms.message}</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  loadingText="Submitting Application..."
                >
                  Submit Application
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default JobApplicationPage;


