'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserRole } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.nativeEnum(UserRole, {
    errorMap: () => ({ message: 'Please select a role' }),
  }),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const { resetPassword, isLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
      role: undefined,
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setMessage(null);
    const result = await resetPassword(data.email, data.role);

    if (result.success) {
      setIsSubmitted(true);
      setMessage({
        type: 'success',
        text: result.message,
      });
    } else {
      setMessage({
        type: 'error',
        text: result.message,
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Image
          src="/images/logo.svg"
          alt="University Placement Tracker"
          width={48}
          height={48}
          className="mx-auto h-12 w-auto"
        />
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {message && (
            <div
              className={`mb-4 rounded-md ${
                message.type === 'success' ? 'bg-green-50' : 'bg-red-50'
              } p-4`}
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  {message.type === 'success' ? (
                    <svg
                      className="h-5 w-5 text-green-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <p
                    className={`text-sm font-medium ${
                      message.type === 'success' ? 'text-green-800' : 'text-red-800'
                    }`}
                  >
                    {message.text}
                  </p>
                </div>
              </div>
            </div>
          )}

          {!isSubmitted ? (
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* Select Role */}
              <Select
                label="Account Type"
                options={[
                  { value: '', label: 'Select your account type', disabled: true },
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

              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                fullWidth
              >
                Send reset link
              </Button>
            </form>
          ) : (
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Check your email</h3>
              <p className="mt-1 text-sm text-gray-500">
                We&apos;ve sent a password reset link to your email address.
              </p>
            </div>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">Or</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Return to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;


