"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/utils/auth";

type GuardType = "auth" | "guest";

export function useAuthGuard(type: GuardType) {
  const router = useRouter();

  useEffect(() => {
    const isAuth = isAuthenticated();

    // Logged-in users should NOT see login page
    if (type === "guest" && isAuth) {
      router.replace("/dashboard");
    }

    // Non-logged-in users should NOT see dashboard
    if (type === "auth" && !isAuth) {
      router.replace("/login");
    }
  }, [router, type]);
}
