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

  // Step 1: store tokens first
  useEffect(() => {
    const access = params.get("access");
    const refresh = params.get("refresh");

    if (!access || !refresh) {
      toast.error("Authentication failed");
      router.replace("/login");
      return;
    }

    sessionStorage.setItem("accessToken", access);
    sessionStorage.setItem("refreshToken", refresh);
    setReady(true);
  }, [params, router]);

  // Only create query hook AFTER tokens are stored
  const { getUserProfileQuery } = useUserQuery();
  const { data: userProfile, isLoading, isError } = getUserProfileQuery;

  // Step 2: redirect after profile loads
  useEffect(() => {
    if (!ready) return;
    console.log(userProfile)

    if (isError) {
      toast.error("Failed to load profile");
      router.replace("/login");
      return;
    }

    if (isLoading || !userProfile) return;

    if (userProfile.roles.length == 0) {
      router.replace("/select-role");
      return;
    }

    if (!userProfile.onboarding_completed) {
      router.replace("/onboarding");
      return;
    }

    toast.success("Login successful");
    router.replace("/dashboard");
  }, [ready, isLoading, isError, userProfile, router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <Loader />
    </div>
  );
}