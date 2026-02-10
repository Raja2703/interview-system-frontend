import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userProfileApi } from "@/controller/user.api";
import { userKeys } from "@/hooks/user/user.keys";
import { toast } from "react-toastify";

export const useUserMutation = () => {
  const queryClient = useQueryClient();

  const updateUserProfileMutation = useMutation({
    mutationFn: (data: any) => userProfileApi.updateUserProfile(data),
    onSuccess: () => {
      toast.success("Profile updated successfully");
      // Refetch profile data to ensure UI is in sync
      queryClient.invalidateQueries({ queryKey: userKeys.profile() });
    },
    onError: (error: any) => {
      const errorData = error?.response?.data;

      // Check if it's a specific string error
      if (errorData?.error && typeof errorData.error === "string") {
        toast.error(errorData.error);
        return;
      }

      // Check if it's a structured validation error (Object)
      // We assume if it has keys like 'interviewer' or 'interviewee', it's a validation error
      if (typeof errorData === "object" && errorData !== null) {
        toast.error("Please check the form for errors.");
        return;
      }

      // Fallback
      toast.error("Failed to update profile. Please try again.");
    },
  });

  return { updateUserProfileMutation };
};