export const profileKeys = {
  all: ["profiles"] as const,
  takers: () => [...profileKeys.all, "takers"] as const,
};