import apiClient from "@/controller/http";

// --- Types ---
export interface InterviewerFeedbackPayload {
  problem_understanding_rating: number;
  problem_understanding_text: string;
  solution_approach_rating: number;
  solution_approach_text: string;
  implementation_skill_rating: number;
  implementation_skill_text: string;
  communication_rating: number;
  communication_text: string;
  overall_feedback: string;
}

export interface CandidateFeedbackPayload {
  overall_experience_rating?: number;
  professionalism_rating?: number;
  question_clarity_rating?: number;
  feedback_quality_rating?: number;
  comments?: string;
  would_recommend?: boolean;
}

// --- Endpoints ---

export const completeInterview = async (interviewId: string) => {
  const { data } = await apiClient.post(
    `/api/interviews/requests/${interviewId}/complete/`
  );
  return data;
};

export const submitInterviewerFeedback = async (
  interviewId: string,
  payload: InterviewerFeedbackPayload
) => {
  const { data } = await apiClient.post(
    `/api/interviews/${interviewId}/feedback/interviewer/`,
    payload
  );
  return data;
};

export const submitCandidateFeedback = async (
  interviewId: string,
  payload: CandidateFeedbackPayload
) => {
  const { data } = await apiClient.post(
    `/api/interviews/${interviewId}/feedback/candidate/`,
    payload
  );
  return data;
};