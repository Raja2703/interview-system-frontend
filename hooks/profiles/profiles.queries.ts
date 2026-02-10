import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { profilesApi } from "@/controller/profiles.api";
import { profileKeys } from "@/hooks/profiles/profiles.keys";

type TakerQueryParams = {
  page?: number;
  search?: string;
  designation?: string;
  skill?: string;
};

export const useTakersQuery = (params: TakerQueryParams = {}) => {
  return useQuery({
    queryKey: [...profileKeys.takers(), params],
    queryFn: () => profilesApi.getTakers(params),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};