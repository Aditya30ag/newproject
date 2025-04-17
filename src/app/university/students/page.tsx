'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, StudentPlacementStatus } from '@/types';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { students } from '@/data/dummy-data';
import { getStatusColor } from '@/lib/utils';
import { 
  MagnifyingGlassIcon, 
  AdjustmentsHorizontalIcon, 
  PlusIcon,
  EyeIcon,
  PencilIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import Modal from '@/components/ui/Modal';

const UniversityStudents: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    department: '',
    batch: '',
    placementStatus: '',
  });
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== UserRole.UNIVERSITY_ADMIN) {
      router.push('/login');
    }
  }, [isAuthenticated, router, user]);

  if (!user || user.role !== UserRole.UNIVERSITY_ADMIN || !user.universityId) {
    return null;
  }

  // Filter students for this university
  const universityStudents = students.filter(student => student.universityId === user.universityId);

  // Apply filters and search
  const filteredStudents = universityStudents.filter(student => {
    // Search term filter
    if (searchTerm && 
        !student.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !student.email.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Department filter
    if (filters.department && student.department !== filters.department) {
      return false;
    }
    
    // Batch filter
    if (filters.batch && student.batch !== filters.batch) {
      return false;
    }
    
    // Placement status filter
    if (filters.placementStatus && student.placementStatus !== filters.placementStatus) {
      return false;
    }
    
    return true;
  });

  // Sort students by name
  const sortedStudents = [...filteredStudents].sort((a, b) => 
    a.name.localeCompare(b.name)
  );

  // Get unique departments for filter dropdown
  const departments = Array.from(new Set(universityStudents.map(student => student.department)));
  const departmentOptions = [
    { value: '', label: 'All Departments' },
    ...departments.map(dept => ({ value: dept, label: dept })),
  ];
  
  // Get unique batches for filter dropdown
  const batches = Array.from(new Set(universityStudents.map(student => student.batch)));
  
  const batchOptions = [
    { value: '', label: 'All Batches' },
    ...batches.map(batch => ({ value: batch, label: batch })),
  ];

  // Placement status options for filter
  const placementStatusOptions = [
    { value: '', label: 'All Statuses' },
    { value: StudentPlacementStatus.NOT_APPLIED, label: 'Not Applied' },
    { value: StudentPlacementStatus.APPLIED, label: 'Applied' },
    { value: StudentPlacementStatus.INTERVIEW_PROCESS, label: 'In Interview Process' },
    { value: StudentPlacementStatus.OFFERED, label: 'Offered' },
    { value: StudentPlacementStatus.PLACED, label: 'Placed' },
    { value: StudentPlacementStatus.REJECTED, label: 'Rejected' },
  ];

  // Handler for CSV import
  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, process the CSV file here
      console.log(`Importing CSV file: ${file.name}`);
      
      // Close modal after processing
      setTimeout(() => {
        setIsImportModalOpen(false);
      }, 1000);
    }
  };

  // Handler for CSV export
  const handleExportCSV = () => {
    // In a real app, generate and download a CSV file with student data
    console.log('Exporting student data to CSV');
    
    // Simulate CSV download
    const csvContent = 'data:text/csv;charset=utf-8,Name,Email,Department,Batch,CGPA,Placement Status\n';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'students.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <MainLayout title="Manage Students">
      <div className="space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              leftIcon={<ArrowDownTrayIcon className="h-5 w-5" />}
              onClick={handleExportCSV}
            >
              Export CSV
            </Button>
            <Button 
              variant="outline" 
              leftIcon={<ArrowUpTrayIcon className="h-5 w-5" />}
              onClick={() => setIsImportModalOpen(true)}
            >
              Import CSV
            </Button>
            <Link href="/university/students/create">
              <Button leftIcon={<PlusIcon className="h-5 w-5" />}>
                Add Student
              </Button>
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-stretch gap-4 md:flex-row md:items-end">
              <div className="flex-1">
                <Input
                  placeholder="Search by name, email, or roll number..."
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
                  label="Department"
                  options={departmentOptions}
                  value={filters.department}
                  onChange={(value) => setFilters({ ...filters, department: value })}
                  fullWidth
                />
                
                <Select
                  label="Batch"
                  options={batchOptions}
                  value={filters.batch}
                  onChange={(value) => setFilters({ ...filters, batch: value })}
                  fullWidth
                />
                
                <Select
                  label="Placement Status"
                  options={placementStatusOptions}
                  value={filters.placementStatus}
                  onChange={(value) => setFilters({ ...filters, placementStatus: value })}
                  fullWidth
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics Card */}
        <Card>
          <CardHeader>
            <CardTitle>Student Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-sm font-medium text-blue-700">Total Students</p>
                <p className="mt-1 text-2xl font-semibold text-blue-900">{universityStudents.length}</p>
              </div>
              
              <div className="rounded-lg bg-green-50 p-4">
                <p className="text-sm font-medium text-green-700">Placed</p>
                <p className="mt-1 text-2xl font-semibold text-green-900">
                  {universityStudents.filter(s => s.placementStatus === StudentPlacementStatus.PLACED).length}
                </p>
              </div>
              
              <div className="rounded-lg bg-purple-50 p-4">
                <p className="text-sm font-medium text-purple-700">Offered</p>
                <p className="mt-1 text-2xl font-semibold text-purple-900">
                  {universityStudents.filter(s => s.placementStatus === StudentPlacementStatus.OFFERED).length}
                </p>
              </div>
              
              <div className="rounded-lg bg-yellow-50 p-4">
                <p className="text-sm font-medium text-yellow-700">In Process</p>
                <p className="mt-1 text-2xl font-semibold text-yellow-900">
                  {universityStudents.filter(s => s.placementStatus === StudentPlacementStatus.INTERVIEW_PROCESS).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {sortedStudents.length} {sortedStudents.length === 1 ? 'Student' : 'Students'} Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Roll Number</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>CGPA</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applications</TableHead>
                    <TableHead>Offers</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full">
                            {student.profilePicture ? (
                              <img
                                src={student.profilePicture}
                                alt={student.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-500">
                                {student.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            <div className="text-xs text-gray-500">{student.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{student.rollNumber}</TableCell>
                      <TableCell>{student.department}</TableCell>
                      <TableCell>{student.batch}</TableCell>
                      <TableCell>{student.cgpa}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(student.placementStatus)}>
                          {student.placementStatus.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{student.appliedJobs.length}</TableCell>
                      <TableCell>{student.offeredJobs.length}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link href={`/university/students/${student.id}`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <span className="sr-only">View</span>
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/university/students/${student.id}/edit`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <span className="sr-only">Edit</span>
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {sortedStudents.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="h-24 text-center">
                        No students found matching your criteria
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Import CSV Modal */}
      <Modal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)}
        title="Import Students"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Upload a CSV file containing student information. The CSV should have the following columns:
          </p>
          <ul className="list-inside list-disc space-y-1 text-sm text-gray-600">
            <li>Name (required)</li>
            <li>Email (required)</li>
            <li>Roll Number (required)</li>
            <li>Department (required)</li>
            <li>Batch/Year (required)</li>
            <li>CGPA (required)</li>
            <li>Phone (optional)</li>
            <li>Gender (optional)</li>
            <li>Date of Birth (optional, format: YYYY-MM-DD)</li>
          </ul>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">
              Upload CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-gray-900 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsImportModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              leftIcon={<ArrowUpTrayIcon className="h-5 w-5" />}
              onClick={() => document.getElementById('fileInput')?.click()}
            >
              Upload CSV
            </Button>
            <input
              id="fileInput"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleImportCSV}
            />
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
};

export default UniversityStudents;


