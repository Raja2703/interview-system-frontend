import { useQuery } from "@tanstack/react-query";
import { interviewsApi } from "@/controller/interviews.api";
import { interviewKeys } from "@/hooks/interviews/interviews.keys";

export const useInterviewRequestsQuery = () => {
  return useQuery({
    queryKey: interviewKeys.requests(),
    queryFn: () => interviewsApi.getRequests(),
  });
};

export const useInterviewRequestDetailQuery = (uuid: string) => {
  return useQuery({
    queryKey: interviewKeys.detail(uuid),
    queryFn: () => interviewsApi.getRequestDetail(uuid),
    enabled: !!uuid, // Only run query if a UUID is provided
  });
};

export const useInterviewDasboardQuery = () => {
  return useQuery({
    queryKey: interviewKeys.dashboard(),
    queryFn: () => interviewsApi.getInterviewDashboard()
  });
};