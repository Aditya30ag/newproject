'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, JobStatus, JobType, InterviewStatus } from '@/types';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { jobs, companies, users } from '@/data/dummy-data';
import { ArrowLeftIcon, PlusIcon, MinusCircleIcon } from '@heroicons/react/24/outline';

// Job edit schema (same as create schema)
const jobSchema = z.object({
  title: z.string().min(1, 'Job title is required'),
  companyId: z.string().min(1, 'Company is required'),
  description: z.string().min(1, 'Description is required'),
  requirements: z.string().min(1, 'Requirements are required'),
  responsibilities: z.string().min(1, 'Responsibilities are required'),
  location: z.string().min(1, 'Location is required'),
  jobType: z.nativeEnum(JobType, {
    errorMap: () => ({ message: 'Please select a job type' }),
  }),
  status: z.nativeEnum(JobStatus, {
    errorMap: () => ({ message: 'Please select a status' }),
  }),
  ctcRange: z.object({
    min: z.string().min(1, 'Minimum CTC is required').transform(val => Number(val)),
    max: z.string().min(1, 'Maximum CTC is required').transform(val => Number(val)),
  }).refine(data => data.max >= data.min, {
    message: 'Maximum CTC must be greater than or equal to Minimum CTC',
    path: ['max'],
  }),
  ctcBreakup: z.string().optional(),
  internshipDetails: z.object({
    duration: z.string().optional(),
    stipend: z.string().transform(val => Number(val || 0)).optional(),
  }).optional(),
  expectedHires: z.string().min(1, 'Expected hires is required').transform(val => Number(val)),
  assignedUsers: z.array(z.string()).optional(),
  contactPersons: z.array(z.string()).min(1, 'At least one contact person is required'),
  applicationDeadline: z.string().min(1, 'Application deadline is required'),
  eligibilityCriteria: z.object({
    departments: z.array(z.string()).min(1, 'At least one department is required'),
    minCGPA: z.string().min(1, 'Minimum CGPA is required').transform(val => Number(val)),
    otherRequirements: z.string().optional(),
  }),
  interviewProcess: z.array(z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'Round name is required'),
    description: z.string().optional(),
    status: z.nativeEnum(InterviewStatus, {
      errorMap: () => ({ message: 'Please select a status' }),
    }),
  })).min(1, 'At least one interview round is required'),
});

type JobFormData = z.infer<typeof jobSchema>;

interface EditJobPageProps {
  params: {
    id: string;
  };
}

