import { useMutation, useQueryClient } from "@tanstack/react-query";
import { onboardingApi } from "@/controller/onboarding.api";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { getErrorMessage } from "@/utils/error"
import { userKeys } from "@/hooks/user/user.keys";

export const useOnboardingMutations = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  // Mutation to save individual steps (Draft save)
  const saveStepMutation = useMutation({
    mutationFn: ({ step, data }: { step: "common" | "interviewer" | "interviewee"; data: any }) =>
      onboardingApi.saveStep(step, data),
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.response?.data?.error || "Failed to save progress");
    },
  });

  // Mutation to finalize onboarding
  const completeOnboardingMutation = useMutation({
    mutationFn: (payload: any) => onboardingApi.completeOnboarding(payload),
    onSuccess: (data) => {
      // 1. refetch profile data
      queryClient.invalidateQueries({ queryKey: userKeys.profile() });

      // 2. Show success message
      toast.success(data.message || "Welcome aboard! Profile setup complete.");

      // 3. redirect to dashboard
      router.push("/dashboard");
    },
    onError: (error: any) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  });

  return { saveStepMutation, completeOnboardingMutation };
};