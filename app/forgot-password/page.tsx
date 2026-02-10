"use client";

import { useForm, useStore } from "@tanstack/react-form";
import { emailSchema } from "@/types";
import zodFieldValidator from "@/utils/zodvalidator";
import { toast } from "react-toastify";
import Link from "next/link";
import { useForgotPasswordMutation } from "@/hooks/auth/auth.mutations";
import { useState, useEffect } from "react";

// Unique key for storage
const TIMER_KEY = "forgot_password_timer_end";

export default function ForgotPasswordPage() {
  const forgotPasswordMutation = useForgotPasswordMutation();
  const [timeLeft, setTimeLeft] = useState(0);

  // 1. Timer Logic: Sync with LocalStorage
  useEffect(() => {
    // Helper to calculate remaining time
    const checkTimer = () => {
      const storedEnd = localStorage.getItem(TIMER_KEY);
      if (storedEnd) {
        const remaining = Math.ceil((parseInt(storedEnd) - Date.now()) / 1000);
        
        if (remaining > 0) {
          setTimeLeft(remaining);
        } else {
          // Timer finished
          setTimeLeft(0);
          localStorage.removeItem(TIMER_KEY);
        }
      } else {
        setTimeLeft(0);
      }
    };

    // Run immediately on mount to restore state
    checkTimer();

    // Run every second to update UI
    const intervalId = setInterval(checkTimer, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const form = useForm({
    defaultValues: {
      email: "",
    },
    onSubmit: async ({ value }) => {
      forgotPasswordMutation.mutate(
        { email: value.email },
        {
          onSuccess: (data) => {
            const message =
              data?.message ||
              "If an account exists with this email, a reset link has been sent.";
            toast.success(message);

            // 2. Start Timer: Save END time to localStorage (Current + 90s)
            const durationSeconds = 90;
            const endTime = Date.now() + durationSeconds * 1000;
            localStorage.setItem(TIMER_KEY, endTime.toString());
            
            // Update state immediately
            setTimeLeft(durationSeconds);
          },
          onError: (error: any) => {
            const message =
              error?.response?.data?.error ||
              error.message ||
              "Something went wrong.";
            toast.error(message);
          },
        }
      );
    },
  });

  const formState = useStore(form.store);
  const { isValid, isSubmitting } = formState;

  const isTimerRunning = timeLeft > 0;
  const isButtonDisabled = !isValid || isSubmitting || forgotPasswordMutation.isPending || isTimerRunning;

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-5 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-3xl font-bold text-text-primary">
          Forgot Password
        </h2>
        <p className="mt-2 text-text-secondary">
          Enter your email and we’ll send you a reset link.
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
            {/* Email Field */}
            <form.Field
              name="email"
              validators={{
                onBlur: zodFieldValidator(emailSchema),
                onChange: zodFieldValidator(emailSchema),
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
                        type="email"
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="you@example.com"
                        className={`block w-full rounded-lg border py-2.5 pl-10 pr-3 text-text-primary focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition ${
                          field.state.meta.errors.length > 0
                            ? "border-error focus:ring-error"
                            : "border-border"
                        }`}
                      />
                    </div>
                  </div>

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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isButtonDisabled}
              className={`w-full flex justify-center py-3 px-4 rounded-xl text-white font-medium transition-all ${
                isButtonDisabled
                  ? "bg-gray-400 cursor-not-allowed opacity-70"
                  : "bg-primary hover:bg-primary-hover hover:cursor-pointer shadow-md hover:shadow-lg transform active:scale-95"
              }`}
            >
              {isSubmitting || forgotPasswordMutation.isPending ? (
                "Sending..."
              ) : isTimerRunning ? (
                `Resend in ${formatTime(timeLeft)}`
              ) : (
                "Send Reset Link"
              )}
            </button>
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