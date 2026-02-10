export const interviewKeys = {
  all: ["interviews"] as const,
  requests: () => [...interviewKeys.all, "requests"] as const,
  detail: (uuid: string) => [...interviewKeys.all, "detail", uuid] as const,
  dashboard: () => [...interviewKeys.all, "dashboard"] as const,
};