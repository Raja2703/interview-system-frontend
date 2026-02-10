// hooks/feedback/feedback.mutations.ts
import { useMutation } from "@tanstack/react-query";
import {
  completeInterview,
  submitCandidateFeedback,
  submitInterviewerFeedback,
  InterviewerFeedbackPayload,
  CandidateFeedbackPayload
} from "@/controller/feedback.api";
import { toast } from "react-toastify";

export const useCompleteInterview = () => {
  return useMutation({
    mutationFn: (interviewId: string) => completeInterview(interviewId),
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to complete interview");
    },
  });
};

export const useSubmitInterviewerFeedback = (interviewId: string) => {
  return useMutation({
    mutationFn: (data: InterviewerFeedbackPayload) =>
      submitInterviewerFeedback(interviewId, data),
    onSuccess: () => {
      toast.success("Feedback submitted successfully. Credits released.");
    },
    onError: (error: any) => {
      console.log(error)
      toast.error(error?.response?.data?.detail || "Failed to submit feedback");
    },
  });
};

export const useSubmitCandidateFeedback = (interviewId: string) => {
  return useMutation({
    mutationFn: (data: CandidateFeedbackPayload) =>
      submitCandidateFeedback(interviewId, data),
    onSuccess: () => {
      toast.success("Feedback submitted successfully.");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Failed to submit feedback");
    },
  });
};