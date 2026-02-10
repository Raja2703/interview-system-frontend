'use client'

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

export default function EmailVerification() {
  const searchParams = useSearchParams();
  const router = useRouter()
  const status = searchParams.get("status"); // 'success' or 'failed'

  // State to handle visual transitions
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Simple animation trigger on mount
    setShowContent(true);
  }, []);

  const isSuccess = status === "success";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div
        className={`max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl transition-all duration-700 transform ${
          showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="text-center">
          {/* Icon Section */}
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-opacity-10 mb-6">
            {isSuccess ? (
              <div className="bg-green-100 p-4 rounded-full animate-bounce-slow">
                <svg
                  className="h-12 w-12 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            ) : (
              <div className="bg-red-100 p-4 rounded-full">
                <svg
                  className="h-12 w-12 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Text Content */}
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900 tracking-tight">
            {isSuccess ? "Email Verified!" : "Verification Failed"}
          </h2>
          
          <p className="mt-4 text-sm text-gray-500 leading-relaxed">
            {isSuccess
              ? "Your email has been successfully verified. You now have full access to all features of our platform."
              : "We couldn't verify your email. The link may have expired or is invalid. Please try requesting a new one."}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 space-y-4">
          {isSuccess ? (
            <button
              onClick={() => router.replace("/login")}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-sm"
            >
              Continue to login
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <button
                onClick={() => router.replace("/signup")}
                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none transition-colors shadow-sm"
              >
                Back to Sign Up
              </button>
              <button
                onClick={() => window.location.href = "mailto:support@example.com"}
                className="w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors"
              >
                Contact Support
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}