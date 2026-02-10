export const selectRoleKeys = {
  all: ["user"] as const,
  profile: () => [...selectRoleKeys.all, "profile"] as const,
  roles: () => [...selectRoleKeys.all, "roles"] as const,
};