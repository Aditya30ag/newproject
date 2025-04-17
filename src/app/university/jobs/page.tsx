'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, JobStatus, JobType } from '@/types';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { jobs, companies, students } from '@/data/dummy-data';
import { formatCurrency, formatDate, getStatusColor, formatJobType } from '@/lib/utils';
import { 
  MagnifyingGlassIcon, 
  AdjustmentsHorizontalIcon, 
  PlusIcon,
  EyeIcon,
  PencilIcon,
  DocumentDuplicateIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import Modal from '@/components/ui/Modal';

const UniversityJobs: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    jobType: '',
    companyId: '',
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== UserRole.UNIVERSITY_ADMIN) {
      router.push('/login');
    }
  }, [isAuthenticated, router, user]);

  if (!user || user.role !== UserRole.UNIVERSITY_ADMIN || !user.universityId) {
    return null;
  }

  // Filter jobs for this university
  const universityJobs = jobs.filter(job => job.universityId === user.universityId);

  // Apply filters and search
  const filteredJobs = universityJobs.filter(job => {
    // Search term filter
    if (searchTerm && 
        !job.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !job.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Status filter
    if (filters.status && job.status !== filters.status) {
      return false;
    }
    
    // Job type filter
    if (filters.jobType && job.jobType !== filters.jobType) {
      return false;
    }
    
    // Company filter
    if (filters.companyId && job.companyId !== filters.companyId) {
      return false;
    }
    
    return true;
  });

  // Sort jobs by updated date (newest first)
  const sortedJobs = [...filteredJobs].sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  // Get unique companies for filter dropdown
  const uniqueCompanies = [...new Set(universityJobs.map(job => job.companyId))];
  const companyOptions = [
    { value: '', label: 'All Companies' },
    ...uniqueCompanies.map(companyId => {
      const company = companies.find(c => c.id === companyId);
      return {
        value: companyId,
        label: company?.name || 'Unknown Company',
      };
    }),
  ];

  // Status options for filter
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: JobStatus.DRAFT, label: 'Draft' },
    { value: JobStatus.OPEN, label: 'Open' },
    { value: JobStatus.IN_PROGRESS, label: 'In Progress' },
    { value: JobStatus.COMPLETED, label: 'Completed' },
    { value: JobStatus.CANCELLED, label: 'Cancelled' },
  ];

  // Job type options for filter
  const jobTypeOptions = [
    { value: '', label: 'All Types' },
    { value: JobType.FULL_TIME, label: 'Full Time' },
    { value: JobType.PART_TIME, label: 'Part Time' },
    { value: JobType.INTERNSHIP, label: 'Internship' },
    { value: JobType.CONTRACT, label: 'Contract' },
  ];

  // Handler for deleting a job
  const handleDeleteJob = (jobId: string) => {
    setJobToDelete(jobId);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteJob = () => {
    // In a real app, make an API call to delete the job
    console.log(`Deleting job with ID: ${jobToDelete}`);
    
    // Close modal and reset state
    setIsDeleteModalOpen(false);
    setJobToDelete(null);
    
    // Show success message (in a real app)
  };

  return (
    <MainLayout title="Manage Jobs">
      <div className="space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
          <Link href="/university/jobs/create">
            <Button leftIcon={<PlusIcon className="h-5 w-5" />}>
              Create New Job
            </Button>
          </Link>
        </div>

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
                  label="Status"
                  options={statusOptions}
                  value={filters.status}
                  onChange={(value) => setFilters({ ...filters, status: value })}
                  fullWidth
                />
                
                <Select
                  label="Job Type"
                  options={jobTypeOptions}
                  value={filters.jobType}
                  onChange={(value) => setFilters({ ...filters, jobType: value })}
                  fullWidth
                />
                
                <Select
                  label="Company"
                  options={companyOptions}
                  value={filters.companyId}
                  onChange={(value) => setFilters({ ...filters, companyId: value })}
                  fullWidth
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Jobs Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {sortedJobs.length} {sortedJobs.length === 1 ? 'Job' : 'Jobs'} Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applications</TableHead>
                    <TableHead>CTC Range</TableHead>
                    <TableHead>Posted On</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedJobs.map((job) => {
                    const company = companies.find(c => c.id === job.companyId);
                    return (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium">{job.title}</TableCell>
                        <TableCell>{company?.name}</TableCell>
                        <TableCell>{formatJobType(job.jobType)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(job.status)}>
                            {job.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>{job.applications.length}</TableCell>
                        <TableCell>
                          {formatCurrency(job.ctcRange.min)} - {formatCurrency(job.ctcRange.max)}
                        </TableCell>
                        <TableCell>{formatDate(job.createdAt, 'MMM dd, yyyy')}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Link href={`/university/jobs/${job.id}`}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <span className="sr-only">View</span>
                                <EyeIcon className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/university/jobs/${job.id}/edit`}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <span className="sr-only">Edit</span>
                                <PencilIcon className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/university/jobs/${job.id}/duplicate`}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <span className="sr-only">Duplicate</span>
                                <DocumentDuplicateIcon className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                              onClick={() => handleDeleteJob(job.id)}
                            >
                              <span className="sr-only">Delete</span>
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  
                  {sortedJobs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No jobs found matching your criteria
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Job"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete this job? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDeleteJob}>
              Delete Job
            </Button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
};

export default UniversityJobs;


