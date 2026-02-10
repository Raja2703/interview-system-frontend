import { useQuery } from "@tanstack/react-query";
import { enumsApi } from "@/controller/enums.api";

export const useEnumsQuery = () => {
  return useQuery({
    queryKey: ["enums"],
    queryFn: () => enumsApi.getEnums(),
    staleTime: 1000 * 60 * 60, // Cache for 1 hour since enums rarely change
  });
};