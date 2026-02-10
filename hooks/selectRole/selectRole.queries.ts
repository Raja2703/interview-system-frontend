// hooks/user/user.queries.ts
import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/controller/selectRole.api";
import { selectRoleKeys } from "./selectRole.keys";

export const useSelectRoles = () => {
  return useQuery({
    queryKey: selectRoleKeys.roles(),
    queryFn: userApi.getCurrentRoles,
    // Don't retry if it's a 401/403 (auth error)
    retry: (failureCount, error: any) => {
      if (error?.status === 401) return false;
      return failureCount < 2;
    },
  });
};