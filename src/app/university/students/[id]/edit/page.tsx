'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, StudentPlacementStatus } from '@/types';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { students } from '@/data/dummy-data';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

// Student edit schema
const studentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  department: z.string().min(1, 'Department is required'),
  rollNumber: z.string().min(1, 'Roll number is required'),
  degree: z.string().min(1, 'Degree is required'),
  batch: z.string().min(1, 'Batch/Year is required'),
  cgpa: z.string().min(1, 'CGPA is required').transform(val => Number(val)),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  skills: z.string().optional().transform(val => 
    val ? val.split(',').map(skill => skill.trim()) : []
  ),
  placementStatus: z.nativeEnum(StudentPlacementStatus, {
    errorMap: () => ({ message: 'Please select a placement status' }),
  }),
  highestPackage: z.string().optional().transform(val => 
    val ? Number(val) : undefined
  ),
});

type StudentFormData = z.infer<typeof studentSchema>;

interface EditStudentPageProps {
  params: {
    id: string;
  };
}

const EditStudentPage: React.FC<EditStudentPageProps> = ({ params }) => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [studentData, setStudentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch student data
  useEffect(() => {
    if (!isAuthenticated || user?.role !== UserRole.UNIVERSITY_ADMIN) {
      router.push('/login');
      return;
    }

    // In a real app, this would be an API call
    const student = students.find(s => s.id === params.id);
    
    if (!student || student.universityId !== user.universityId) {
      router.push('/university/students');
      return;
    }

    setStudentData(student);
    setIsLoading(false);
  }, [isAuthenticated, router, user, params.id]);

  if (!user || user.role !== UserRole.UNIVERSITY_ADMIN || !user.universityId) {
    return null;
  }

  if (isLoading) {
    return (
      <MainLayout title="Edit Student">
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
          <p className="mt-2 text-gray-600">The student you're looking for doesn't exist or you don't have permission to edit their details.</p>
          <Link href="/university/students" className="mt-4">
            <Button leftIcon={<ArrowLeftIcon className="h-4 w-4" />}>Back to Students</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  // Format date for input fields
  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

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

  // Degree options
  const degreeOptions = [
    { value: 'B.Tech', label: 'B.Tech' },
    { value: 'M.Tech', label: 'M.Tech' },
    { value: 'BBA', label: 'BBA' },
    { value: 'MBA', label: 'MBA' },
    { value: 'B.Sc', label: 'B.Sc' },
    { value: 'M.Sc', label: 'M.Sc' },
    { value: 'Ph.D', label: 'Ph.D' },
  ];

  // Batch/Year options
  const batchOptions = [
    { value: '2020', label: '2020' },
    { value: '2021', label: '2021' },
    { value: '2022', label: '2022' },
    { value: '2023', label: '2023' },
    { value: '2024', label: '2024' },
    { value: '2025', label: '2025' },
  ];

  // Gender options
  const genderOptions = [
    { value: '', label: 'Select Gender', disabled: true },
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' },
    { value: 'Prefer not to say', label: 'Prefer not to say' },
  ];

  // Placement status options
  const placementStatusOptions = [
    { value: StudentPlacementStatus.NOT_APPLIED, label: 'Not Applied' },
    { value: StudentPlacementStatus.APPLIED, label: 'Applied' },
    { value: StudentPlacementStatus.INTERVIEW_PROCESS, label: 'In Interview Process' },
    { value: StudentPlacementStatus.OFFERED, label: 'Offered' },
    { value: StudentPlacementStatus.PLACED, label: 'Placed' },
    { value: StudentPlacementStatus.REJECTED, label: 'Rejected' },
  ];

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: studentData.name,
      email: studentData.email,
      phone: studentData.phone || '',
      department: studentData.department,
      rollNumber: studentData.rollNumber,
      degree: studentData.degree,
      batch: studentData.batch,
      cgpa: studentData.cgpa.toString(),
      dateOfBirth: formatDateForInput(studentData.dateOfBirth),
      gender: studentData.gender || '',
      skills: studentData.skills.join(', '),
      placementStatus: studentData.placementStatus,
      highestPackage: studentData.highestPackage?.toString() || '',
    },
  });

  const onSubmit = async (data: StudentFormData) => {
    setIsSubmitting(true);
    
    // Format the data
    const updatedStudentData = {
      ...studentData,
      ...data,
    };
    
    // In a real app, make an API call to update the student
    console.log('Updated Student Data:', updatedStudentData);
    
    // Simulate API delay
    setTimeout(() => {
      setIsSubmitting(false);
      router.push(`/university/students/${studentData.id}`);
    }, 1500);
  };

  return (
    <MainLayout title="Edit Student">
      <div className="space-y-6">
        {/* Back button */}
        <div className="flex items-center justify-between">
          <Link href={`/university/students/${studentData.id}`}>
            <Button 
              variant="outline" 
              size="sm" 
              leftIcon={<ArrowLeftIcon className="h-4 w-4" />}
            >
              Back to Student Details
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Edit Student: {studentData.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Personal Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <Input
                    label="Full Name"
                    placeholder="Enter student's full name"
                    {...register('name')}
                    error={errors.name?.message}
                    fullWidth
                  />
                  
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="Enter student's email address"
                    {...register('email')}
                    error={errors.email?.message}
                    fullWidth
                  />
                  
                  <Input
                    label="Phone Number"
                    placeholder="Enter student's phone number"
                    {...register('phone')}
                    error={errors.phone?.message}
                    fullWidth
                  />
                  
                  <Input
                    label="Date of Birth"
                    type="date"
                    {...register('dateOfBirth')}
                    error={errors.dateOfBirth?.message}
                    fullWidth
                  />
                  
                  <Select
                    label="Gender"
                    options={genderOptions}
                    {...register('gender')}
                    error={errors.gender?.message}
                    fullWidth
                  />
                </div>
              </div>

              {/* Academic Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Academic Information</h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <Input
                    label="Roll Number"
                    placeholder="Enter student's roll number"
                    {...register('rollNumber')}
                    error={errors.rollNumber?.message}
                    fullWidth
                  />
                  
                  <Select
                    label="Department"
                    options={departmentOptions}
                    {...register('department')}
                    error={errors.department?.message}
                    fullWidth
                  />
                  
                  <Select
                    label="Degree"
                    options={degreeOptions}
                    {...register('degree')}
                    error={errors.degree?.message}
                    fullWidth
                  />
                  
                  <Select
                    label="Batch/Year"
                    options={batchOptions}
                    {...register('batch')}
                    error={errors.batch?.message}
                    fullWidth
                  />
                  
                  <Input
                    label="CGPA"
                    type="number"
                    step="0.01"
                    min="0"
                    max="4"
                    placeholder="Enter student's CGPA"
                    {...register('cgpa')}
                    error={errors.cgpa?.message}
                    fullWidth
                  />
                </div>
              </div>

              {/* Skills and Placement */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Skills & Placement</h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Skills (comma separated)
                    </label>
                    <textarea
                      className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-gray-900 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      placeholder="e.g. JavaScript, React, Node.js, SQL, Python"
                      rows={3}
                      {...register('skills')}
                    ></textarea>
                    {errors.skills?.message && (
                      <p className="mt-1 text-xs text-red-500">{errors.skills.message}</p>
                    )}
                  </div>
                  
                  <Select
                    label="Placement Status"
                    options={placementStatusOptions}
                    {...register('placementStatus')}
                    error={errors.placementStatus?.message}
                    fullWidth
                  />
                  
                  <Input
                    label="Highest Package (if applicable)"
                    type="number"
                    placeholder="Enter highest package offered"
                    {...register('highestPackage')}
                    error={errors.highestPackage?.message}
                    fullWidth
                  />
                </div>
              </div>

              {/* Resume and Profile Picture - Read-only */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Documents</h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Resume
                    </label>
                    {studentData.resumeUrl ? (
                      <div className="mt-1 flex items-center justify-between rounded-md border border-gray-300 bg-gray-50 p-3">
                        <span className="text-sm text-gray-600">Resume on file</span>
                        <a 
                          href={studentData.resumeUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-sm font-medium text-primary-600 hover:text-primary-500"
                        >
                          View
                        </a>
                      </div>
                    ) : (
                      <div className="mt-1 rounded-md border border-gray-300 bg-gray-50 p-3">
                        <span className="text-sm text-gray-500">No resume uploaded</span>
                      </div>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Use the student profile page to upload or update resume.
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Profile Picture
                    </label>
                    <div className="mt-1 flex items-center">
                      <div className="h-16 w-16 overflow-hidden rounded-md">
                        {studentData.profilePicture ? (
                          <img
                            src={studentData.profilePicture}
                            alt={studentData.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gray-100 text-xl font-medium text-gray-500">
                            {studentData.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <span className="ml-4 text-sm text-gray-500">
                        Use the student profile page to update profile picture.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Link href={`/university/students/${studentData.id}`}>
                  <Button variant="outline">Cancel</Button>
                </Link>
                <Button 
                  type="submit" 
                  isLoading={isSubmitting}
                  loadingText="Updating Student..."
                >
                  Update Student
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default EditStudentPage;


