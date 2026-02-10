import apiClient from "@/controller/http";

export const onboardingApi = {
  // Check status (Step 6)
  getStatus: async () => {
    const response = await apiClient.get("/api/onboarding/status/");
    return response.data;
  },

  // Save specific step (Step 7, 8, 9)
  saveStep: async (stepName: "common" | "interviewer" | "interviewee", data: any) => {
    const response = await apiClient.post("/api/onboarding/step/", {
      step: stepName,
      data: data,
    });
    return response.data;
  },

  // Complete Onboarding (Step 10, 11, 12)
  completeOnboarding: async (finalPayload: any) => {
    const response = await apiClient.post("/api/onboarding/complete/", finalPayload);
    return response.data;
  },
};