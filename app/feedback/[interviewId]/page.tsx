"use client";

import { useForm, useStore } from "@tanstack/react-form";
import zodFieldValidator from "@/utils/zodvalidator";
import { useSubmitInterviewerFeedback, useSubmitCandidateFeedback } from "@/hooks/feedback/feedback.mutations";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Star, MessageSquare, ThumbsUp, CheckCircle2 } from "lucide-react";
import { use } from "react";

// --- Validation Schemas ---
import {interviewerFeedbackSchema, candidateFeedbackSchema} from "@/types"


// --- UI Components ---
const TextAreaField = ({ field, placeholder }: { field: any, placeholder: string }) => (
  <>
    <textarea
      className={`w-full bg-white border rounded-xl p-3 text-sm text-gray-700 placeholder-gray-400 outline-none transition shadow-sm resize-none ${
        field.state.meta.errors.length > 0 
          ? "border-red-300 focus:ring-2 focus:ring-red-200" 
          : "border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
      }`}
      placeholder={placeholder}
      rows={3}
      value={field.state.value}
      onBlur={field.handleBlur}
      onChange={(e) => field.handleChange(e.target.value)}
    />
    {field.state.meta.errors.length > 0 && (
      <p className="text-red-500 text-xs mt-1.5 font-medium ml-1">
        {field.state.meta.errors.join(", ")}
      </p>
    )}
  </>
);

function StarRating({ value, onChange, label, error }: { value: number; onChange: (v: number) => void; label: string, error?: string }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`p-1 transition-transform hover:scale-110 focus:outline-none ${
              value >= star ? "text-amber-400" : "text-gray-200 hover:text-gray-300"
            }`}
          >
            <Star fill={value >= star ? "currentColor" : "none"} size={28} strokeWidth={2} />
          </button>
        ))}
      </div>
      {error && <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>}
    </div>
  );
}

// --- Main Page ---

