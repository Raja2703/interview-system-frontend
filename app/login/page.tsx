"use client";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import Link from "next/link";
import Image from "next/image";

import { emailSchema, passwordSchemaForLogin } from "@/types";
import zodFieldValidator from "@/utils/zodvalidator";
import { useLoginMutation } from "@/hooks/auth/auth.mutations";
import { useAuthGuard } from "@/hooks/auth/auth.guard"

export default function LoginPage() {
  useAuthGuard("guest");

  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loadingUserProfile, setLoadingUserProfile] = useState(false);

  const loginMutation = useLoginMutation();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    onSubmit: async ({ value }) => {
      setLoadingUserProfile(true);

      loginMutation.mutate(
        {
          email: value.email,
          password: value.password,
        },
        {
          onSuccess: async(data) => {
            const accessToken = data.tokens.access;
            const refreshToken = data.tokens.refresh;

            sessionStorage.setItem("accessToken", accessToken);
            sessionStorage.setItem("refreshToken", refreshToken);
            const message = data?.message || "Login successful";
            
            const userHasRole = data.user.has_role
            const userOnboarded =  data.user.onboarding_completed

            if (!userHasRole) {
              router.replace("/select-role");
              return; // Stop execution
            }
            if (!userOnboarded) {
              router.replace("/onboarding");
              return; // Stop execution
            }
            
            toast.success(message);
            // If everything is done, go to Dashboard
            router.replace("/dashboard");
          },
          onError: (error: any) => {
            const message =
              error?.response?.data?.error || error.message;
            setLoadingUserProfile(false);
            toast.error(message);
          },
        }
      );
    },
  });

  const handleGoogleSignin = async()=>{
    window.location.href = `${serverUrl}/api/auth/google/login/`
  }
  const handleLinkedinSignin = async()=>{
    window.location.href = `${serverUrl}/api/auth/linkedin/login/`
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-5 sm:px-6 lg:px-8">
      {/* --- Header --- */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Logo Placeholder - assuming same logo */}
        <div className="flex justify-center items-center gap-2 mb-2">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
            EL
          </div>
          <h2 className="text-2xl font-extrabold text-text-primary tracking-wide">
            ExpertLink
          </h2>
        </div>
        <h2 className="mt-2 text-3xl font-bold text-text-primary tracking-wide">
          Welcome Back
        </h2>
        <p className="mt-2 text-base text-text-secondary ">
          Sign in to continue your interview prep journey
        </p>
      </div>

      <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="bg-white py-5 px-4 shadow sm:rounded-xl sm:px-10 border border-border">
          {/* --- Social Buttons --- */}
          <div className="space-y-3 mb-6">
            <button onClick={handleGoogleSignin} className="flex justify-center items-center gap-2 w-full py-2.5 border-2 border-border rounded-xl hover:cursor-pointer font-medium text-text-secondary hover:bg-background">
              <Image
                src="/auth/google.png"
                alt="google icon"
                width={23}
                height={0}
              />
              <span>Continue with Google</span>
            </button>
            <button onClick={handleLinkedinSignin} className="flex justify-center items-center gap-2 w-full py-2.5 border-2 border-border rounded-xl hover:cursor-pointer font-medium text-text-secondary hover:bg-background">
              <Image
                src="/auth/linkedin.png"
                alt="linkedin icon"
                width={23}
                height={0}
              />
              Continue with LinkedIn
            </button>
          </div>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white text-sm text-text-light">
                Or continue with email
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
            className="space-y-6"
          >
            {/* 1. Email Field */}
            <form.Field
              name="email"
              validators={{
                onBlur: zodFieldValidator(emailSchema),
              }}
              children={(field) => (
                // Added 'relative' to the container so we can position the error absolutely
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
                  
                  {/* ABSOLUTE POSITIONED ERROR */}
                  {field.state.meta.errors.length > 0 && (
                    <div className="absolute -bottom-5 left-0">
                      <em className="text-xs text-error font-medium">
                        {field.state.meta.errors.join(", ")}
                      </em>
                    </div>
                  )}
                </div>
              )}
            />

            {/* 2. Password Field */}
            <form.Field
              name="password"
              validators={{
                onChange: zodFieldValidator(passwordSchemaForLogin),
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

                    {/* Input Field */}
                    <input
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      // 1. Dynamic Type
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      // 2. Changed pr-3 to pr-10 to make room for the eye icon
                      className={`block w-full rounded-lg border py-2.5 pl-10 pr-10 text-text-primary focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition ${
                        field.state.meta.errors.length > 0
                          ? "border-error focus:ring-error"
                          : "border-border"
                      }`}
                    />

                    {/* 3. Right Icon (Eye Toggle) */}
                    <button
                      type="button" // Prevent form submission
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showPassword ? (
                        // Eye Open (Show)
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      ) : (
                        // Eye Slash (Hide)
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* ABSOLUTE POSITIONED ERROR */}
                  {field.state.meta.errors.length > 0 && (
                    <div className="absolute -bottom-5 left-0">
                      <em className="text-xs text-error font-medium">
                        {field.state.meta.errors.join(", ")}
                      </em>
                    </div>
                  )}
                </div>
              )}
            />

            {/* 3. Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <form.Field
                name="rememberMe"
                children={(field) => (
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      type="checkbox"
                      checked={field.state.value}
                      onChange={(e) => field.handleChange(e.target.checked)}
                      className="h-4 w-4 text-primary focus:ring-primary-hover border-border rounded"
                    />
                    <label
                      htmlFor="remember-me"
                      className="ml-2 block text-sm text-text-primary"
                    >
                      Remember me
                    </label>
                  </div>
                )}
              />
              <div className="text-sm">
                <Link
                  href="/forgot-password"
                  className="font-medium text-primary-hover hover:text-primary"
                >
                  Forgot password?
                </Link>
              </div>
              
            </div>

            {/* 4. Submit Button */}
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <button
                  type="submit"
                  disabled={!canSubmit || isSubmitting || loginMutation.isPending}
                  className={`w-full hover:cursor-pointer flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-primary hover:bg-primary-hover transition ${
                    !canSubmit || isSubmitting || loginMutation.isPending || loadingUserProfile
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {isSubmitting || loginMutation.isPending || loadingUserProfile ? "Signing in..." : "Sign In"}
                </button>
              )}
            />
          </form>

          <div className="mt-3 text-center text-base text-text-secondary">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="font-normal text-primary-hover text-lg hover:primary"
            >
              Sign up for free
            </Link>
          </div>
          
          {/* Resend verification */}
          <div className="mt-3 text-sm text-center">
            <Link
              href="/resend-verification"
              className="text-primary-hover hover:text-primary font-medium"
            >
              Signed up but didn't verify your account?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}