import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi, SelectRolePayload } from "@/controller/selectRole.api";
import { selectRoleKeys } from "./selectRole.keys";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export const useSelectRoleMutation = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: SelectRolePayload) => userApi.selectRole(payload),
    onSuccess: (data) => {
      // Invalidate relevant queries so data is re-fetched
      queryClient.invalidateQueries({ queryKey: selectRoleKeys.roles() });

      toast.success(data.message || "Role updated successfully!");
      router.push("/onboarding");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Something went wrong while selecting role.");
    },
  });
};