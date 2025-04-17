'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserRole } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.nativeEnum(UserRole, {
    errorMap: () => ({ message: 'Please select a role' }),
  }),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const { login, isLoading } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      role: undefined,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    const result = await login({
      email: data.email,
      password: data.password,
      role: data.role,
    });

    if (!result.success) {
      setError(result.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Login form */}
      <div className="flex flex-1 flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <Image
              src="/images/logo.svg"
              alt="University Placement Tracker"
              width={48}
              height={48}
              className="mx-auto h-12 w-auto"
            />
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              Sign in to your account
            </h2>
          </div>

          <div className="mt-8">
            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* Select Role */}
              <Select
                label="Login as"
                options={[
                  { value: '', label: 'Select a role', disabled: true },
                  { value: UserRole.SUPER_ADMIN, label: 'Super Administrator' },
                  { value: UserRole.UNIVERSITY_ADMIN, label: 'University Administrator' },
                  { value: UserRole.SUB_USER, label: 'Sub-User' },
                  { value: UserRole.STUDENT, label: 'Student' },
                ]}
                {...register('role')}
                error={errors.role?.message}
                fullWidth
              />

              {/* Email */}
              <Input
                id="email"
                label="Email address"
                type="email"
                autoComplete="email"
                {...register('email')}
                error={errors.email?.message}
                fullWidth
              />

              {/* Password */}
              <div>
                <Input
                  id="password"
                  label="Password"
                  type="password"
                  autoComplete="current-password"
                  {...register('password')}
                  error={errors.password?.message}
                  fullWidth
                />
                <div className="mt-2 flex items-center justify-end">
                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-primary-600 hover:text-primary-500"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                fullWidth
              >
                Sign in
              </Button>
            </form>

            {/* Demo credentials */}
            <div className="mt-8 rounded-md bg-blue-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Demo Credentials</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>Super Admin: admin@placements.com</p>
                    <p>University Admin: sjohnson@techuniversity.edu</p>
                    <p>Sub-User: jparker@techuniversity.edu</p>
                    <p>Student: john@student.techuniversity.edu</p>
                    <p className="mt-1 italic">Password: password123 (for all users)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="relative hidden w-0 flex-1 lg:block">
        <div
          className="absolute inset-0 h-full w-full bg-gradient-to-r from-primary-600 to-secondary-600"
          aria-hidden="true"
        >
          <div className="flex h-full items-center justify-center">
            <div className="px-8 text-center text-white">
              <h2 className="text-4xl font-bold">University Placement Tracker</h2>
              <p className="mt-4 text-xl">
                A comprehensive platform for managing university placement activities
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;


