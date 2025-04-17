'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, ApplicationStatus, InterviewStatus } from '@/types';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { jobs, companies, students } from '@/data/dummy-data';
import { formatDate, formatCurrency, getStatusColor, formatJobType } from '@/lib/utils';
import { 
  ArrowLeftIcon,
  CalendarIcon,
  ClipboardDocumentCheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PaperAirplaneIcon,
  StarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import Modal from '@/components/ui/Modal';

interface SubUserJobDetailPageProps {
  params: {
    id: string;
  };
}

const SubUserJobDetailPage: React.FC<SubUserJobDetailPageProps> = ({ params }) => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [jobData, setJobData] = useState<any>(null);
  const [companyData, setCompanyData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('applications');
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [selectedRound, setSelectedRound] = useState<any>(null);

  // Fetch job data
  useEffect(() => {
    if (!isAuthenticated || user?.role !== UserRole.SUB_USER) {
      router.push('/login');
      return;
    }

    // In a real app, this would be an API call
    const job = jobs.find(j => j.id === params.id);
    
    if (!job || !job.assignedUsers.includes(user.id)) {
      router.push('/sub-user/jobs');
      return;
    }

    setJobData(job);
    
    // Get company data
    const company = companies.find(c => c.id === job.companyId);
    setCompanyData(company);
    
    setIsLoading(false);
  }, [isAuthenticated, router, user, params.id]);

  if (!user || user.role !== UserRole.SUB_USER) {
    return null;
  }

  if (isLoading) {
    return (
      <MainLayout title="Job Details">
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
          <p className="mt-2 text-gray-600">The job you're looking for doesn't exist or you don't have permission to view it.</p>
          <Link href="/sub-user/jobs" className="mt-4">
            <Button leftIcon={<ArrowLeftIcon className="h-4 w-4" />}>Back to Jobs</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  // Prepare application data with student info
  const applications = jobData.applications.map((app: any) => {
    const student = students.find(s => s.id === app.studentId);
    return {
      ...app,
      student: student || { name: 'Unknown Student', email: 'unknown@example.com' },
    };
  });

  // Get next interview round for an application
  const getNextInterviewRound = (application: any) => {
    const completedRounds = application.interviewFeedback 
      ? application.interviewFeedback.map((feedback: any) => feedback.roundId)
      : [];
    
    const pendingRounds = jobData.interviewProcess.filter(
      (round: any) => !completedRounds.includes(round.id) && 
                      round.status !== InterviewStatus.CANCELLED
    );
    
    return pendingRounds.length > 0 ? pendingRounds[0] : null;
  };

  // Handle scheduling an interview
  const handleScheduleInterview = (application: any) => {
    const nextRound = getNextInterviewRound(application);
    if (nextRound) {
      setSelectedApplication(application);
      setSelectedRound(nextRound);
      setShowInterviewModal(true);
    }
  };

  // Handle providing feedback
  const handleProvideFeedback = (application: any, round: any) => {
    setSelectedApplication(application);
    setSelectedRound(round);
    setShowFeedbackModal(true);
  };

  // Update application status
  const updateApplicationStatus = (applicationId: string, newStatus: ApplicationStatus) => {
    // In a real app, this would be an API call
    console.log(`Updating application ${applicationId} to status ${newStatus}`);
    
    // Simulate updating the application status
    const updatedApplications = jobData.applications.map((app: any) => {
      if (app.id === applicationId) {
        return { ...app, status: newStatus };
      }
      return app;
    });
    
    setJobData({ ...jobData, applications: updatedApplications });
  };

  return (
    <MainLayout title="Manage Job">
      <div className="space-y-6">
        {/* Back button */}
        <div>
          <Link href="/sub-user/jobs">
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
            <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start">
                <div className="mr-4 h-16 w-16 overflow-hidden rounded-lg bg-gray-100">
                  {companyData?.logo ? (
                    <img 
                      src={companyData.logo} 
                      alt={companyData.name} 
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-200 text-xl font-bold text-gray-500">
                      {companyData?.name.charAt(0) || '?'}
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{jobData.title}</h1>
                  <p className="mt-1 text-gray-600">{companyData?.name} • {jobData.location}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge className={getStatusColor(jobData.status)}>
                      {jobData.status.replace('_', ' ')}
                    </Badge>
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                      {formatJobType(jobData.jobType)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={activeTab === 'applications' ? 'primary' : 'outline'}
                  onClick={() => setActiveTab('applications')}
                  leftIcon={<ClipboardDocumentCheckIcon className="h-5 w-5" />}
                >
                  Applications ({applications.length})
                </Button>
                <Button
                  variant={activeTab === 'interviews' ? 'primary' : 'outline'}
                  onClick={() => setActiveTab('interviews')}
                  leftIcon={<CalendarIcon className="h-5 w-5" />}
                >
                  Interviews
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <Card>
            <CardHeader>
              <CardTitle>Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Applied On</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Next Step</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.length > 0 ? (
                      applications.map((application: any) => {
                        const nextRound = getNextInterviewRound(application);
                        return (
                          <TableRow key={application.id}>
                            <TableCell>
                              <div className="flex items-center">
                                <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full">
                                  {application.student.profilePicture ? (
                                    <img
                                      src={application.student.profilePicture}
                                      alt={application.student.name}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-500">
                                      {application.student.name.charAt(0)}
                                    </div>
                                  )}
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900">{application.student.name}</div>
                                  <div className="text-xs text-gray-500">{application.student.email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(application.status)}>
                                {application.status.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {formatDate(application.appliedDate, 'MMM dd, yyyy')}
                            </TableCell>
                            <TableCell>
                              {application.interviewFeedback && application.interviewFeedback.length > 0 
                                ? formatDate(application.interviewFeedback[application.interviewFeedback.length - 1].interviewDate, 'MMM dd, yyyy')
                                : formatDate(application.appliedDate, 'MMM dd, yyyy')}
                            </TableCell>
                            <TableCell>
                              {application.status === ApplicationStatus.REJECTED || 
                               application.status === ApplicationStatus.WITHDRAWN ? (
                                <span className="text-gray-500">No next steps</span>
                              ) : application.status === ApplicationStatus.OFFERED ? (
                                <span className="text-green-600">Offer made</span>
                              ) : application.status === ApplicationStatus.ACCEPTED ? (
                                <span className="text-green-600">Offer accepted</span>
                              ) : nextRound ? (
                                <span>{nextRound.name}</span>
                              ) : (
                                <span className="text-gray-500">Process complete</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end space-x-2">
                                {(application.status === ApplicationStatus.APPLIED || 
                                  application.status === ApplicationStatus.SHORTLISTED) && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateApplicationStatus(application.id, ApplicationStatus.INTERVIEW)}
                                  >
                                    Move to Interview
                                  </Button>
                                )}
                                
                                {application.status === ApplicationStatus.INTERVIEW && nextRound && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleScheduleInterview(application)}
                                  >
                                    Schedule Interview
                                  </Button>
                                )}
                                
                                {application.status === ApplicationStatus.INTERVIEW && 
                                 application.interviewFeedback && 
                                 application.interviewFeedback.length > 0 && (
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => updateApplicationStatus(application.id, ApplicationStatus.OFFERED)}
                                  >
                                    Make Offer
                                  </Button>
                                )}
                                
                                <Button
                                  variant="outline"
                                  size="sm"
                                >
                                  View Details
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No applications found for this job
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Interviews Tab */}
        {activeTab === 'interviews' && (
          <div className="space-y-6">
            {jobData.interviewProcess.map((round: any, index: number) => {
              // Get applications that have completed this round
              const completedApplications = applications.filter((app: any) => 
                app.interviewFeedback && app.interviewFeedback.some((feedback: any) => feedback.roundId === round.id)
              );
              
              // Get applications that need to complete this round
              const pendingApplications = applications.filter((app: any) => {
                if (app.status !== ApplicationStatus.INTERVIEW) return false;
                if (!app.interviewFeedback) return index === 0;
                const completedRounds = app.interviewFeedback.map((feedback: any) => feedback.roundId);
                const previousRoundCompleted = index === 0 || completedRounds.includes(jobData.interviewProcess[index - 1].id);
                return previousRoundCompleted && !completedRounds.includes(round.id);
              });

              return (
                <Card key={round.id}>
                  <CardHeader>
                    <CardTitle>Round {index + 1}: {round.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Badge className={getStatusColor(round.status)}>
                          {round.status.replace('_', ' ')}
                        </Badge>
                        <span className="ml-2 text-sm text-gray-600">
                          {completedApplications.length} completed, {pendingApplications.length} pending
                        </span>
                      </div>
                      {round.description && (
                        <p className="text-sm italic text-gray-600">{round.description}</p>
                      )}
                    </div>

                    {/* Pending Applications */}
                    {pendingApplications.length > 0 && (
                      <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-yellow-800">Pending Interviews</h4>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {/* Bulk schedule functionality */}}
                          >
                            Schedule All
                          </Button>
                        </div>
                        <div className="mt-3 space-y-2">
                          {pendingApplications.map((app: any) => (
                            <div key={app.id} className="flex items-center justify-between rounded-md bg-white p-2">
                              <div className="flex items-center">
                                <div className="h-6 w-6 flex-shrink-0 overflow-hidden rounded-full">
                                  {app.student.profilePicture ? (
                                    <img
                                      src={app.student.profilePicture}
                                      alt={app.student.name}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-500">
                                      {app.student.name.charAt(0)}
                                    </div>
                                  )}
                                </div>
                                <span className="ml-2 text-sm font-medium">{app.student.name}</span>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleScheduleInterview(app)}
                              >
                                Schedule
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Completed Applications */}
                    {completedApplications.length > 0 && (
                      <div className="rounded-md border border-green-200 bg-green-50 p-4">
                        <h4 className="text-sm font-medium text-green-800">Completed Interviews</h4>
                        <div className="mt-3 space-y-2">
                          {completedApplications.map((app: any) => {
                            const feedback = app.interviewFeedback.find((f: any) => f.roundId === round.id);
                            return (
                              <div key={app.id} className="flex items-center justify-between rounded-md bg-white p-2">
                                <div className="flex items-center">
                                  <div className="h-6 w-6 flex-shrink-0 overflow-hidden rounded-full">
                                    {app.student.profilePicture ? (
                                      <img
                                        src={app.student.profilePicture}
                                        alt={app.student.name}
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-500">
                                        {app.student.name.charAt(0)}
                                      </div>
                                    )}
                                  </div>
                                  <div className="ml-2">
                                    <span className="text-sm font-medium">{app.student.name}</span>
                                    <div className="flex items-center">
                                      <span className={`text-xs ${
                                        feedback.status === 'PASS' ? 'text-green-600' : 
                                        feedback.status === 'FAIL' ? 'text-red-600' : 'text-amber-600'
                                      }`}>
                                        {feedback.status}
                                      </span>
                                      <div className="ml-2 flex">
                                        {[...Array(5)].map((_, i) => (
                                          <StarIcon 
                                            key={i}
                                            className={`h-3 w-3 ${
                                              i < feedback.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                                            }`}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleProvideFeedback(app, round)}
                                >
                                  View Feedback
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Schedule Interview Modal */}
      <Modal 
        isOpen={showInterviewModal} 
        onClose={() => setShowInterviewModal(false)}
        title={`Schedule ${selectedRound?.name}`}
      >
        {selectedApplication && selectedRound && (
          <div className="space-y-4">
            <div className="mb-4 rounded-md bg-blue-50 p-3">
              <div className="flex items-center">
                <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full">
                  {selectedApplication.student.profilePicture ? (
                    <img
                      src={selectedApplication.student.profilePicture}
                      alt={selectedApplication.student.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-500">
                      {selectedApplication.student.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-800">{selectedApplication.student.name}</p>
                  <p className="text-xs text-blue-600">{selectedApplication.student.email}</p>
                </div>
              </div>
            </div>
            
            <form className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Interview Date
                  </label>
                  <input
                    type="date"
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Interview Time
                  </label>
                  <input
                    type="time"
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Interview Type
                </label>
                <div className="mt-1 flex space-x-4">
                  <div className="flex items-center">
                    <input
                      id="interview-type-offline"
                      type="radio"
                      name="interview-type"
                      className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                      defaultChecked
                    />
                    <label htmlFor="interview-type-offline" className="ml-2 text-sm text-gray-700">
                      In-Person
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="interview-type-online"
                      type="radio"
                      name="interview-type"
                      className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="interview-type-online" className="ml-2 text-sm text-gray-700">
                      Online
                    </label>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Location / Meeting Link
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Enter location or meeting link"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Interviewers
                </label>
                <select
                  multiple
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  {companyData?.contactPersons.map((person: any) => (
                    <option key={person.id} value={person.id}>
                      {person.name} ({person.designation})
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Hold Ctrl (CMD on Mac) to select multiple interviewers
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Additional Notes
                </label>
                <textarea
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Any additional instructions for the candidate"
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={() => setShowInterviewModal(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    // Here you would save the interview details
                    setShowInterviewModal(false);
                  }}
                  leftIcon={<CalendarIcon className="h-4 w-4" />}
                >
                  Schedule Interview
                </Button>
              </div>
            </form>
          </div>
        )}
      </Modal>

      {/* Interview Feedback Modal */}
      <Modal 
        isOpen={showFeedbackModal} 
        onClose={() => setShowFeedbackModal(false)}
        title="Interview Feedback"
      >
        {selectedApplication && selectedRound && (
          <div className="space-y-4">
            <div className="mb-4 rounded-md bg-blue-50 p-3">
              <div className="flex items-center">
                <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full">
                  {selectedApplication.student.profilePicture ? (
                    <img
                      src={selectedApplication.student.profilePicture}
                      alt={selectedApplication.student.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-500">
                      {selectedApplication.student.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-800">{selectedApplication.student.name}</p>
                  <div className="flex items-center text-xs text-blue-600">
                    <CalendarIcon className="mr-1 h-3 w-3" />
                    <span>{selectedRound.name}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {selectedApplication.interviewFeedback && selectedApplication.interviewFeedback.some((f: any) => f.roundId === selectedRound.id) ? (
              // Display existing feedback
              (() => {
                const feedback = selectedApplication.interviewFeedback.find((f: any) => f.roundId === selectedRound.id);
                return (
                  <div className="space-y-4 rounded-md border border-gray-200 p-4">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Interviewer</p>
                        <p className="text-sm text-gray-900">{feedback.interviewerName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Date</p>
                        <p className="text-sm text-gray-900">{formatDate(feedback.interviewDate, 'MMMM dd, yyyy')}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Result</p>
                        <p className={`text-sm font-medium ${
                          feedback.status === 'PASS' ? 'text-green-600' : 
                          feedback.status === 'FAIL' ? 'text-red-600' : 'text-amber-600'
                        }`}>
                          {feedback.status}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700">Rating</p>
                      <div className="mt-1 flex">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon 
                            key={i}
                            className={`h-5 w-5 ${
                              i < feedback.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700">Feedback</p>
                      <p className="mt-1 whitespace-pre-line text-sm text-gray-900">{feedback.feedback}</p>
                    </div>
                    
                    <div className="pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setShowFeedbackModal(false)}
                        fullWidth
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                );
              })()
            ) : (
              // Provide new feedback form
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Interviewer
                  </label>
                  <select
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="">Select Interviewer</option>
                    {companyData?.contactPersons.map((person: any) => (
                      <option key={person.id} value={person.id}>
                        {person.name} ({person.designation})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Interview Date
                  </label>
                  <input
                    type="date"
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Rating (1-5)
                  </label>
                  <div className="mt-1 flex">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        className="mr-1 p-1"
                      >
                        <StarIcon className="h-6 w-6 text-gray-300 hover:text-amber-400" />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Result
                  </label>
                  <div className="mt-1 flex space-x-4">
                    <div className="flex items-center">
                      <input
                        id="result-pass"
                        type="radio"
                        name="interview-result"
                        value="PASS"
                        className="h-4 w-4 border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <label htmlFor="result-pass" className="ml-2 text-sm text-green-700">
                        Pass
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="result-hold"
                        type="radio"
                        name="interview-result"
                        value="ON_HOLD"
                        className="h-4 w-4 border-gray-300 text-amber-600 focus:ring-amber-500"
                      />
                      <label htmlFor="result-hold" className="ml-2 text-sm text-amber-700">
                        On Hold
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="result-fail"
                        type="radio"
                        name="interview-result"
                        value="FAIL"
                        className="h-4 w-4 border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <label htmlFor="result-fail" className="ml-2 text-sm text-red-700">
                        Fail
                      </label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Feedback
                  </label>
                  <textarea
                    rows={4}
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Provide detailed feedback about the candidate's performance"
                  ></textarea>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button variant="outline" onClick={() => setShowFeedbackModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      // Here you would save the feedback
                      setShowFeedbackModal(false);
                    }}
                    leftIcon={<PaperAirplaneIcon className="h-4 w-4" />}
                  >
                    Submit Feedback
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </Modal>
    </MainLayout>
  );
};

export default SubUserJobDetailPage;




