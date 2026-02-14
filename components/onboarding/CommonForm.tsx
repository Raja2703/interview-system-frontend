"use client";

import { useForm } from "@tanstack/react-form";
import zodFieldValidator from "@/utils/zodvalidator";
import { commonSchema } from "@/types/zodSchemas";
import { User, Smartphone, Briefcase, Clock, FileText, Building2 } from "lucide-react";
import CustomSelect from "@/components/CustomSelect"

// Define props based on your Enum structure
interface CommonFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  phonePrefixes: Array<{ code: string; country: string }>;
  designationOptions: string[];
}

export default function CommonForm({ initialData, onSubmit, phonePrefixes, designationOptions }: CommonFormProps) {
  const form = useForm({
    defaultValues: initialData || {
      name: "",
      phone_country_code: "+91",
      mobile_number: "",
      designation: "",
      company: "", 
      experience_years: 0,
      bio: "",
      available_time_slots: [{ day: "monday", start_time: "09:00", end_time: "17:00" }]
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

  const ErrorMessage = ({ errors }: { errors: string[] }) => {
    if (!errors.length) return null;
    return (
      <div className="absolute -bottom-5 left-0 flex items-center space-x-1 animate-in slide-in-from-top-1 fade-in duration-200">
        <p className="text-xs text-red-500 font-medium">{errors[0]}</p>
      </div>
    );
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-7 pb-4"
    >
      {/* --- Name Field --- */}
      <form.Field
        name="name"
        validators={{ onChange: zodFieldValidator(commonSchema.shape.name) }}
        children={(field) => (
          <div className="group relative">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              </div>
              <input
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className={`text-text-primary block w-full pl-10 pr-3 py-3 rounded-xl border bg-gray-50 border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none ${
                  field.state.meta.errors.length ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200" : ""
                }`}
                placeholder="e.g. Jane Doe"
              />
            </div>
            <ErrorMessage errors={field.state.meta.errors} />
          </div>
        )}
      />

      {/* --- Phone Number --- */}
      <div className="relative">
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mobile Number</label>
        <div className="flex gap-3 group">
        <form.Field name="phone_prefix" children={(field) => (
          <div className="w-24">
              <CustomSelect 
                    value={field.state.value}
                    onChange={field.handleChange}
                    searchable={true}
                    options={phonePrefixes.map((p: any) => ({ label: p.code, value: p.code }))}
                />
          </div>
        )} />
        <form.Field name="mobile_number" validators={{ onChange: zodFieldValidator(commonSchema.shape.mobile_number) }}>
            {(field) => (
              <div className="relative flex-1">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Smartphone className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  type="tel"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="98765 43210"
                  className={`text-text-primary block w-full pl-10 pr-3 py-3 rounded-xl border bg-gray-50 border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none ${
                    field.state.meta.errors.length ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200" : ""
                  }`}
                />
                 <ErrorMessage errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>
        </div>
      </div>

      {/* --- Professional Details Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-7">
        
        {/* Designation */}
        <form.Field name="designation" validators={{ onChange: zodFieldValidator(commonSchema.shape.designation) }}>
          {(field) => (
            <div className="group relative">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Designation</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <CustomSelect 
                    value={field.state.value}
                    onChange={field.handleChange}
                    options={designationOptions}
                    searchable={true}
                    placeholder="Select Designation"
                />
              </div>
              <ErrorMessage errors={field.state.meta.errors} />
            </div>
          )}
        </form.Field>

        {/* Company Name (Optional) */}
        <form.Field name="company">
          {(field) => (
            <div className="group relative">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Current Company <span className="text-gray-400 font-normal text-xs ml-1">(Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="text-text-primary block w-full pl-10 pr-3 py-3 rounded-xl border bg-gray-50 border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                />
              </div>
            </div>
          )}
        </form.Field>
        
        {/* Experience */}
        <form.Field name="experience_years" validators={{ onChange: zodFieldValidator(commonSchema.shape.experience_years) }}>
          {(field) => (
            <div className="group relative">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Experience (Years)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  className="text-text-primary block w-full pl-10 pr-3 py-3 rounded-xl border-gray-200 bg-gray-50 border focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                />
              </div>
              <ErrorMessage errors={field.state.meta.errors} />
            </div>
          )}
        </form.Field>
      </div>

      {/* --- Bio --- */}
      <form.Field name="bio" validators={{ onChange: zodFieldValidator(commonSchema.shape.bio) }}>
        {(field) => (
          <div className="relative">
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-semibold text-gray-700">Bio</label>
              <span className="text-xs text-gray-400">{field.state.value.length}/1000</span>
            </div>
            <div className="relative group">
              <div className="absolute top-3 left-3 pointer-events-none">
                  <FileText className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              </div>
              <textarea
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                rows={4}
                placeholder="Tell us a bit about your professional journey..."
                className={`text-text-primary block w-full pl-10 pr-3 py-3 rounded-xl border bg-gray-50 border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none resize-none ${
                    field.state.meta.errors.length ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200" : ""
                  }`}
              />
            </div>
             <ErrorMessage errors={field.state.meta.errors} />
          </div>
        )}
      </form.Field>

      {/* Submit */}
      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
        children={([canSubmit, isSubmitting]) => (
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5 active:translate-y-0 ${
                !canSubmit || isSubmitting 
                ? "bg-gray-400 cursor-not-allowed opacity-70" 
                : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-300"
              }`}
            >
              {isSubmitting ? "Saving..." : "Continue"}
            </button>
          </div>
        )}
      />
    </form>
  );
}