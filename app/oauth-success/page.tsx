"use client";
import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function OAuthSuccess() {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    console.log('oauth success page')
    const access = params.get("access");
    const refresh = params.get("refresh");

    if (access && refresh) {
      sessionStorage.setItem("accessToken", access);
      sessionStorage.setItem("refreshToken", refresh);
      router.replace("/select-role");
    } else {
      router.replace("/login");
    }
  }, []);

  return <p>Signing in...</p>;
}
