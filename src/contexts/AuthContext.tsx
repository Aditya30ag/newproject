'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthState, LoginCredentials, User, UserRole } from '@/types';
import { users } from '@/data/dummy-data';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  resetPassword: (email: string, role: UserRole) => Promise<{ success: boolean; message: string }>;
}

const initialState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
};

const AuthContext = createContext<AuthContextType>({
  ...initialState,
  login: async () => ({ success: false }),
  logout: () => {},
  resetPassword: async () => ({ success: false, message: '' }),
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);
  const router = useRouter();

  // Simulate checking for stored authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = localStorage.getItem('user');
      
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser) as User;
          setState({
            user: parsedUser,
            isLoading: false,
            isAuthenticated: true,
          });
        } catch (error) {
          localStorage.removeItem('user');
          setState({ ...initialState, isLoading: false });
        }
      } else {
        setState({ ...initialState, isLoading: false });
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; message?: string }> => {
    // Simulate API call with 500ms delay
    setState({ ...state, isLoading: true });
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // In a real application, this would be an API call to the backend
        const user = users.find(
          (u) => u.email === credentials.email && u.role === credentials.role
        );

        if (user) {
          // In a real application, we'd validate the password here
          setState({
            user,
            isLoading: false,
            isAuthenticated: true,
          });
          
          // Store user in localStorage for persistence
          localStorage.setItem('user', JSON.stringify(user));
          
          // Redirect based on user role
          switch (user.role) {
            case UserRole.SUPER_ADMIN:
              router.push('/dashboard/super-admin');
              break;
            case UserRole.UNIVERSITY_ADMIN:
              router.push('/dashboard/university-admin');
              break;
            case UserRole.SUB_USER:
              router.push('/dashboard/sub-user');
              break;
            case UserRole.STUDENT:
              router.push('/dashboard/student');
              break;
            default:
              router.push('/');
          }
          
          resolve({ success: true });
        } else {
          setState({
            ...initialState,
            isLoading: false,
          });
          resolve({ success: false, message: 'Invalid email or password' });
        }
      }, 500);
    });
  };

  const logout = () => {
    localStorage.removeItem('user');
    setState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });
    router.push('/login');
  };

  const resetPassword = async (email: string, role: UserRole): Promise<{ success: boolean; message: string }> => {
    // Simulate API call with 500ms delay
    setState({ ...state, isLoading: true });
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = users.find((u) => u.email === email && u.role === role);
        
        setState({ ...state, isLoading: false });
        
        if (user) {
          // In a real application, this would send a password reset email
          resolve({
            success: true,
            message: 'Password reset instructions have been sent to your email.',
          });
        } else {
          resolve({
            success: false,
            message: 'No account found with this email address for the selected role.',
          });
        }
      }, 500);
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

