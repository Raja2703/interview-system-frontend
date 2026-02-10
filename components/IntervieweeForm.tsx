"use client";

import { useForm } from "@tanstack/react-form";
import { Plus, X, ArrowLeft } from "lucide-react";
import CustomSelect from "@/components/CustomSelect"

// --- Types ---
type Skill = { skill: string; level: string };

// --- Main Form Component ---

interface IntervieweeFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onBack: () => void;
  isSubmitting: boolean;
  careerGoals: Array<{ value: string; label: string; description: string }>;
  expertiseLevels: Array<{ value: string; label: string }>;
  skillOptions: string[];
  targetRoles?: string[]; 
  languages?: string[]; 
}

export default function IntervieweeForm({ 
  initialData, 
  onSubmit, 
  onBack, 
  isSubmitting,
  careerGoals,
  expertiseLevels,
  skillOptions,
  targetRoles = [],
  languages = []
}: IntervieweeFormProps) {

  const defaultGoal = careerGoals?.[0]?.value || "finding_jobs";
  const defaultLevel = expertiseLevels?.[1]?.value || "intermediate";

  const form = useForm({
    defaultValues: {
      target_role: initialData?.target_role || "",
      preferred_interview_language: initialData?.preferred_interview_language || "English",
      career_goal: initialData?.career_goal || defaultGoal,
      skills: (initialData?.skills || []) as Skill[],
    },
    onSubmit: async ({ value }) => {
      return onSubmit(value);
    },
    validators: {
        // Form level validation: Ensure at least one skill exists
        onChange: ({ value }) => {
            if (value.skills.length === 0) {
                return "At least one skill is required";
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
      className="space-y-6"
    >
      
      {/* Target Role - CustomSelect */}
      <form.Field
        name="target_role"
        validators={{
            onChange: ({ value }) => !value ? "Target role is required" : undefined,
        }}
        children={(field) => (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Target Role</label>
            <CustomSelect
                value={field.state.value}
                onChange={field.handleChange}
                options={targetRoles} // Assuming string[]
                placeholder="e.g. Senior Frontend Developer"
                searchable={true}
                hasError={field.state.meta.errors.length > 0}
            />
            {field.state.meta.errors.length > 0 && (
                <p className="text-xs text-red-500 mt-1 ml-1">{field.state.meta.errors[0]}</p>
            )}
          </div>
        )}
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Career Goal Select */}
        <form.Field
            name="career_goal"
            children={(field) => (
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Career Goal</label>
                    <CustomSelect
                        value={field.state.value}
                        onChange={field.handleChange}
                        options={careerGoals.map(cg => ({ label: cg.label, value: cg.value }))}
                        placeholder="Select Goal"
                    />
                </div>
            )}
        />

        {/* Language - CustomSelect */}
        <form.Field
            name="preferred_interview_language"
            validators={{
                onChange: ({ value }) => !value ? "Language is required" : undefined,
            }}
            children={(field) => (
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Interview Language</label>
                    <CustomSelect
                        value={field.state.value}
                        onChange={field.handleChange}
                        options={languages}
                        placeholder="e.g. English"
                        searchable={true}
                        hasError={field.state.meta.errors.length > 0}
                    />
                    {field.state.meta.errors.length > 0 && (
                        <p className="text-xs text-red-500 mt-1 ml-1">{field.state.meta.errors[0]}</p>
                    )}
                </div>
            )}
        />
      </div>

      {/* --- Skills Section (Array) --- */}
      <form.Field
        name="skills"
        mode="array"
        children={(field) => (
          <div className="bg-gray-50/50 p-5 rounded-2xl border border-dashed border-gray-300">
            <div className="flex justify-between items-center mb-4">
                 <label className="block text-base font-bold text-gray-800">Key Skills</label>
                 <button
                    type="button"
                    onClick={() => field.pushValue({ skill: "", level: defaultLevel })}
                    className="text-xs flex items-center gap-1 font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                    <Plus size={14} /> Add Skill
                </button>
            </div>
            
            <div className="space-y-3">
                {field.state.value.map((_, idx) => (
                    <div 
                        key={idx} 
                        className="flex gap-3 items-start relative"
                        // Descending z-index for proper dropdown stacking
                        style={{ zIndex: (field.state.value.length - idx) + 10 }}
                    >
                        {/* Skill Name Input */}
                        <form.Field
                            name={`skills[${idx}].skill`}
                            validators={{
                                onChange: ({value}) => !value ? "Required" : undefined,
                                onBlur: ({value}) => !value ? "Required" : undefined,
                            }}
                            children={(subField) => (
                                <div className="flex-grow min-w-[200px]">
                                    <CustomSelect
                                        value={subField.state.value}
                                        onChange={(val) => {
                                            subField.handleChange(val);
                                            subField.handleBlur();
                                        }}
                                        options={skillOptions}
                                        searchable={true}
                                        placeholder="Select Skill"
                                        hasError={subField.state.meta.errors.length > 0}
                                    />
                                    {subField.state.meta.errors.length > 0 && (
                                        <p className="text-[10px] text-red-500 mt-1 ml-1 animate-in fade-in">
                                            {subField.state.meta.errors[0]}
                                        </p>
                                    )}
                                </div>
                            )}
                        />

                        {/* Level Select */}
                        <form.Field
                            name={`skills[${idx}].level`}
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
                        No skills added yet. Click "Add Skill" to start.
                    </div>
                )}
            </div>

            {/* Form Level Error for Skills Array */}
            {form.state.errors.length > 0 && field.state.value.length === 0 && (
                <p className="text-xs text-red-500 font-medium mt-3 text-center">
                    Please add at least one skill.
                </p>
            )}
          </div>
        )}
      />

      {/* Buttons */}
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
                {formSubmitting ? "Finishing..." : "Finish Profile"}
                </button>
            )}
        />
      </div>
    </form>
  );
}