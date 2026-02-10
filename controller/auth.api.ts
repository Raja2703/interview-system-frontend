import apiClient from "@/controller/http"

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  username: string;
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  uid: string;
  token: string;
  new_password: string;
}

export interface ResendVerificationPayload {
  email: string
}

export interface LogoutPayload {
  refresh_token: string
}

export const loginApi = async (payload: LoginPayload) => {
  const res = await apiClient.post(`/api/auth/login/`, payload);
  return res.data;
};

export const signupApi = async (payload: SignupPayload) => {
  const res = await apiClient.post(`/api/auth/signup/`, payload);
  return res.data;
};

export const forgotPasswordApi = async (payload: ForgotPasswordPayload) => {
  const res = await apiClient.post(`/accounts/password/reset/`, payload);
  return res.data;
}

export const resetPasswordApi = async (payload: ResetPasswordPayload) => {
  const res = await apiClient.post(`/accounts/password/reset/confirm/`, payload);
  return res.data;
}

export const resendVerificationApi = async (payload: ResendVerificationPayload) => {
  const res = await apiClient.post(`/accounts/resend-verification/`, payload);
  return res.data;
}

export const logoutApi = async (payload: LogoutPayload) => {
  const res = await apiClient.post(`/api/auth/logout/`, payload);
  return res.data;
};

