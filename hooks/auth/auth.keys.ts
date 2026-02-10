export const authKeys = {
  all: ["auth"] as const,
  login: () => [...authKeys.all, "login"] as const,
  signup: () => [...authKeys.all, "signup"] as const,
  forgotPassword: () => [...authKeys.all, "forgotPassword"] as const,
  resetPassword: () => [...authKeys.all, "resetPassword"] as const,
  resendVerification: () => [...authKeys.all, "resendVerification"] as const,
  logout: () => [...authKeys.all, "logout"] as const,
};
