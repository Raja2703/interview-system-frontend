import { useQuery } from "@tanstack/react-query";
import { userProfileApi } from "@/controller/user.api";
import { userKeys } from "@/hooks/user/user.keys";

export const useUserQuery = () => {
  const getUserProfileQuery = useQuery({
    queryKey: userKeys.profile(),
    queryFn: () => userProfileApi.getUserProfile(),
    staleTime: 1000 * 60 * 5, // Optional: Cache data for 5 minutes
    retry: 1,
  });

  return { getUserProfileQuery }
};