const EditJobPage: React.FC<EditJobPageProps> = ({ params }) => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jobData, setJobData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Department options (in a real app, these would come from the database)
  const departmentOptions = [
    { value: 'Computer Science', label: 'Computer Science' },
    { value: 'Electrical Engineering', label: 'Electrical Engineering' },
    { value: 'Mechanical Engineering', label: 'Mechanical Engineering' },
    { value: 'Civil Engineering', label: 'Civil Engineering' },
    { value: 'Business', label: 'Business' },
    { value: 'Data Science', label: 'Data Science' },
    { value: 'Artificial Intelligence', label: 'Artificial Intelligence' },
    { value: 'Cybersecurity', label: 'Cybersecurity' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Marketing', label: 'Marketing' },
  ];

  // Fetch job data
  useEffect(() => {
    if (!isAuthenticated || user?.role !== UserRole.UNIVERSITY_ADMIN) {
      router.push('/login');
      return;
    }

    // In a real app, this would be an API call
    const job = jobs.find(j => j.id === params.id);
    
    if (!job || job.universityId !== user.universityId) {
      router.push('/university/jobs');
      return;
    }

    setJobData(job);
    setIsLoading(false);
  }, [isAuthenticated, router, user, params.id]);

  if (!user || user.role !== UserRole.UNIVERSITY_ADMIN || !user.universityId) {
    return null;
  }

  if (isLoading) {
    return (
      <MainLayout title="Edit Job">
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <div className="mb-3 h-10 w-10 animate-spin rounded-full border-2 border-gray-300 border-t-primary-600"></div>
            <p className="text-gray-500">Loading job details...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!jobData) {
    return (
      <MainLayout title="Job Not Found">
        <div className="flex h-full flex-col items-center justify-center text-center">
          <h2 className="text-xl font-semibold text-gray-700">Job not found</h2>
          <p className="mt-2 text-gray-600">The job you're looking for doesn't exist or you don't have permission to edit it.</p>
          <Link href="/university/jobs" className="mt-4">
            <Button leftIcon={<ArrowLeftIcon className="h-4 w-4" />}>Back to Jobs</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  // Filter sub-users for assigning jobs
  const subUsers = users.filter(u => 
    u.role === UserRole.SUB_USER && u.universityId === user.universityId
  );

  // Get companies for dropdown
  const companyOptions = companies.map(company => ({
    value: company.id,
    label: company.name,
  }));

  // Format date for HTML date input (YYYY-MM-DD)
  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: jobData.title,
      companyId: jobData.companyId,
      description: jobData.description,
      requirements: jobData.requirements,
      responsibilities: jobData.responsibilities,
      location: jobData.location,
      jobType: jobData.jobType,
      status: jobData.status,
      ctcRange: {
        min: jobData.ctcRange.min.toString(),
        max: jobData.ctcRange.max.toString(),
      },
      ctcBreakup: jobData.ctcBreakup || '',
      expectedHires: jobData.expectedHires.toString(),
      assignedUsers: jobData.assignedUsers || [],
      contactPersons: jobData.contactPersons || [],
      applicationDeadline: formatDateForInput(jobData.applicationDeadline),
      eligibilityCriteria: {
        departments: jobData.eligibilityCriteria.departments,
        minCGPA: jobData.eligibilityCriteria.minCGPA.toString(),
        otherRequirements: jobData.eligibilityCriteria.otherRequirements || '',
      },
      interviewProcess: jobData.interviewProcess.map((round: any) => ({
        id: round.id,
        name: round.name,
        description: round.description || '',
        status: round.status,
      })),
    },
  });

  // Watch for job type to conditionally render internship details
  const jobType = watch('jobType');
  const companyId = watch('companyId');

  // Field arrays for interview rounds
  const { fields: interviewFields, append: appendInterview, remove: removeInterview } = useFieldArray({
    control,
    name: 'interviewProcess',
  });

  // Get company contact persons for the selected company
  const selectedCompany = companies.find(c => c.id === companyId);
  const contactPersonOptions = selectedCompany?.contactPersons.map(person => ({
    value: person.id,
    label: `${person.name} (${person.designation})`,
  })) || [];

  // Set internship details if present in job data
  useEffect(() => {
    if (jobData.jobType === JobType.INTERNSHIP && jobData.internshipDetails) {
      setValue('internshipDetails.duration', jobData.internshipDetails.duration || '');
      setValue('internshipDetails.stipend', jobData.internshipDetails.stipend?.toString() || '');
    }
  }, [jobData, setValue]);

  const onSubmit = async (data: JobFormData) => {
    setIsSubmitting(true);
    
    // Format the data
    const updatedJobData = {
      ...jobData,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    // In a real app, make an API call to update the job
    console.log('Updated Job Data:', updatedJobData);
    
    // Simulate API delay
    setTimeout(() => {
      setIsSubmitting(false);
      router.push('/university/jobs');
    }, 1500);
  };

  return (
    <MainLayout title="Edit Job">
      <div className="space-y-6">
        {/* Back button */}
        <div>
          <Link href="/university/jobs">
            <Button 
              variant="outline" 
              size="sm" 
              leftIcon={<ArrowLeftIcon className="h-4 w-4" />}
            >
              Back to Jobs
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Edit Job: {jobData.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Basic Job Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <Input
                    label="Job Title"
                    placeholder="e.g. Software Engineer"
                    {...register('title')}
                    error={errors.title?.message}
                    fullWidth
                  />
                  
                  <Select
                    label="Company"
                    options={[
                      { value: '', label: 'Select a company', disabled: true },
                      ...companyOptions,
                    ]}
                    {...register('companyId')}
                    error={errors.companyId?.message}
                    fullWidth
                  />
                  
                  <Input
                    label="Location"
                    placeholder="e.g. San Francisco, CA"
                    {...register('location')}
                    error={errors.location?.message}
                    fullWidth
                  />
                  
                  <Select
                    label="Job Type"
                    options={[
                      { value: JobType.FULL_TIME, label: 'Full Time' },
                      { value: JobType.PART_TIME, label: 'Part Time' },
                      { value: JobType.INTERNSHIP, label: 'Internship' },
                      { value: JobType.CONTRACT, label: 'Contract' },
                    ]}
                    {...register('jobType')}
                    error={errors.jobType?.message}
                    fullWidth
                  />
                  
                  <Select
                    label="Status"
                    options={[
                      { value: JobStatus.DRAFT, label: 'Draft' },
                      { value: JobStatus.OPEN, label: 'Open' },
                      { value: JobStatus.IN_PROGRESS, label: 'In Progress' },
                      { value: JobStatus.COMPLETED, label: 'Completed' },
                      { value: JobStatus.CANCELLED, label: 'Cancelled' },
                    ]}
                    {...register('status')}
                    error={errors.status?.message}
                    fullWidth
                  />
                  
                  <Input
                    label="Application Deadline"
                    type="date"
                    {...register('applicationDeadline')}
                    error={errors.applicationDeadline?.message}
                    fullWidth
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Job Description
                    </label>
                    <textarea
                      rows={4}
                      className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-gray-900 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      placeholder="Provide a detailed description of the job..."
                      {...register('description')}
                    ></textarea>
                    {errors.description?.message && (
                      <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Requirements
                    </label>
                    <textarea
                      rows={4}
                      className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-gray-900 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      placeholder="List the requirements for this position..."
                      {...register('requirements')}
                    ></textarea>
                    {errors.requirements?.message && (
                      <p className="mt-1 text-xs text-red-500">{errors.requirements.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Responsibilities
                    </label>
                    <textarea
                      rows={4}
                      className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-gray-900 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      placeholder="List the responsibilities for this position..."
                      {...register('responsibilities')}
                    ></textarea>
                    {errors.responsibilities?.message && (
                      <p className="mt-1 text-xs text-red-500">{errors.responsibilities.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Compensation Details */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Compensation Details</h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <Input
                    label="Minimum CTC"
                    type="number"
                    min="0"
                    placeholder="e.g. 50000"
                    {...register('ctcRange.min')}
                    error={errors.ctcRange?.min?.message}
                    fullWidth
                  />
                  
                  <Input
                    label="Maximum CTC"
                    type="number"
                    min="0"
                    placeholder="e.g. 70000"
                    {...register('ctcRange.max')}
                    error={errors.ctcRange?.max?.message}
                    fullWidth
                  />
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      CTC Breakup (Optional)
                    </label>
                    <textarea
                      rows={2}
                      className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-gray-900 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      placeholder="e.g. Base: 80-100k, Bonus: 10-15k, Stock Options: 5-10k"
                      {...register('ctcBreakup')}
                    ></textarea>
                  </div>
                </div>

                {/* Internship Details (conditionally rendered) */}
                {jobType === JobType.INTERNSHIP && (
                  <div className="mt-4 rounded-md bg-blue-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">Internship Details</h3>
                        <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
                          <Input
                            label="Duration"
                            placeholder="e.g. 3 months, 6 months"
                            {...register('internshipDetails.duration')}
                            error={errors.internshipDetails?.duration?.message}
                            fullWidth
                          />
                          
                          <Input
                            label="Monthly Stipend"
                            type="number"
                            min="0"
                            placeholder="e.g. 1000"
                            {...register('internshipDetails.stipend')}
                            error={errors.internshipDetails?.stipend?.message}
                            fullWidth
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Eligibility Criteria */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Eligibility Criteria</h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Eligible Departments
                    </label>
                    <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                      {departmentOptions.map((option) => (
                        <div key={option.value} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`dept-${option.value}`}
                            value={option.value}
                            {...register('eligibilityCriteria.departments')}
                            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <label htmlFor={`dept-${option.value}`} className="ml-2 text-sm text-gray-700">
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                    {errors.eligibilityCriteria?.departments?.message && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.eligibilityCriteria.departments.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <Input
                      label="Minimum CGPA"
                      type="number"
                      min="0"
                      max="4"
                      step="0.1"
                      placeholder="e.g. 3.0"
                      {...register('eligibilityCriteria.minCGPA')}
                      error={errors.eligibilityCriteria?.minCGPA?.message}
                      fullWidth
                    />
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Other Requirements (Optional)
                      </label>
                      <textarea
                        rows={3}
                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-gray-900 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        placeholder="Any additional eligibility requirements..."
                        {...register('eligibilityCriteria.otherRequirements')}
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>

              {/* Job Details */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Job Details</h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <Input
                    label="Expected Hires"
                    type="number"
                    min="1"
                    {...register('expectedHires')}
                    error={errors.expectedHires?.message}
                    fullWidth
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Assign to Sub-Users (Optional)
                    </label>
                    <div className="mt-2 max-h-60 overflow-y-auto rounded border border-gray-300 p-2">
                      {subUsers.length > 0 ? (
                        subUsers.map((subUser) => (
                          <div key={subUser.id} className="flex items-center py-1">
                            <input
                              type="checkbox"
                              id={`subuser-${subUser.id}`}
                              value={subUser.id}
                              {...register('assignedUsers')}
                              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <label htmlFor={`subuser-${subUser.id}`} className="ml-2 text-sm text-gray-700">
                              {subUser.name} ({subUser.designation || 'Sub-User'})
                            </label>
                          </div>
                        ))
                      ) : (
                        <p className="py-2 text-sm text-gray-500">No sub-users available</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Company Contact Persons
                    </label>
                    {contactPersonOptions.length > 0 ? (
                      <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                        {contactPersonOptions.map((option) => (
                          <div key={option.value} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`contact-${option.value}`}
                              value={option.value}
                              {...register('contactPersons')}
                              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <label htmlFor={`contact-${option.value}`} className="ml-2 text-sm text-gray-700">
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-1 rounded-md bg-yellow-50 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                              Please ensure a company is selected to see available contact persons.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    {errors.contactPersons?.message && (
                      <p className="mt-1 text-xs text-red-500">{errors.contactPersons.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Interview Process */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Interview Process</h3>
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm"
                    leftIcon={<PlusIcon className="h-4 w-4" />}
                    onClick={() => appendInterview({
                      name: '',
                      description: '',
                      status: InterviewStatus.SCHEDULED,
                    })}
                  >
                    Add Round
                  </Button>
                </div>
                
                {interviewFields.map((field, index) => (
                  <div key={field.id} className="rounded-md border border-gray-300 p-4">
                    <div className="flex items-start justify-between">
                      <h4 className="text-sm font-medium text-gray-900">Round {index + 1}</h4>
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => removeInterview(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <MinusCircleIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                    <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                      <Input
                        label="Round Name"
                        placeholder="e.g. Technical Interview"
                        {...register(`interviewProcess.${index}.name`)}
                        error={errors.interviewProcess?.[index]?.name?.message}
                        fullWidth
                      />
                      
                      <Select
                        label="Status"
                        options={[
                          { value: InterviewStatus.SCHEDULED, label: 'Scheduled' },
                          { value: InterviewStatus.IN_PROGRESS, label: 'In Progress' },
                          { value: InterviewStatus.COMPLETED, label: 'Completed' },
                          { value: InterviewStatus.CANCELLED, label: 'Cancelled' },
                        ]}
                        {...register(`interviewProcess.${index}.status`)}
                        error={errors.interviewProcess?.[index]?.status?.message}
                        fullWidth
                      />
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Description (Optional)
                        </label>
                        <textarea
                          rows={2}
                          className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-gray-900 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                          placeholder="Describe what this round entails..."
                          {...register(`interviewProcess.${index}.description`)}
                        ></textarea>
                      </div>
                    </div>
                  </div>
                ))}
                {errors.interviewProcess?.message && (
                  <p className="text-xs text-red-500">{errors.interviewProcess.message}</p>
                )}
              </div>

              {/* Applications List (read-only) */}
              {jobData.applications.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Current Applications</h3>
                  <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
                    <p className="text-sm text-gray-600">
                      This job has {jobData.applications.length} applications. 
                      You can view and manage applications from the job details page.
                    </p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Link href="/university/jobs">
                  <Button variant="outline">Cancel</Button>
                </Link>
                <Button 
                  type="submit" 
                  isLoading={isSubmitting}
                  loadingText="Updating Job..."
                >
                  Update Job
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default EditJobPage;


