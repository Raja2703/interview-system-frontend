import { useMutation } from "@tanstack/react-query";
import { loginApi, signupApi, forgotPasswordApi, resetPasswordApi, resendVerificationApi, logoutApi, LoginPayload, SignupPayload, ForgotPasswordPayload, ResetPasswordPayload, ResendVerificationPayload, LogoutPayload } from "@/controller/auth.api";
import { authKeys } from "./auth.keys";

export const useLoginMutation = () => {
  return useMutation({
    mutationKey: authKeys.login(),
    mutationFn: (payload: LoginPayload) => loginApi(payload),
  });
};

export const useSignupMutation = () => {
  return useMutation({
    mutationKey: authKeys.signup(),
    mutationFn: (payload: SignupPayload) => signupApi(payload),
  });
};

export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationKey: authKeys.forgotPassword(),
    mutationFn: (payload: ForgotPasswordPayload) => forgotPasswordApi(payload),
  });
};

export const useResetPasswordMutation = () => {
  return useMutation({
    mutationKey: authKeys.resetPassword(),
    mutationFn: (payload: ResetPasswordPayload) => resetPasswordApi(payload),
  });
};

export const useResendVerificationMutation = () => {
  return useMutation({
    mutationKey: authKeys.resendVerification(),
    mutationFn: (payload: ResendVerificationPayload) => resendVerificationApi(payload),
  });
};

export const useLogoutMutation = () => {
  return useMutation({
    mutationKey: authKeys.logout(),
    mutationFn: (payload: LogoutPayload) => logoutApi(payload),
  });
};