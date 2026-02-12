import { z } from "zod";
import { AUTH } from "@/constants";
import isValidLinkedInProfile from "@/utils/validateLinkedin";
import type { Dayjs } from 'dayjs';

const minPasswordLength = AUTH?.MIN_PASSWORD_LENGTH || 8;

export const fullNameSchema = z.string().min(2, "Name must be at least 2 characters")
export const emailSchema = z.email("Invalid email address")
export const termsSchema = z.boolean().refine((val) => val === true, "You must accept the terms")
export const passwordSchemaForSignup = z
  .object({
    password: z
      .string()
      .min(minPasswordLength, `Password must be at least ${minPasswordLength} characters`)
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[a-z]/, "Must contain a lowercase letter")
      .regex(/[0-9]/, "Must contain a number")
      .regex(/[!@#$%^&*]/, "Must contain a special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
export const passwordSchemaForLogin = z.string().min(minPasswordLength, `Password must be at least ${minPasswordLength} characters`)
  .regex(/[A-Z]/, { message: "Must contain at least one uppercase letter" })
  .regex(/[a-z]/, { message: "Must contain at least one lowercase letter" })
  .regex(/[0-9]/, { message: "Must contain at least one number" })
  .regex(/[!@#$%^&*]/, { message: "Must contain at least one special character (!@#$%^&*)" });
export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(minPasswordLength, `Password must be at least ${minPasswordLength} characters`)
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[a-z]/, "Must contain a lowercase letter")
      .regex(/[0-9]/, "Must contain a number")
      .regex(/[!@#$%^&*]/, "Must contain a special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });


const mobileRegex = /^\+?\d{10,15}$/;
// Matches +919876543210 or 9876543210 (digits only or starting with +)

// --- 1. Common Schema (Matches CommonOnboardingSerializer) ---
export const commonSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name cannot exceed 100 characters"),

  mobile_number: z
    .string()
    .min(10, "Mobile number must be at least 10 digits")
    .max(20, "Mobile number is too long")
    .regex(mobileRegex, "Invalid format. Use format like 9876543210"),

  bio: z
    .string()
    .min(10, "Bio must be at least 10 characters long")
    .max(1000, "Bio cannot exceed 1000 characters"),

  designation: z
    .string()
    .min(1, "Designation is required")
    .max(100, "Designation too long"),

  experience_years: z
    .coerce // Automatically converts string "5" to number 5
    .number()
    .min(0, "Experience cannot be negative")
    .max(50, "Experience seems unlikely high"),

  // Simple validation for time slots (you might handle this via a UI component)
  available_time_slots: z
    .array(
      z.object({
        day: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
        start_time: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
        end_time: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
      })
    )
    .min(1, "At least one time slot is required"),

  company: z
    .string()
    .max(50, "Company name too long")
    .optional()
});

// --- 2. Interviewer Schema (Matches InterviewerOnboardingSerializer) ---
export const interviewerSchema = z.object({
  linkedin_profile_url: z
    .string()
    .url("Invalid URL format")
    .refine(isValidLinkedInProfile, {
      message: "Must be a valid LinkedIn profile URL (linkedin.com/in/...)",
    })
    .optional()
    .or(z.literal("")), // Allow empty string if optional

  interviewing_experience_years: z
    .coerce
    .number()
    .min(0, "Experience cannot be negative")
    .max(50, "Experience max limit is 50 years"),

  credits_per_interview: z
    .coerce
    .number()
    .min(1, "Credits must be at least 1")
    .max(10000, "Max credits allowed is 10000"),

  expertise_areas: z
    .array(
      z.object({
        area: z.string().min(1, "Area name is required"),
        level: z.enum(['beginner', 'intermediate', 'expert']),
      })
    )
    .min(1, "Add at least one expertise area"),
});

// --- 3. Interviewee Schema (Matches IntervieweeOnboardingSerializer) ---
export const intervieweeSchema = z.object({
  target_role: z
    .string()
    .min(1, "Target role is required")
    .max(100, "Too long"),

  preferred_interview_language: z
    .string()
    .min(1, "Language is required"),

  career_goal: z.enum(['finding_jobs', 'switching_jobs']),

  skills: z
    .array(
      z.object({
        skill: z.string().min(1, "Skill name is required"),
        level: z.enum(['beginner', 'intermediate', 'expert']),
      })
    )
    .min(1, "Add at least one skill"),
});

// Feedback form schemas

export const interviewerFeedbackSchema = z.object({
  problem_understanding_rating: z.number().min(1, "Rating is required").max(5),
  problem_understanding_text: z.string().min(10, "Minimum 10 characters required"),
  solution_approach_rating: z.number().min(1, "Rating is required").max(5),
  solution_approach_text: z.string().min(10, "Minimum 10 characters required"),
  implementation_skill_rating: z.number().min(1, "Rating is required").max(5),
  implementation_skill_text: z.string().min(10, "Minimum 10 characters required"),
  communication_rating: z.number().min(1, "Rating is required").max(5),
  communication_text: z.string().min(10, "Minimum 10 characters required"),
  overall_feedback: z.string().min(20, "Minimum 20 characters required"),
});

export const candidateFeedbackSchema = z.object({
  overall_experience_rating: z.number().min(1, "Rating is required").max(5),
  professionalism_rating: z.number().min(1, "Rating is required").max(5),
  comments: z.string().min(10, "Minimum 10 characters required"),
  would_recommend: z.boolean().optional(), // Kept optional as there is no UI input for it yet
});

// Custom validator for Time Slots
export const timeSlotsSchema = z
  .array(
    z.object({
      day: z.string(),
      start_time: z.string(),
      end_time: z.string(),
    })
  )
  .superRefine((slots, ctx) => {
    slots.forEach((slot, index) => {
      if (slot.start_time >= slot.end_time) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `End time must be after start time for ${slot.day}`,
          path: [index, "end_time"],
        });
      }
    });
  });


export const interviewBookingTimeSlotSchema = z.object({
  topic: z.string().min(3, "Topic must be at least 3 characters long"),
  message: z.string().optional(),
  duration: z.number(),
  slots: z.array(z.custom<Dayjs | null>())
    .min(1, "At least one time slot is required")
    .refine((slots) => slots.some((slot) => slot !== null), {
      message: "Please select at least one valid date and time",
    }),
});