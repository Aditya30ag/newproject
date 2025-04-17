'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { users, jobs } from '@/data/dummy-data';
import { formatDate } from '@/lib/utils';
import { 
  MagnifyingGlassIcon, 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  KeyIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import Modal from '@/components/ui/Modal';

const UniversitySubUsers: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== UserRole.UNIVERSITY_ADMIN) {
      router.push('/login');
    }
  }, [isAuthenticated, router, user]);

  if (!user || user.role !== UserRole.UNIVERSITY_ADMIN || !user.universityId) {
    return null;
  }

  // Filter sub-users for this university
  const subUsers = users.filter(u => 
    u.role === UserRole.SUB_USER && u.universityId === user.universityId
  );

  // Apply search filter
  const filteredUsers = subUsers.filter(user => {
    if (!searchTerm) return true;
    
    return (
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.designation?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Sort users by name
  const sortedUsers = [...filteredUsers].sort((a, b) => 
    a.name.localeCompare(b.name)
  );

  // Get assigned jobs count for each user
  const getAssignedJobsCount = (userId: string) => {
    return jobs.filter(job => 
      job.universityId === user.universityId && 
      job.assignedUsers.includes(userId)
    ).length;
  };

  // Handlers for modals
  const handleDeleteUser = (userId: string) => {
    setSelectedUserId(userId);
    setIsDeleteModalOpen(true);
  };

  const handleResetPassword = (userId: string) => {
    setSelectedUserId(userId);
    setIsResetPasswordModalOpen(true);
  };

  const confirmDeleteUser = () => {
    // In a real app, make an API call to delete the user
    console.log(`Deleting user with ID: ${selectedUserId}`);
    
    // Close modal and reset state
    setIsDeleteModalOpen(false);
    setSelectedUserId(null);
  };

  const confirmResetPassword = () => {
    // In a real app, make an API call to reset the password
    console.log(`Resetting password for user with ID: ${selectedUserId}`);
    
    // Close modal and reset state
    setIsResetPasswordModalOpen(false);
    setSelectedUserId(null);
  };

  return (
    <MainLayout title="Manage Sub-Users">
      <div className="space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="text-2xl font-bold text-gray-900">Sub-Users</h1>
          <Button 
            leftIcon={<PlusIcon className="h-5 w-5" />}
            onClick={() => setIsAddUserModalOpen(true)}
          >
            Add Sub-User
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-6">
            <Input
              placeholder="Search by name, email, or designation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<MagnifyingGlassIcon className="h-5 w-5" />}
              fullWidth
            />
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {sortedUsers.length} {sortedUsers.length === 1 ? 'Sub-User' : 'Sub-Users'} Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Assigned Jobs</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedUsers.map((subUser) => (
                    <TableRow key={subUser.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full">
                            {subUser.avatar ? (
                              <img
                                src={subUser.avatar}
                                alt={subUser.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-500">
                                {subUser.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <span className="ml-2">{subUser.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{subUser.email}</TableCell>
                      <TableCell>
                        {subUser.designation || 'No designation'}
                      </TableCell>
                      <TableCell>{getAssignedJobsCount(subUser.id)}</TableCell>
                      <TableCell>
                        {subUser.lastLogin 
                          ? formatDate(subUser.lastLogin, 'MMM dd, yyyy') 
                          : 'Never logged in'}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          subUser.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {subUser.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link href={`/university/sub-users/${subUser.id}/edit`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <span className="sr-only">Edit</span>
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-amber-600"
                            onClick={() => handleResetPassword(subUser.id)}
                          >
                            <span className="sr-only">Reset Password</span>
                            <KeyIcon className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-red-600"
                            onClick={() => handleDeleteUser(subUser.id)}
                          >
                            <span className="sr-only">Delete</span>
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {sortedUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No sub-users found matching your criteria
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Sub-User Modal */}
      <Modal 
        isOpen={isAddUserModalOpen} 
        onClose={() => setIsAddUserModalOpen(false)}
        title="Add Sub-User"
      >
        <div className="space-y-4">
          <form className="space-y-4">
            <Input
              label="Full Name"
              placeholder="Enter full name"
              fullWidth
            />
            
            <Input
              label="Email Address"
              type="email"
              placeholder="Enter email address"
              fullWidth
            />
            
            <Input
              label="Phone Number"
              placeholder="Enter phone number"
              fullWidth
            />
            
            <Input
              label="Designation"
              placeholder="Enter job title or designation"
              fullWidth
            />
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Permissions
              </label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    id="perm-jobs"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="perm-jobs" className="ml-2 text-sm text-gray-700">
                    Manage Jobs
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="perm-applications"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="perm-applications" className="ml-2 text-sm text-gray-700">
                    Manage Applications
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="perm-interviews"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="perm-interviews" className="ml-2 text-sm text-gray-700">
                    Manage Interviews
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="perm-students"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="perm-students" className="ml-2 text-sm text-gray-700">
                    View Students
                  </label>
                </div>
              </div>
            </div>
            
            <div className="pt-2">
              <p className="mb-2 text-sm text-gray-500">A temporary password will be generated and sent to the user's email.</p>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddUserModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsAddUserModalOpen(false)}>
                  Add User
                </Button>
              </div>
            </div>
          </form>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Sub-User"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete this sub-user? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDeleteUser}>
              Delete User
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reset Password Modal */}
      <Modal 
        isOpen={isResetPasswordModalOpen} 
        onClose={() => setIsResetPasswordModalOpen(false)}
        title="Reset Password"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
              <KeyIcon className="h-6 w-6" />
            </div>
          </div>
          <p className="text-center text-gray-700">
            Are you sure you want to reset this user&apos;s password? A temporary password will be generated and sent to their email address.
          </p>
          <div className="flex justify-center space-x-3 pt-2">
            <Button variant="outline" onClick={() => setIsResetPasswordModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={confirmResetPassword}
              leftIcon={<ArrowPathIcon className="h-4 w-4" />}
            >
              Reset Password
            </Button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
};

export default UniversitySubUsers;


