"use client";

import { useForm } from "@tanstack/react-form";
import zodFieldValidator from "@/utils/zodvalidator";
import { toast } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {resetPasswordSchema} from "@/types"
import { useState } from "react"
import { useResetPasswordMutation } from "@/hooks/auth/auth.mutations"

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  /* -----------------------------
     Safety check
  ----------------------------- */
  if (!uid || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-error text-lg">
          Invalid or expired reset link.
        </p>
      </div>
    );
  }

  const resetMutation = useResetPasswordMutation()

  const form = useForm({
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
    onSubmit: async ({ value }) => {
      resetMutation.mutate({
        uid,
        token,
        new_password: value.newPassword,
      },
      {
        onSuccess: (data) => {
          const message = data?.message || "Password reset successful. Please log in.";
          toast.success(message);

          router.replace("/login");
        },
        onError: (error: any) => {
          const message = error?.response?.data?.error || error.message || "Invalid or expired reset link.";
          toast.error(message);
        },
        }
    );
    },
  });

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-5 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-3xl font-bold text-text-primary">
          Reset Password
        </h2>
        <p className="mt-2 text-text-secondary">
          Enter your new password below.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="bg-white py-8 px-4 shadow sm:rounded-xl sm:px-10 border border-border">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-6"
          >
            {/* New Password */}
            <form.Field
              name="newPassword"
              validators={{
                onChange: zodFieldValidator(
                  resetPasswordSchema.shape.newPassword
                ),
              }}
              children={(field) => (
                <div className="relative">
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    New Password
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
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                      </div>
                  <input
                    // Toggle Type
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className={`block w-full text-text-primary rounded-lg border py-2.5 px-10 focus:ring-2 focus:ring-primary outline-none ${
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
              </div>
                  {field.state.meta.errors.length > 0 && (
                    <div className="absolute -bottom-5 left-0">
                      <em className="text-xs text-error">
                        {field.state.meta.errors.join(", ")}
                      </em>
                    </div>
                  )}
                </div>
              )}
            />

            {/* Confirm Password */}
            <form.Field
              name="confirmPassword"
              validators={{
                onChangeListenTo: ["newPassword"],
                onChange: ({ value }) => {
                  if (!value) return undefined; 
                  if (value !== form.getFieldValue("newPassword")) {
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
                  <input
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    // Toggle Type
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`block text-text-primary w-full rounded-lg border py-2.5 px-10 focus:ring-2 focus:ring-primary focus:border-transparent outline-none ${
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
                  {field.state.meta.errors.length > 0 && (
                    <div className="absolute -bottom-5 left-0">
                      <em className="text-xs text-error">
                        {field.state.meta.errors.join(", ")}
                      </em>
                    </div>
                  )}
                </div>
              )}
            />

            {/* Submit */}
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <button
                  type="submit"
                  disabled={
                    !canSubmit ||
                    isSubmitting ||
                    resetMutation.isPending
                  }
                  className={`w-full py-3 hover:cursor-pointer rounded-xl text-white bg-primary hover:bg-primary-hover transition ${
                    !canSubmit ||
                    isSubmitting ||
                    resetMutation.isPending
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {resetMutation.isPending
                    ? "Resetting..."
                    : "Reset Password"}
                </button>
              )}
            />
          </form>

          <div className="mt-4 text-center">
            <Link
              href="/login"
              className="text-sm text-primary-hover hover:text-primary"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
