import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';
import { 
  ApplicationStatus, 
  InterviewStatus, 
  JobStatus, 
  JobType, 
  StudentPlacementStatus, 
  UserRole 
} from '@/types';

// Combine class names with Tailwind CSS
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date string to a readable format
export function formatDate(dateString: string, formatStr: string = 'MMM dd, yyyy'): string {
  try {
    return format(parseISO(dateString), formatStr);
  } catch (error) {
    return 'Invalid date';
  }
}

// Format currency values
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

// Format number with commas
export function formatNumber(number: number): string {
  return new Intl.NumberFormat('en-US').format(number);
}

// Calculate percentage
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

// Generate initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

// Convert status to badge color
export function getStatusColor(status: JobStatus | ApplicationStatus | InterviewStatus | StudentPlacementStatus): string {
  const statusColors = {
    // Job Status
    [JobStatus.DRAFT]: 'bg-gray-200 text-gray-800',
    [JobStatus.OPEN]: 'bg-green-100 text-green-800',
    [JobStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
    [JobStatus.COMPLETED]: 'bg-purple-100 text-purple-800',
    [JobStatus.CANCELLED]: 'bg-red-100 text-red-800',
    
    // Application Status
    [ApplicationStatus.APPLIED]: 'bg-blue-100 text-blue-800',
    [ApplicationStatus.SHORTLISTED]: 'bg-yellow-100 text-yellow-800',
    [ApplicationStatus.INTERVIEW]: 'bg-indigo-100 text-indigo-800',
    [ApplicationStatus.OFFERED]: 'bg-green-100 text-green-800',
    [ApplicationStatus.ACCEPTED]: 'bg-emerald-100 text-emerald-800',
    [ApplicationStatus.REJECTED]: 'bg-red-100 text-red-800',
    [ApplicationStatus.WITHDRAWN]: 'bg-gray-100 text-gray-800',
    
    // Interview Status
    [InterviewStatus.SCHEDULED]: 'bg-yellow-100 text-yellow-800',
    [InterviewStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
    [InterviewStatus.COMPLETED]: 'bg-green-100 text-green-800',
    [InterviewStatus.CANCELLED]: 'bg-red-100 text-red-800',
    
    // Student Placement Status
    [StudentPlacementStatus.NOT_APPLIED]: 'bg-gray-100 text-gray-800',
    [StudentPlacementStatus.APPLIED]: 'bg-blue-100 text-blue-800',
    [StudentPlacementStatus.INTERVIEW_PROCESS]: 'bg-yellow-100 text-yellow-800',
    [StudentPlacementStatus.OFFERED]: 'bg-purple-100 text-purple-800',
    [StudentPlacementStatus.PLACED]: 'bg-green-100 text-green-800',
    [StudentPlacementStatus.REJECTED]: 'bg-red-100 text-red-800',
  };
  
  return statusColors[status] || 'bg-gray-100 text-gray-800';
}

// Get human readable status label
export function getStatusLabel(status: string): string {
  return status.split('_').map(word => 
    word.charAt(0) + word.slice(1).toLowerCase()
  ).join(' ');
}

// Format job type label
export function formatJobType(jobType: JobType): string {
  switch (jobType) {
    case JobType.FULL_TIME:
      return 'Full-time';
    case JobType.PART_TIME:
      return 'Part-time';
    case JobType.INTERNSHIP:
      return 'Internship';
    case JobType.CONTRACT:
      return 'Contract';
    default:
      return jobType;
  }
}

// Get role display name
export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case UserRole.SUPER_ADMIN:
      return 'Super Administrator';
    case UserRole.UNIVERSITY_ADMIN:
      return 'University Administrator';
    case UserRole.SUB_USER:
      return 'Sub-User';
    case UserRole.STUDENT:
      return 'Student';
    default:
      return role;
  }
}

// Function to generate a dashboard URL based on user role
export function getDashboardUrl(role: UserRole): string {
  switch (role) {
    case UserRole.SUPER_ADMIN:
      return '/dashboard/super-admin';
    case UserRole.UNIVERSITY_ADMIN:
      return '/dashboard/university-admin';
    case UserRole.SUB_USER:
      return '/dashboard/sub-user';
    case UserRole.STUDENT:
      return '/dashboard/student';
    default:
      return '/';
  }
}

// Convert a date to ISO string without time
export function toISODateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Calculate average from an array of numbers
export function calculateAverage(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((a, b) => a + b, 0);
  return sum / numbers.length;
}

// Format CTC (Cost to Company) value
export function formatCTC(value: number, jobType: JobType): string {
  if (jobType === JobType.INTERNSHIP) {
    return `${formatNumber(value)}/month`;
  } else {
    return `${formatNumber(value)}/year`;
  }
}

// Generate a random pastel color (for charts)
export function getRandomPastelColor(): string {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 85%)`;
}

// Sort array of objects by a property
export function sortByProperty<T>(array: T[], property: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    if (a[property] < b[property]) return direction === 'asc' ? -1 : 1;
    if (a[property] > b[property]) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

// Filter array based on search term
export function filterBySearchTerm<T>(array: T[], searchTerm: string, properties: (keyof T)[]): T[] {
  if (!searchTerm) return array;
  
  const lowercasedTerm = searchTerm.toLowerCase();
  
  return array.filter(item => {
    return properties.some(prop => {
      const value = item[prop];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(lowercasedTerm);
      }
      return false;
    });
  });
}

