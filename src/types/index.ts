// User Roles
export enum UserRole {
    SUPER_ADMIN = 'SUPER_ADMIN',
    UNIVERSITY_ADMIN = 'UNIVERSITY_ADMIN',
    SUB_USER = 'SUB_USER',
    STUDENT = 'STUDENT'
  }
  
  // User Interface
  export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    universityId?: string; // For university admins and sub-users
    createdAt: string;
    lastLogin?: string;
    avatar?: string;
    isActive: boolean;
    permissions?: string[];
    phone?: string;
    designation?: string;
  }
  
  // University Interface
  export interface University {
    id: string;
    name: string;
    code: string;
    location: string;
    address: string;
    website: string;
    contactPerson: string;
    contactEmail: string;
    contactPhone: string;
    logo?: string;
    createdAt: string;
    isActive: boolean;
    departments: string[];
    totalStudents: number;
    totalPlacements: number;
    totalCompanies: number;
  }
  
  // Student Interface
  export interface Student {
    id: string;
    name: string;
    email: string;
    phone: string;
    universityId: string;
    university?: string;
    department: string;
    rollNumber: string;
    degree: string;
    batch: string;
    cgpa: number;
    resumeUrl?: string;
    profilePicture?: string;
    dateOfBirth?: string;
    gender?: string;
    skills: string[];
    placementStatus: StudentPlacementStatus;
    highestPackage?: number;
    appliedJobs: string[];
    offeredJobs: string[];
    isActive: boolean;
    createdAt: string;
  }
  
  export enum StudentPlacementStatus {
    NOT_APPLIED = 'NOT_APPLIED',
    APPLIED = 'APPLIED',
    INTERVIEW_PROCESS = 'INTERVIEW_PROCESS',
    OFFERED = 'OFFERED',
    PLACED = 'PLACED',
    REJECTED = 'REJECTED'
  }
  
  // Company Interface
  export interface Company {
    id: string;
    name: string;
    industry: string;
    website: string;
    logo?: string;
    description: string;
    address: string;
    contactPersons: ContactPerson[];
    participationHistory: CompanyParticipation[];
    createdAt: string;
    isActive: boolean;
  }
  
  export interface ContactPerson {
    id: string;
    name: string;
    email: string;
    phone: string;
    designation: string;
    isPrimary: boolean;
  }
  
  export interface CompanyParticipation {
    year: string;
    universityId: string;
    jobsPosted: number;
    studentsHired: number;
    highestPackage: number;
    averagePackage: number;
  }
  
  // Job Interface
  export enum JobStatus {
    DRAFT = 'DRAFT',
    OPEN = 'OPEN',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
  }
  
  export enum JobType {
    FULL_TIME = 'FULL_TIME',
    PART_TIME = 'PART_TIME',
    INTERNSHIP = 'INTERNSHIP',
    CONTRACT = 'CONTRACT'
  }
  
  export interface Job {
    id: string;
    title: string;
    companyId: string;
    company?: Company;
    universityId: string;
    university?: University;
    description: string;
    requirements: string;
    responsibilities: string;
    location: string;
    jobType: JobType;
    status: JobStatus;
    ctcRange: {
      min: number;
      max: number;
    };
    ctcBreakup?: string;
    internshipDetails?: {
      duration: string;
      stipend: number;
    };
    expectedHires: number;
    actualHires: number;
    assignedUsers: string[]; // sub-user IDs
    contactPersons: string[]; // company contact IDs
    documents: {
      name: string;
      url: string;
      type: string;
    }[];
    applicationDeadline: string;
    eligibilityCriteria: {
      departments: string[];
      minCGPA: number;
      otherRequirements?: string;
    };
    interviewProcess: InterviewRound[];
    applications: JobApplication[];
    createdAt: string;
    updatedAt: string;
    createdBy: string;
  }
  
  // Interview Round Interface
  export enum InterviewStatus {
    SCHEDULED = 'SCHEDULED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
  }
  
  export interface InterviewRound {
    id: string;
    name: string;
    description?: string;
    date?: string;
    location?: string;
    online?: boolean;
    meetingLink?: string;
    status: InterviewStatus;
    interviewers?: ContactPerson[];
  }
  
  // Job Application Interface
  export enum ApplicationStatus {
    APPLIED = 'APPLIED',
    SHORTLISTED = 'SHORTLISTED',
    INTERVIEW = 'INTERVIEW',
    OFFERED = 'OFFERED',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
    WITHDRAWN = 'WITHDRAWN'
  }
  
  export interface JobApplication {
    id: string;
    jobId: string;
    studentId: string;
    student?: Student;
    status: ApplicationStatus;
    appliedDate: string;
    resume: string;
    coverLetter?: string;
    interviewFeedback: InterviewFeedback[];
    offer?: {
      ctc: number;
      offerDate: string;
      joiningDate?: string;
      offerLetterUrl?: string;
      status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    };
    rejectionReason?: string;
  }
  
  export interface InterviewFeedback {
    roundId: string;
    feedback: string;
    rating: number; // 1-5
    status: 'PASS' | 'FAIL' | 'ON_HOLD';
    interviewDate: string;
    interviewerId: string;
    interviewerName?: string;
  }
  
  // Dashboard Stats Interface
  export interface PlacementStats {
    totalStudents: number;
    placedStudents: number;
    placementPercentage: number;
    totalJobs: number;
    totalCompanies: number;
    averagePackage: number;
    highestPackage: number;
    lowestPackage: number;
    totalOffers: number;
    offersAccepted: number;
    applicationToOfferRatio: number;
    monthlyPlacements: { month: string; placements: number }[];
    departmentWisePlacements: { department: string; placements: number; total: number }[];
    ctcDistribution: { range: string; count: number }[];
    companySectorDistribution: { sector: string; count: number }[];
    topCompanies: { name: string; hires: number }[];
  }
  
  // Filter Interfaces
  export interface StudentFilter {
    university?: string;
    department?: string;
    batch?: string;
    placementStatus?: StudentPlacementStatus;
    minCGPA?: number;
  }
  
  export interface JobFilter {
    university?: string;
    company?: string;
    status?: JobStatus;
    jobType?: JobType;
    minCtc?: number;
    maxCtc?: number;
    location?: string;
    departments?: string[];
    dateRange?: {
      start: string;
      end: string;
    };
  }
  
  export interface CompanyFilter {
    industry?: string;
    participated?: boolean;
    minPackage?: number;
  }
  
  // Auth related interfaces
  export interface LoginCredentials {
    email: string;
    password: string;
    role: UserRole;
  }
  
  export interface AuthState {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
  }
  
  export interface PasswordResetRequest {
    email: string;
    role: UserRole;
  }
  
  
  