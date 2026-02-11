"use client";

import { useForm } from "@tanstack/react-form";
import isValidLinkedInProfile from "@/utils/validateLinkedin";
import { Plus, X, ArrowLeft, Linkedin } from "lucide-react";
import CustomSelect from "@/components/CustomSelect"

// --- Types ---
type Expertise = { area: string; level: string };

// --- Main Component ---

interface InterviewerFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onBack: () => void;
  isSubmitting: boolean;
  expertiseLevels: Array<{ value: string; label: string }>;
  skillOptions: string[];
}

export default function InterviewerForm({
  initialData,
  onSubmit,
  onBack,
  isSubmitting,
  expertiseLevels,
  skillOptions,
}: InterviewerFormProps) {
  
  const defaultLevel = expertiseLevels?.[2]?.value || "expert";

  const form = useForm({
    defaultValues: {
      interviewing_experience_years: initialData?.interviewing_experience_years || 0,
      credits_per_interview: initialData?.credits_per_interview || 100,
      linkedin_profile_url: initialData?.linkedin_profile_url || "",
      expertise_areas: (initialData?.expertise_areas || []) as Expertise[],
    },
    onSubmit: async ({ value }) => {
      const finalData = {
        ...value,
        interviewing_experience_years: Number(value.interviewing_experience_years),
        credits_per_interview: Number(value.credits_per_interview),
      };
      return onSubmit(finalData);
    },
    // Form-level validator (existing)
    validators: {
        onChange: ({ value }) => {
            if (value.expertise_areas.length === 0) {
                return "At least one expertise area is required";
            }
            return undefined;
        }
    }
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-7 pb-4"
    >
      {/* LinkedIn Field */}
      <form.Field
        name="linkedin_profile_url"
        validators={{
          onChange: ({ value }) =>
            !isValidLinkedInProfile(value) ? "Invalid LinkedIn URL format" : undefined,
        }}
        children={(field) => (
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              LinkedIn Profile
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Linkedin className="h-5 w-5 text-blue-600" />
              </div>
              <input
                required
                type="url"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="https://www.linkedin.com/in/username"
                className={`text-text-primary block w-full pl-10 pr-3 py-3 rounded-xl border-gray-200 bg-gray-50 border focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none ${
                  field.state.meta.errors.length ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200" : ""
                }`}
              />
            </div>
            {field.state.meta.errors.length > 0 && (
              <div className="absolute -bottom-5 left-0 flex items-center space-x-1 animate-in slide-in-from-top-1 fade-in duration-200">
                <p className="text-xs text-red-500 font-medium">
                  {field.state.meta.errors.join(", ")}
                </p>
              </div>
            )}
          </div>
        )}
      />

      {/* Grid Inputs */}
      <div className="grid grid-cols-1 gap-x-5 gap-y-7 sm:grid-cols-2">
        <form.Field
          name="interviewing_experience_years"
          children={(field) => (
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Years Interviewing
              </label>
              <input
                required
                type="number"
                min="0"
                value={field.state.value}
                onChange={(e) => field.handleChange(Number(e.target.value))}
                className="text-text-primary block w-full px-4 py-3 rounded-xl border-gray-200 bg-gray-50 border focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
              />
            </div>
          )}
        />

        <form.Field
          name="credits_per_interview"
          children={(field) => (
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Credits / Interview
              </label>
              <input
                required
                type="number"
                min="1"
                value={field.state.value}
                onChange={(e) => field.handleChange(Number(e.target.value))}
                className="text-text-primary block w-full px-4 py-3 rounded-xl border-gray-200 bg-gray-50 border focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
              />
            </div>
          )}
        />
      </div>

      {/* Expertise Section */}
      <form.Field
        name="expertise_areas"
        mode="array"
        children={(field) => (
          <div className="bg-gray-50/50 p-5 rounded-2xl border border-dashed border-gray-300">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-base font-bold text-gray-800">
                Expertise Areas
              </label>
              <button
                type="button"
                onClick={() => field.pushValue({ area: "", level: defaultLevel })}
                className="text-xs flex items-center gap-1 font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus size={14} /> Add Area
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {field.state.value.map((_, idx) => (
                <div 
                    key={idx} 
                    className="flex gap-3 items-start relative"
                    // Stacking logic
                    style={{ zIndex: (field.state.value.length - idx) + 10 }}
                >
                  
                  {/* Area Input Subfield with Validation */}
                  <form.Field
                    name={`expertise_areas[${idx}].area`}
                    validators={{
                        // Validate that value is not empty
                        onChange: ({value}) => !value ? "Required" : undefined,
                        onBlur: ({value}) => !value ? "Required" : undefined,
                    }}
                    children={(subField) => (
                      <div className="flex-grow min-w-[200px]">
                        <CustomSelect
                            value={subField.state.value}
                            onChange={(val) => {
                                subField.handleChange(val);
                                subField.handleBlur(); // Trigger validation immediately
                            }}
                            options={skillOptions}
                            searchable={true}
                            placeholder="Select Skill / Area"
                            hasError={subField.state.meta.errors.length > 0}
                        />
                        {/* Show Error Message */}
                        {subField.state.meta.errors.length > 0 && (
                            <p className="text-[10px] text-red-500 mt-1 ml-1 animate-in fade-in">
                                {subField.state.meta.errors[0]}
                            </p>
                        )}
                      </div>
                    )}
                  />

                  {/* Level Select Subfield */}
                  <form.Field
                    name={`expertise_areas[${idx}].level`}
                    children={(subField) => (
                      <div className="w-40 flex-shrink-0">
                        <CustomSelect
                            value={subField.state.value}
                            onChange={subField.handleChange}
                            options={expertiseLevels}
                            placeholder="Level"
                        />
                      </div>
                    )}
                  />

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => field.removeValue(idx)}
                    className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-[1px]"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}

              {field.state.value.length === 0 && (
                <div className="text-center py-4 text-sm text-gray-400 italic">
                  No expertise added yet. Click "Add Area" to start.
                </div>
              )}
            </div>

            {/* Form Level Error for Empty Array */}
            {form.state.errors.length > 0 && field.state.value.length === 0 && (
                <p className="text-xs text-red-500 font-medium mt-3 text-center">
                    Please add at least one area of expertise.
                </p>
            )}
          </div>
        )}
      />

      {/* Footer Buttons */}
      <div className="flex justify-between pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center px-6 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={16} className="mr-2" /> Back
        </button>

        <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, formSubmitting]) => (
                <button
                type="submit"
                disabled={!canSubmit || formSubmitting}
                className="px-8 py-3 rounded-xl text-sm font-bold text-white bg-indigo-600 shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                {formSubmitting ? "Saving..." : "Continue"}
                </button>
            )}
        />
      </div>
    </form>
  );
}