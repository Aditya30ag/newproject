'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, JobType } from '@/types';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { jobs, companies, students } from '@/data/dummy-data';
import { formatCurrency, formatJobType } from '@/lib/utils';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

const StudentJobs: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    jobType: '',
    minCTC: '',
    department: '',
  });

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
      <MainLayout title="Available Jobs">
        <div className="flex h-full flex-col items-center justify-center text-center">
          <h2 className="text-xl font-semibold text-gray-700">Student profile not found</h2>
          <p className="mt-2 text-gray-600">Please contact your university administrator.</p>
        </div>
      </MainLayout>
    );
  }

  // Filter jobs for this student's university and eligibility
  const universityJobs = jobs.filter(job => 
    job.universityId === student.universityId && 
    job.status === 'OPEN' &&
    job.eligibilityCriteria.minCGPA <= student.cgpa
  );

  // Apply additional filters
  const filteredJobs = universityJobs.filter(job => {
    // Search term filter
    if (searchTerm && 
        !job.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !job.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Job type filter
    if (filters.jobType && job.jobType !== filters.jobType) {
      return false;
    }
    
    // Min CTC filter
    if (filters.minCTC && job.ctcRange.min < parseInt(filters.minCTC)) {
      return false;
    }
    
    // Department filter
    if (filters.department && !job.eligibilityCriteria.departments.includes(filters.department)) {
      return false;
    }
    
    return true;
  });

  // Check if student has already applied
  const hasApplied = (jobId: string) => student.appliedJobs.includes(jobId);

  // Get department options
  const departments = Array.from(new Set(universityJobs.flatMap(job => job.eligibilityCriteria.departments)));


  return (
    <MainLayout title="Available Jobs">
      <div className="space-y-6">
        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-stretch gap-4 md:flex-row md:items-end">
              <div className="flex-1">
                <Input
                  placeholder="Search for jobs by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<MagnifyingGlassIcon className="h-5 w-5" />}
                  fullWidth
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                leftIcon={<AdjustmentsHorizontalIcon className="h-5 w-5" />}
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
            </div>

            {showFilters && (
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <Select
                  label="Job Type"
                  options={[
                    { value: '', label: 'All Job Types' },
                    { value: JobType.FULL_TIME, label: 'Full Time' },
                    { value: JobType.PART_TIME, label: 'Part Time' },
                    { value: JobType.INTERNSHIP, label: 'Internship' },
                    { value: JobType.CONTRACT, label: 'Contract' },
                  ]}
                  value={filters.jobType}
                  onChange={(value) => setFilters({ ...filters, jobType: value })}
                  fullWidth
                />
                
                <Select
                  label="Minimum CTC"
                  options={[
                    { value: '', label: 'Any CTC' },
                    { value: '30000', label: '$30,000' },
                    { value: '50000', label: '$50,000' },
                    { value: '70000', label: '$70,000' },
                    { value: '90000', label: '$90,000' },
                    { value: '110000', label: '$110,000' },
                  ]}
                  value={filters.minCTC}
                  onChange={(value) => setFilters({ ...filters, minCTC: value })}
                  fullWidth
                />
                
                <Select
                  label="Department"
                  options={[
                    { value: '', label: 'All Departments' },
                    ...departments.map(dept => ({ value: dept, label: dept }))
                  ]}
                  value={filters.department}
                  onChange={(value) => setFilters({ ...filters, department: value })}
                  fullWidth
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Jobs List */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">
              {filteredJobs.length} {filteredJobs.length === 1 ? 'Job' : 'Jobs'} Available
            </h2>
            <div className="text-sm text-gray-500">
              Showing jobs matching your eligibility criteria
            </div>
          </div>

          {filteredJobs.length > 0 ? (
            <div className="space-y-4">
              {filteredJobs.map((job) => {
                const company = companies.find(c => c.id === job.companyId);
                const applied = hasApplied(job.id);
                
                return (
                  <Card key={job.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        {/* Company Logo */}
                        <div className="flex w-full items-center justify-center bg-gray-50 p-6 md:w-48 md:border-r md:border-gray-200">
                          <div className="h-16 w-16 overflow-hidden rounded-md">
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
                        </div>
                        
                        {/* Job Details */}
                        <div className="flex flex-1 flex-col p-6">
                          <div className="mb-4 flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">{job.title}</h3>
                              <p className="text-sm text-gray-600">{company?.name} • {job.location}</p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                  {formatJobType(job.jobType)}
                                </span>
                                <span className="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                  {formatCurrency(job.ctcRange.min)} - {formatCurrency(job.ctcRange.max)}
                                </span>
                                <span className="inline-flex rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                                  {job.eligibilityCriteria.departments.join(', ')}
                                </span>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">
                                Application Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          <p className="mb-4 text-sm text-gray-600 line-clamp-2">
                            {job.description}
                          </p>
                          
                          <div className="mt-auto flex justify-end">
                            <Link href={`/student/jobs/${job.id}`}>
                              <Button variant="outline" className="mr-2">View Details</Button>
                            </Link>
                            {applied ? (
                              <Button variant="secondary" disabled>Already Applied</Button>
                            ) : (
                              <Link href={`/student/jobs/${job.id}/apply`}>
                                <Button>Apply Now</Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-10 text-center">
                <div className="mb-4 rounded-full bg-gray-100 p-3">
                  <MagnifyingGlassIcon className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No matching jobs found</h3>
                <p className="mt-1 text-gray-500">
                  Try adjusting your search filters or check back later for new opportunities.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default StudentJobs;