"use client";
import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import Image from "next/image";
import { AUTH } from "@/constants";
import zodFieldValidator from "@/utils/zodvalidator";
import {
  fullNameSchema,
  emailSchema,
  passwordSchemaForSignup,
  termsSchema,
} from "@/types";
import { useRouter } from "next/navigation";
import { toast } from 'react-toastify';
import { useState } from "react"
import { useSignupMutation } from '@/hooks/auth/auth.mutations'
import { useAuthGuard } from "@/hooks/auth/auth.guard"

export default function SignUpPage() {
  useAuthGuard("guest");

  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const minPasswordLength = AUTH?.MIN_PASSWORD_LENGTH || 8;

  const signUpMutation = useSignupMutation();

  const form = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },

    onSubmit: async ({ value }) => {
      const payload = {
        username: value.email, // or value.fullName if backend wants that
        email: value.email,
        password: value.password,
      };

      signUpMutation.mutate(payload, {
        onSuccess: (data) => {
          const message =
            data?.message ||
            "Verification email sent. Please check your inbox.";

          toast.success(message);

          router.replace("/login");
        },

        onError: (error: any) => {
          const message =
            error?.response?.data?.error ||
            error?.message ||
            "Signup failed. Please try again.";

          toast.error(message);
        },
      });
    },
  });

  const handleGoogleSignin = async()=>{
    window.location.href = `${serverUrl}/api/auth/google/login/`
  }
  const handleLinkedinSignin = async()=>{
    window.location.href = `${serverUrl}/api/auth/linkedin/login/`
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* --- Header --- */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center items-center gap-2 mb-2">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
            EL
          </div>
          <h2 className="text-2xl font-extrabold text-text-primary tracking-wide">
            ExpertLink
          </h2>
        </div>

        <h2 className="mt-2 text-3xl font-bold text-text-primary tracking-wide">
          Create Your Account
        </h2>
        <p className="mt-2 text-base text-text-secondary">
          Join thousands preparing for their dream job
        </p>
      </div>

      <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-[520px]">
        <div className="bg-white py-8 px-4 shadow sm:rounded-xl sm:px-10 border border-border">
          {/* --- Social Buttons --- */}
          <div className="space-y-3 mb-6">
            <button onClick={handleGoogleSignin} className="flex justify-center items-center gap-2 w-full py-2.5 border-2 border-border rounded-xl hover:cursor-pointer font-medium text-text-secondary hover:bg-gray-50 transition">
              <Image
                src="/auth/google.png"
                alt="google"
                width={20}
                height={20}
              />
              <span>Continue with Google</span>
            </button>
            <button onClick={handleLinkedinSignin} className="flex justify-center items-center gap-2 w-full py-2.5 border-2 border-border rounded-xl hover:cursor-pointer font-medium text-text-secondary hover:bg-gray-50 transition">
              <Image
                src="/auth/linkedin.png"
                alt="linkedin"
                width={20}
                height={20}
              />
              <span>Continue with LinkedIn</span>
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white text-sm text-text-light">
                Or sign up with email
              </span>
            </div>
          </div>

          {/* --- THE FORM --- */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            // Increased space-y slightly to space-y-6 to ensure absolute errors fit comfortably
            className="space-y-6"
          >
            {/* 1. Full Name */}
            <form.Field
              name="fullName"
              validators={{
                onBlur: zodFieldValidator(fullNameSchema)
              }}
              children={(field) => (
                <div className="relative">
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <input
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      type="text"
                      placeholder="John Doe"
                      className={`block w-full rounded-lg border py-2.5 pl-10 pr-3 text-text-primary focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition ${
                        field.state.meta.errors.length > 0
                          ? "border-error focus:ring-error"
                          : "border-border"
                      }`}
                    />
                  </div>
                  {/* Absolute Error */}
                  {field.state.meta.errors.length > 0 && (
                    <div className="absolute -bottom-5 left-0">
                      <em className="text-xs text-error font-medium">
                        {field.state.meta.errors[0]}
                      </em>
                    </div>
                  )}
                </div>
              )}
            />

            {/* 2. Email Address */}
            <form.Field
              name="email"
              validators={{
                onBlur: zodFieldValidator(emailSchema),
              }}
              children={(field) => (
                <div className="relative">
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Email Address
                  </label>
                  <div className="flex gap-3">
                    <div className="relative flex-grow">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          className="h-5 w-5 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <input
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        type="email"
                        placeholder="you@example.com"
                        className={`block w-full rounded-lg border py-2.5 pl-10 pr-3 text-text-primary focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition ${
                          field.state.meta.errors.length > 0
                            ? "border-error focus:ring-error"
                            : "border-border"
                        }`}
                      />
                    </div>
                  </div>
                  {/* Absolute Error */}
                  {field.state.meta.errors.length > 0 && (
                    <div className="absolute -bottom-5 left-0">
                      <em className="text-xs text-error font-medium">
                        {field.state.meta.errors[0]}
                      </em>
                    </div>
                  )}
                </div>
              )}
            />

            {/* 3. Password Field */}
            <form.Field
              name="password"
              validators={{
                onChange: zodFieldValidator(passwordSchemaForSignup.shape.password),
              }}
              children={(field) => (
                <div className="relative">
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Password
                  </label>
                  <div className="relative">
                    {/* Left Icon (Lock) */}
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>

                    {/* Input */}
                    <input
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      // Toggle Type
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      // Added pr-10
                      className={`block w-full rounded-lg border py-2.5 pl-10 pr-10 text-text-primary focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition ${
                        field.state.meta.errors.length > 0
                          ? "border-error focus:ring-error"
                          : "border-border"
                      }`}
                    />

                    {/* Toggle Button */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showPassword ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      )}
                    </button>
                  </div>
                  
                  <p className="text-xs text-text-light mt-1">
                    Must be at least {minPasswordLength} characters, contain uppercase, number,
                    and special character
                  </p>

                  {/* Absolute Error */}
                  {field.state.meta.errors.length > 0 && (
                    <div className="absolute -bottom-5 left-0 z-10">
                      <em className="text-xs text-error font-medium">
                        {field.state.meta.errors[0]}
                      </em>
                    </div>
                  )}
                </div>
              )}
            />

            {/* 4. Confirm Password Field */}
            <form.Field
              name="confirmPassword"
              validators={{
                onChangeListenTo: ["password"],
                onChange: ({ value }) => {
                  if (!value) return undefined; 
                  if (value !== form.getFieldValue("password")) {
                    return "Passwords do not match";
                  }
                  return undefined;
                },
              }}
              children={(field) => (
                <div className="relative">
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    {/* Left Icon (Lock) */}
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>

                    {/* Input */}
                    <input
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      // Toggle Type
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      // Added pr-10
                      className={`block w-full rounded-lg border py-2.5 pl-10 pr-10 text-text-primary focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition ${
                        field.state.meta.errors.length > 0
                          ? "border-error focus:ring-error"
                          : "border-border"
                      }`}
                    />

                    {/* Toggle Button */}
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showConfirmPassword ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Absolute Error */}
                  {field.state.meta.errors.length > 0 && (
                    <div className="absolute -bottom-5 left-0">
                      <em className="text-xs text-error font-medium">
                        {field.state.meta.errors[0]}
                      </em>
                    </div>
                  )}
                </div>
              )}
            />

            {/* 5. Terms & Privacy */}
            <form.Field
              name="terms"
              validators={{
                onChange: zodFieldValidator(termsSchema),
              }}
              children={(field) => (
                <div className="relative flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="terms"
                      type="checkbox"
                      checked={field.state.value}
                      onChange={(e) => field.handleChange(e.target.checked)}
                      className="h-4 w-4 text-primary focus:ring-primary-hover border-border rounded"
                    />
                  </div>
                  <div className="ml-2 text-sm relative">
                    <label htmlFor="terms" className="text-text-secondary">
                      I agree to the{" "}
                      <Link
                        href="#"
                        className="font-medium text-primary hover:text-primary-hover"
                      >
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="#"
                        className="font-medium text-primary hover:text-primary-hover"
                      >
                        Privacy Policy
                      </Link>
                    </label>
                    {/* Absolute Error for Terms */}
                    {field.state.meta.errors.length > 0 && (
                      <div className="absolute top-full left-0 mt-0.5">
                        <p className="text-xs text-error font-medium">
                          {field.state.meta.errors[0]}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            />

            {/* 6. Submit Button */}
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <button
                  type="submit"
                  disabled={!canSubmit || isSubmitting || signUpMutation.isPending}
                  className={`w-full hover:cursor-pointer flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-primary hover:bg-primary-hover transition ${
                    !canSubmit || isSubmitting || signUpMutation.isPending
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {isSubmitting || signUpMutation.isPending ? "Creating Account..." : "Create Account"}
                </button>
              )}
            />
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-base text-text-secondary">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:text-primary-hover"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}