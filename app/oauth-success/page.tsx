"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useUserQuery } from "@/hooks/user/user.queries"; 
import Loader from "@/components/Loader";

export default function OAuthSuccess() {
  const params = useSearchParams();
  const router = useRouter();

  const [ready, setReady] = useState(false);

  // hook exists immediately
  const { getUserProfileQuery } = useUserQuery();
  const { data: userProfile, isLoading } = getUserProfileQuery;

  // Step 1: store tokens
  useEffect(() => {
    const access = params.get("access");
    const refresh = params.get("refresh");

    if (!access || !refresh) {
      router.replace("/login");
      return;
    }

    sessionStorage.setItem("accessToken", access);
    sessionStorage.setItem("refreshToken", refresh);

    setReady(true);
  }, [params, router]);

  // Step 2: redirect after profile loads
  useEffect(() => {
    if (!ready || isLoading || !userProfile) return;

    if (!userProfile.has_role) {
      router.replace("/select-role");
      return;
    }

    if (!userProfile.onboarding_completd) {
      router.replace("/onboarding");
      return;
    }

    toast.success("Login successful");
    router.replace("/dashboard");
  }, [ready, isLoading, userProfile, router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <Loader />
    </div>
  );
}