export default function FeedbackPage({ params }: { params: Promise<{ interviewId: string }> }) {
  const { interviewId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") as "interviewer" | "candidate"; 

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">
        Invalid access credentials.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex justify-center">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header Section */}
        <div className="bg-white px-8 py-8 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-2">
                <div className={`p-3 rounded-xl ${role === 'interviewer' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {role === 'interviewer' ? <CheckCircle2 size={24} /> : <ThumbsUp size={24} />}
                </div>
                <h1 className="text-2xl font-bold text-gray-900">
                    {role === "interviewer" ? "Interview Evaluation" : "Candidate Experience"}
                </h1>
            </div>
            <p className="text-gray-500 ml-1">
            {role === "interviewer" 
                ? "Please evaluate the candidate's performance to process credit payout." 
                : "How was your experience? Submit feedback to help us improve, or skip if you prefer."}
            </p>
        </div>

        {/* Form Body */}
        <div className="p-8 bg-gray-50/30">
            {role === "interviewer" ? (
            <InterviewerForm interviewId={interviewId} onDone={() => router.push("/dashboard")} />
            ) : (
            <CandidateForm interviewId={interviewId} onDone={() => router.push("/dashboard")} />
            )}
        </div>
      </div>
    </div>
  );
}

// --- Interviewer Form ---
function InterviewerForm({ interviewId, onDone }: { interviewId: string; onDone: () => void }) {
  const mutation = useSubmitInterviewerFeedback(interviewId);

  const form = useForm({
    defaultValues: {
      problem_understanding_rating: 0,
      problem_understanding_text: "",
      solution_approach_rating: 0,
      solution_approach_text: "",
      implementation_skill_rating: 0,
      implementation_skill_text: "",
      communication_rating: 0,
      communication_text: "",
      overall_feedback: "",
    },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value);
      onDone();
    },
  });

  const formState = useStore(form.store);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* 1. Problem Understanding */}
          <form.Field 
            name="problem_understanding_rating" 
            validators={{ onChange: zodFieldValidator(interviewerFeedbackSchema.shape.problem_understanding_rating) }}
            children={(field) => (
             <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                <StarRating 
                    label="Problem Understanding" 
                    value={field.state.value} 
                    onChange={field.handleChange} 
                    error={field.state.meta.errors.join(", ")}
                />
                <form.Field 
                    name="problem_understanding_text" 
                    validators={{ onChange: zodFieldValidator(interviewerFeedbackSchema.shape.problem_understanding_text) }}
                    children={(subField) => (
                        <TextAreaField field={subField} placeholder="Did they grasp the requirements clearly?" />
                )} />
             </div>
          )} />

          {/* 2. Solution Approach */}
          <form.Field 
            name="solution_approach_rating" 
            validators={{ onChange: zodFieldValidator(interviewerFeedbackSchema.shape.solution_approach_rating) }}
            children={(field) => (
             <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                <StarRating 
                    label="Solution Approach" 
                    value={field.state.value} 
                    onChange={field.handleChange}
                    error={field.state.meta.errors.join(", ")}
                />
                <form.Field 
                    name="solution_approach_text" 
                    validators={{ onChange: zodFieldValidator(interviewerFeedbackSchema.shape.solution_approach_text) }}
                    children={(subField) => (
                        <TextAreaField field={subField} placeholder="Was the algorithm optimal and well-explained?" />
                )} />
             </div>
          )} />

          {/* 3. Implementation */}
          <form.Field 
            name="implementation_skill_rating" 
            validators={{ onChange: zodFieldValidator(interviewerFeedbackSchema.shape.implementation_skill_rating) }}
            children={(field) => (
             <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                <StarRating 
                    label="Implementation Skill" 
                    value={field.state.value} 
                    onChange={field.handleChange}
                    error={field.state.meta.errors.join(", ")}
                />
                <form.Field 
                    name="implementation_skill_text" 
                    validators={{ onChange: zodFieldValidator(interviewerFeedbackSchema.shape.implementation_skill_text) }}
                    children={(subField) => (
                        <TextAreaField field={subField} placeholder="Code quality, speed, and syntax?" />
                )} />
             </div>
          )} />

          {/* 4. Communication */}
          <form.Field 
            name="communication_rating" 
            validators={{ onChange: zodFieldValidator(interviewerFeedbackSchema.shape.communication_rating) }}
            children={(field) => (
             <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                <StarRating 
                    label="Communication" 
                    value={field.state.value} 
                    onChange={field.handleChange}
                    error={field.state.meta.errors.join(", ")}
                />
                <form.Field 
                    name="communication_text" 
                    validators={{ onChange: zodFieldValidator(interviewerFeedbackSchema.shape.communication_text) }}
                    children={(subField) => (
                        <TextAreaField field={subField} placeholder="Did they communicate their thought process?" />
                )} />
             </div>
          )} />
      </div>

      {/* Overall Feedback */}
      <form.Field 
        name="overall_feedback" 
        validators={{ onChange: zodFieldValidator(interviewerFeedbackSchema.shape.overall_feedback) }}
        children={(field) => (
        <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
           <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
             <MessageSquare size={16} className="text-indigo-600" />
             Overall Feedback & Recommendation
           </label>
           <TextAreaField field={field} placeholder="Summarize the candidate's performance. Would you recommend hiring them?" />
        </div>
      )} />

      <button
        type="submit"
        disabled={mutation.isPending || formState.isSubmitting} 
        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
      >
        {mutation.isPending ? <Loader2 className="animate-spin" /> : "Submit Evaluation"}
      </button>
    </form>
  );
}

// --- Candidate Form (STRICT) ---
function CandidateForm({ interviewId, onDone }: { interviewId: string; onDone: () => void }) {
  const mutation = useSubmitCandidateFeedback(interviewId);
  
  const form = useForm({
    defaultValues: {
      overall_experience_rating: 0,
      professionalism_rating: 0,
      comments: "",
      would_recommend: false
    },
    onSubmit: async ({ value }) => {
       await mutation.mutateAsync(value);
       onDone();
    },
  });

  const formState = useStore(form.store);

  return (
    <form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); form.handleSubmit(); }} className="space-y-6 max-w-xl mx-auto">
       
       {/* 1. Overall Experience */}
       <form.Field 
         name="overall_experience_rating" 
         validators={{ onChange: zodFieldValidator(candidateFeedbackSchema.shape.overall_experience_rating) }}
         children={(field) => (
         <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
             <StarRating 
                label="Overall Experience" 
                value={field.state.value} 
                onChange={field.handleChange} 
                error={field.state.meta.errors.join(", ")}
            />
         </div>
      )} />
      
      {/* 2. Professionalism */}
      <form.Field 
         name="professionalism_rating" 
         validators={{ onChange: zodFieldValidator(candidateFeedbackSchema.shape.professionalism_rating) }}
         children={(field) => (
         <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
             <StarRating 
                label="Interviewer Professionalism" 
                value={field.state.value} 
                onChange={field.handleChange}
                error={field.state.meta.errors.join(", ")}
            />
         </div>
      )} />

      {/* 3. Comments (Mandatory) */}
      <form.Field 
        name="comments" 
        validators={{ 
            onChange: zodFieldValidator(candidateFeedbackSchema.shape.comments),
            onBlur: zodFieldValidator(candidateFeedbackSchema.shape.comments)
        }}
        children={(field) => (
         <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Additional Comments</label>
            <TextAreaField 
                field={field} 
                placeholder="Share your thoughts about the interview process..." 
            />
         </div>
      )} />

      <div className="flex gap-4 pt-4">
          <button 
            type="button" 
            onClick={onDone} 
            className="flex-1 py-3 bg-white border border-gray-200 text-gray-500 font-semibold rounded-xl hover:bg-gray-50 hover:text-gray-700 transition"
          >
            Skip Feedback
          </button>
          
          <button 
            type="submit" 
            disabled={mutation.isPending || formState.isSubmitting} // Buttons disabled if invalid/submitting
            className="flex-[2] py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {mutation.isPending ? <Loader2 className="animate-spin" /> : "Submit Feedback"}
          </button>
      </div>
    </form>
  );
}