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
import { companies, jobs } from '@/data/dummy-data';
import { 
  MagnifyingGlassIcon, 
  AdjustmentsHorizontalIcon, 
  PlusIcon,
  EyeIcon,
  PencilIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';
import Modal from '@/components/ui/Modal';

const UniversityCompanies: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    industry: '',
    hasParticipated: '',
  });
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== UserRole.UNIVERSITY_ADMIN) {
      router.push('/login');
    }
  }, [isAuthenticated, router, user]);

  if (!user || user.role !== UserRole.UNIVERSITY_ADMIN || !user.universityId) {
    return null;
  }

  // Get companies that have participated in this university's placements
  const universityJobs = jobs.filter(job => job.universityId === user.universityId);
  const participatedCompanyIds = [...new Set(universityJobs.map(job => job.companyId))];
  const participatedCompanies = companies.filter(company => participatedCompanyIds.includes(company.id));
  
  // Filter companies
  const filteredCompanies = companies.filter(company => {
    // Search term filter
    if (searchTerm && 
        !company.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !company.industry.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Industry filter
    if (filters.industry && company.industry !== filters.industry) {
      return false;
    }
    
    // Participation filter
    if (filters.hasParticipated === 'yes' && !participatedCompanyIds.includes(company.id)) {
      return false;
    }
    if (filters.hasParticipated === 'no' && participatedCompanyIds.includes(company.id)) {
      return false;
    }
    
    return true;
  });

  // Sort companies alphabetically
  const sortedCompanies = [...filteredCompanies].sort((a, b) => 
    a.name.localeCompare(b.name)
  );

  // Get unique industries for filter dropdown
  const industries = [...new Set(companies.map(company => company.industry))];
  const industryOptions = [
    { value: '', label: 'All Industries' },
    ...industries.map(industry => ({ value: industry, label: industry })),
  ];

  // Participation filter options
  const participationOptions = [
    { value: '', label: 'All Companies' },
    { value: 'yes', label: 'Participated in Placements' },
    { value: 'no', label: 'Never Participated' },
  ];

  // Check if a company has participated
  const hasParticipated = (companyId: string) => participatedCompanyIds.includes(companyId);

  // Get jobs for a company
  const getCompanyJobs = (companyId: string) => {
    return universityJobs.filter(job => job.companyId === companyId).length;
  };

  // Get hiring stats for a company
  const getCompanyHiringStats = (companyId: string) => {
    const companyJobs = universityJobs.filter(job => job.companyId === companyId);
    const totalHires = companyJobs.reduce((sum, job) => sum + job.actualHires, 0);
    return totalHires;
  };

  // Handler for opening add contact modal
  const handleOpenAddContactModal = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setIsAddContactModalOpen(true);
  };

  return (
    <MainLayout title="Manage Companies">
      <div className="space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
          <Link href="/university/companies/create">
            <Button leftIcon={<PlusIcon className="h-5 w-5" />}>
              Add Company
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-stretch gap-4 md:flex-row md:items-end">
              <div className="flex-1">
                <Input
                  placeholder="Search by company name or industry..."
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
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <Select
                  label="Industry"
                  options={industryOptions}
                  value={filters.industry}
                  onChange={(value) => setFilters({ ...filters, industry: value })}
                  fullWidth
                />
                
                <Select
                  label="Participation Status"
                  options={participationOptions}
                  value={filters.hasParticipated}
                  onChange={(value) => setFilters({ ...filters, hasParticipated: value })}
                  fullWidth
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics Card */}
        <Card>
          <CardHeader>
            <CardTitle>Participation Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-sm font-medium text-blue-700">Total Companies</p>
                <p className="mt-1 text-2xl font-semibold text-blue-900">{companies.length}</p>
              </div>
              
              <div className="rounded-lg bg-green-50 p-4">
                <p className="text-sm font-medium text-green-700">Participating Companies</p>
                <p className="mt-1 text-2xl font-semibold text-green-900">{participatedCompanies.length}</p>
              </div>
              
              <div className="rounded-lg bg-purple-50 p-4">
                <p className="text-sm font-medium text-purple-700">Total Jobs Posted</p>
                <p className="mt-1 text-2xl font-semibold text-purple-900">{universityJobs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Companies Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {sortedCompanies.length} {sortedCompanies.length === 1 ? 'Company' : 'Companies'} Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead>Participated</TableHead>
                    <TableHead>Jobs Posted</TableHead>
                    <TableHead>Total Hires</TableHead>
                    <TableHead>Contact Persons</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedCompanies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-md">
                            {company.logo ? (
                              <img
                                src={company.logo}
                                alt={company.name}
                                className="h-full w-full object-contain"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center rounded-md bg-gray-100 text-sm font-medium text-gray-500">
                                {company.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <span className="ml-2">{company.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{company.industry}</TableCell>
                      <TableCell>
                        <a 
                          href={`https://${company.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-800"
                        >
                          {company.website}
                        </a>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          hasParticipated(company.id)
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {hasParticipated(company.id) ? 'Yes' : 'No'}
                        </span>
                      </TableCell>
                      <TableCell>{getCompanyJobs(company.id)}</TableCell>
                      <TableCell>{getCompanyHiringStats(company.id)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span className="mr-2">{company.contactPersons.length}</span>
                          <button
                            type="button"
                            onClick={() => handleOpenAddContactModal(company.id)}
                            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                          >
                            <UserPlusIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link href={`/university/companies/${company.id}`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <span className="sr-only">View</span>
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/university/companies/${company.id}/edit`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <span className="sr-only">Edit</span>
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {sortedCompanies.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No companies found matching your criteria
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Contact Person Modal */}
      <Modal 
        isOpen={isAddContactModalOpen} 
        onClose={() => setIsAddContactModalOpen(false)}
        title="Add Contact Person"
      >
        <div className="space-y-4">
          {selectedCompanyId && (
            <form className="space-y-4">
              <Input
                label="Contact Name"
                placeholder="Enter contact person's name"
                fullWidth
              />
              
              <Input
                label="Email Address"
                type="email"
                placeholder="Enter contact's email address"
                fullWidth
              />
              
              <Input
                label="Phone Number"
                placeholder="Enter contact's phone number"
                fullWidth
              />
              
              <Input
                label="Designation"
                placeholder="Enter contact's job title or designation"
                fullWidth
              />
              
              <div className="flex items-center">
                <input
                  id="isPrimary"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="isPrimary" className="ml-2 text-sm text-gray-700">
                  Set as primary contact
                </label>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddContactModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsAddContactModalOpen(false)}>
                  Add Contact
                </Button>
              </div>
            </form>
          )}
        </div>
      </Modal>
    </MainLayout>
  );
};

export default UniversityCompanies;


