"use client";
import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useUserQuery } from "@/hooks/user/user.queries"; 
import Loader from "@/components/Loader";

export default function OAuthSuccess() {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const access = params.get("access");
    const refresh = params.get("refresh");

    if (access && refresh) {
      sessionStorage.setItem("accessToken", access);
      sessionStorage.setItem("refreshToken", refresh);

      const { getUserProfileQuery } = useUserQuery();
      const { data: userProfile, isLoading: isUserLoading } = getUserProfileQuery;
      
      const userHasRole = userProfile.has_role
      const userOnboarded =  userProfile.onboarding_completd
      
      if (!userHasRole) {
        router.replace("/select-role");
        return; // Stop execution
      }
      
      if (!userOnboarded) {
        router.replace("/onboarding");
        return; // Stop execution
      }
      
      toast.success("Login successfull");
      // If everything is done, go to Dashboard
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, []);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <Loader />
    </div>
  );
}
