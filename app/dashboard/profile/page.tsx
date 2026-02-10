"use client";
import { z } from "zod";

import { useState } from "react";
import { useForm, FieldApi } from "@tanstack/react-form"; 
import { useUserQuery } from "@/hooks/user/user.queries";
import { useUserMutation } from "@/hooks/user/user.mutations";
import { useEnumsQuery } from "@/hooks/common/enums.queries";
import { 
  User, Briefcase, Linkedin, Award, Loader2, Save, X, Pencil, Clock, Plus, AlertCircle, ShieldCheck
} from "lucide-react";
import CustomSelect from "@/components/CustomSelect"
import { Skill, Expertise, TimeSlot } from '@/types'

// --- Validation Imports ---
import zodFieldValidator from "@/utils/zodvalidator";
import { 
  commonSchema, 
  interviewerSchema, 
  intervieweeSchema 
} from "@/types/zodSchemas";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8000";

function FieldInfo({ field }: { field: FieldApi<any, any, any, any> }) {
  if (!field.state.meta.isTouched || !field.state.meta.errors.length) return null;
  
  return (
    <div className="flex items-center gap-1 mt-1.5 text-red-500 animate-in slide-in-from-top-1 fade-in duration-200">
      <AlertCircle size={12} />
      <span className="text-xs font-medium">
        {field.state.meta.errors.join(", ")}
      </span>
    </div>
  );
}

export default function ProfilePage() {
  const { getUserProfileQuery } = useUserQuery();
  const { data: userData, isLoading } = getUserProfileQuery;
  
  if (isLoading || !userData) {
    return (
      <div className="h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return <ProfileFormContent initialData={userData} />;
}

function ProfileFormContent({ initialData }: { initialData: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const { updateUserProfileMutation } = useUserMutation();
  const { data: enums, isLoading: loadingEnums } = useEnumsQuery();

  // Extract Lists
  const skillOptions = enums?.skills || [];
  const designationOptions = enums?.designation_options || [];
  const phonePrefixes = enums?.phone_prefixes || [];
  const expertiseLevels = enums?.expertise_levels || [];
  const careerGoals = enums?.career_goals || [];
  const targetRoles = enums?.target_roles || [];
  const daysOfWeek = enums?.days_of_week || [];
  const roles = enums?.user_roles || [];
  const languages = enums?.languages || [];

  // --- Handlers ---
  const handleLinkedinSignin = async () => {
    // Redirect logic
    window.location.href = `${SERVER_URL}/api/auth/linkedin/login/`;
  }

  const form = useForm({
    defaultValues: initialData,
    onSubmit: async ({ value }) => {
      const payload: any = {
        roles: value.roles || [],
      };
      
      payload.common = {
        name: value.name,
        phone_prefix: value.phone_prefix || "", 
        mobile_number: value.mobile_number,
        bio: value.bio || "",
        designation: value.designation,
        company: value.company || "",
        experience_years: Number(value.experience_years) || 0,
        available_time_slots: value.available_time_slots
      };

      if (value.roles?.includes("taker")) {
        payload.interviewer = {
          expertise_areas: value.interviewer_profile?.expertise_areas || [],
          interviewing_experience_years: Number(value.interviewer_profile?.interviewing_experience_years) || 0,
          credits_per_interview: Number(value.interviewer_profile?.credits_per_interview) || 0,
          linkedin_profile_url: value.interviewer_profile?.linkedin_profile_url || ""
        };
      }

      if (value.roles?.includes("attender")) {
        payload.interviewee = {
          skills: value.interviewee_profile?.skills || [],
          target_role: value.interviewee_profile?.target_role || "",
          preferred_interview_language: value.interviewee_profile?.preferred_interview_language || "English",
          career_goal: value.interviewee_profile?.career_goal || "switching_jobs"
        };
      }

      updateUserProfileMutation.mutate(payload, {
        onSuccess: () => {
          setIsEditing(false);
        },
      });
    },

    // --- SCROLL TO ERROR LOGIC ---
    onSubmitInvalid: ({ formApi }:any) => {
      // 1. Get field keys with errors
      const fieldMeta = formApi.state.fieldMeta;
      const errorKeys = Object.keys(fieldMeta).filter(
        (key) => fieldMeta[key].errors.length > 0
      );

      if (errorKeys.length === 0) return;

      // 2. Find DOM elements associated with these keys
      const errorElements = errorKeys
        .map((key) => document.querySelector(`[name="${key}"]`))
        .filter((el): el is Element => !!el);

      if (errorElements.length > 0) {
        // 3. Find the one visually closest to top of page
        const topMostElement = errorElements.sort((a, b) => {
          return a.getBoundingClientRect().top - b.getBoundingClientRect().top;
        })[0];
        
        // 4. Scroll
        topMostElement.scrollIntoView({ 
          behavior: "smooth", 
          block: "center" 
        });

        // 5. Optional focus
        if (topMostElement instanceof HTMLElement) {
          topMostElement.focus({ preventScroll: true });
        }
      }
    },
  });

  if (loadingEnums) {
    return (
      <div className="h-[50vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // Styles
  const labelStyle = "block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5";
  const cardStyle = "bg-white p-6 rounded-2xl shadow-sm border border-gray-200";
  const getInputStyle = (isEdit: boolean, hasError?: boolean) => isEdit 
    ? `block w-full px-4 py-2.5 rounded-xl border ${hasError ? "border-red-300 ring-2 ring-red-500/10" : "border-gray-300"} bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm`
    : "block w-full px-0 py-2.5 bg-transparent text-slate-900 text-sm font-medium border-none p-0";

  const handleCancel = () => {
    form.reset();
    setIsEditing(false);
  };

  return (
    <div className="mt-15 space-y-6 max-w-5xl mx-auto pb-10">
      
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Profile Settings</h1>
          <p className="text-sm text-slate-500">Manage your personal information and role details.</p>
        </div>
        
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <button 
                type="button"
                onClick={handleCancel}
                disabled={updateUserProfileMutation.isPending}
                className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  form.handleSubmit();
                }}
                disabled={updateUserProfileMutation.isPending}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-sm disabled:opacity-50 font-medium"
              >
                {updateUserProfileMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={18} />}
                Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-300 text-slate-700 rounded-xl hover:bg-gray-50 transition shadow-sm font-medium"
            >
              <Pencil size={16} />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* --- LEFT COLUMN: Form Inputs --- */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. Basic Information */}
          <div className={cardStyle}>
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
              <User size={20} className="text-indigo-600" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <form.Field
                name="name"
                validators={{
                  onChange: zodFieldValidator(commonSchema.shape.name),
                  onBlur: zodFieldValidator(commonSchema.shape.name),
                }}
                children={(field) => (
                  <div className="col-span-2 md:col-span-1">
                    <label className={labelStyle}>Full Name</label>
                    {isEditing ? (
                      <>
                        <input
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          className={getInputStyle(true, field.state.meta.errors.length > 0)}
                          maxLength={100}
                        />
                        <FieldInfo field={field} />
                      </>
                    ) : (
                      <p className="text-sm font-semibold text-slate-900">{field.state.value}</p>
                    )}
                  </div>
                )}
              />

              {/* Roles Selection */}
              <form.Field name="roles" children={(field) => (
                <div className="col-span-2 md:col-span-1">
                  <label className={labelStyle}>Roles</label>
                  <div className="flex gap-4 mt-2">
                    {roles.map((role: any) => (
                      <label key={role.value} className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer transition-all ${
                        field.state.value?.includes(role.value) ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-gray-50 border-gray-200 text-gray-500"
                      } ${!isEditing && "pointer-events-none opacity-80"}`}>
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={field.state.value?.includes(role.value)}
                          onChange={(e) => {
                            const next = e.target.checked 
                              ? [...(field.state.value || []), role.value]
                              : field.state.value?.filter((r: string) => r !== role.value);
                            field.handleChange(next);
                          }}
                        />
                        <span className="text-[10px] font-bold uppercase">{role.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )} />

              {/* Mobile with Prefix */}
              <div className="col-span-2 md:col-span-1 flex gap-2">
                <form.Field name="phone_prefix" children={(field) => (
                  <div className="w-24">
                    <label className={labelStyle}>Prefix</label>
                    {isEditing ? (
                      <CustomSelect 
                            name={field.name}
                            value={field.state.value}
                            onChange={field.handleChange}
                            options={phonePrefixes.map((p: any) => ({ label: p.code, value: p.code }))}
                        />
                    ) : <p className="text-sm font-semibold text-slate-900">{field.state.value || "--"}</p>}
                  </div>
                )} />
                <form.Field
                  name="mobile_number"
                  validators={{
                    onChange: zodFieldValidator(commonSchema.shape.mobile_number),
                    onBlur: zodFieldValidator(commonSchema.shape.mobile_number),
                  }}
                  children={(field) => (
                    <div className="flex-1">
                      <label className={labelStyle}>Mobile Number</label>
                      {isEditing ? (
                        <>
                         <input
                           name={field.name}
                           value={field.state.value}
                           onBlur={field.handleBlur}
                           onChange={(e) => field.handleChange(e.target.value)}
                           className={getInputStyle(true, field.state.meta.errors.length > 0)}
                         />
                         <FieldInfo field={field} />
                        </>
                      ) : (
                        <p className="text-sm font-semibold text-slate-900">{field.state.value}</p>
                      )}
                    </div>
                  )}
                />
              </div>

              {/* Designation */}
              <form.Field 
                name="designation"
                validators={{
                    onChange: zodFieldValidator(commonSchema.shape.designation),
                }}
                children={(field) => (
                <div>
                  <label className={labelStyle}>Designation</label>
                  {isEditing ? (
                    <>
                     <CustomSelect 
                        name={field.name}
                        value={field.state.value}
                        onChange={field.handleChange}
                        options={designationOptions}
                        placeholder="Select Designation"
                        hasError={field.state.meta.errors.length > 0}
                    />
                    <FieldInfo field={field} />
                    </>
                  ) : <p className="text-sm font-semibold text-slate-900">{field.state.value || "Not Set"}</p>
                  }
                </div>
              )} />

              {/* Company */}
              <form.Field
                name="company"
                validators={{ onChange: zodFieldValidator(commonSchema.shape.company) }}
                children={(field) => (
                  <div>
                    <label className={labelStyle}>Company</label>
                    {isEditing ? (
                       <input
                       name={field.name}
                       value={field.state.value}
                       onChange={(e) => field.handleChange(e.target.value)}
                       className={getInputStyle(true)}
                       maxLength={100}
                     />
                    ) : (
                      <p className="text-sm font-semibold text-slate-900">{field.state.value || "Not Set"}</p>
                    )}
                  </div>
                )}
              />

              {/* Experience Years */}
              <form.Field
                name="experience_years"
                validators={{
                    onChange: zodFieldValidator(commonSchema.shape.experience_years),
                    onBlur: zodFieldValidator(commonSchema.shape.experience_years),
                }}
                children={(field) => (
                  <div>
                    <label className={labelStyle}>Total Exp. (Years)</label>
                    {isEditing ? (
                       <>
                       <input
                         name={field.name}
                         type="number"
                         min={0}
                         value={field.state.value}
                         onBlur={field.handleBlur}
                         onChange={(e) => field.handleChange(Number(e.target.value))}
                         className={getInputStyle(true, field.state.meta.errors.length > 0)}
                       />
                       <FieldInfo field={field} />
                       </>
                    ) : (
                      <p className="text-sm font-semibold text-slate-900">{field.state.value} Years</p>
                    )}
                  </div>
                )}
              />

              {/* Bio */}
              <form.Field
                name="bio"
                validators={{
                    onChange: zodFieldValidator(commonSchema.shape.bio),
                    onBlur: zodFieldValidator(commonSchema.shape.bio),
                }}
                children={(field) => (
                  <div className="col-span-2">
                    <label className={labelStyle}>Bio</label>
                    {isEditing ? (
                       <>
                       <textarea
                         name={field.name}
                         rows={3}
                         value={field.state.value}
                         onBlur={field.handleBlur}
                         onChange={(e) => field.handleChange(e.target.value)}
                         className={getInputStyle(true, field.state.meta.errors.length > 0)}
                       />
                       <FieldInfo field={field} />
                       </>
                    ) : (
                      <p className="text-sm text-slate-700 leading-relaxed">{field.state.value}</p>
                    )}
                  </div>
                )}
              />

              {/* Available Time Slots */}
              <form.Field 
                name="available_time_slots" 
                mode="array"
                validators={{
                    onChange: zodFieldValidator(commonSchema.shape.available_time_slots)
                }}
                children={(field) => (
                <div className="col-span-2 pt-6 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <label className={labelStyle}>Availability</label>
                    {isEditing && (
                      <button 
                        type="button" 
                        onClick={() => field.pushValue({ day: "monday", start_time: "09:00", end_time: "10:00" })}
                        className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded-lg transition"
                      >
                        <Plus size={14} /> Add Slot
                      </button>
                    )}
                  </div>
                  
                  {isEditing && <FieldInfo field={field} />}

                  <div className="space-y-3">
                    {field.state.value?.map((slot: TimeSlot, idx: number) => (
                      <div key={idx} className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="flex-1 min-w-[120px]">
                          {isEditing ? (
                            <form.Field name={`available_time_slots[${idx}].day`} children={(sub) => (
                              <CustomSelect 
                                    name={sub.name}
                                    value={sub.state.value}
                                    onChange={sub.handleChange}
                                    options={daysOfWeek} 
                                />
                            )} />
                          ) : <span className="text-sm text-slate-600 font-bold capitalize">{slot.day}</span>}
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-slate-400" />
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <form.Field name={`available_time_slots[${idx}].start_time`} children={(sub) => (
                                <input name={sub.name} type="time" value={sub.state.value} onChange={(e) => sub.handleChange(e.target.value)} className={getInputStyle(true)} />
                              )} />
                              <span className="text-slate-400">-</span>
                              <form.Field name={`available_time_slots[${idx}].end_time`} children={(sub) => (
                                <input name={sub.name} type="time" value={sub.state.value} onChange={(e) => sub.handleChange(e.target.value)} className={getInputStyle(true)} />
                              )} />
                            </div>
                          ) : <span className="text-sm text-slate-600 font-medium">{slot.start_time} - {slot.end_time}</span>}
                        </div>

                        {isEditing && (
                          <button type="button" onClick={() => field.removeValue(idx)} className="ml-auto p-1.5 text-slate-400 hover:text-red-500 transition">
                            <X size={18} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )} />
            </div>
          </div>

          {/* 2. Interviewer Profile */}
          <form.Subscribe
            selector={(state) => state.values.roles}
            children={(roles) => {
              const isInterviewer = roles?.includes("taker");
              if (!isInterviewer) return null;
                  return (
                    <div className={`${cardStyle}`}>
                      {/* Background Decoration */}
                      <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full"></div>
                      </div>
                      
                      {/* Header with Verify Button */}
                      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100 relative z-10">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Briefcase size={20} className="text-purple-600" />
                            Interviewer Profile
                        </h3>
                        
                        {/* VERIFY BUTTON ADDED HERE */}
                        {!isEditing && (
                          <>
                            {initialData?.is_verified_user ? (
                              <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg border border-green-200 shadow-sm animate-in fade-in zoom-in duration-300">
                                <ShieldCheck size={16} className="text-green-600 fill-green-100" />
                                <span className="text-xs font-bold uppercase tracking-wide">Verified</span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={handleLinkedinSignin}
                                className="flex items-center gap-2 bg-[#0077b5] text-white px-4 py-1.5 rounded-lg hover:bg-[#006097] transition shadow-sm text-xs font-semibold"
                              >
                                <Linkedin size={14} />
                                Verify
                              </button>
                            )}
                          </>
                        )}
                      </div>
                      
                      <div className="space-y-6 relative z-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          
                          {/* Interviewing Experience */}
                          <form.Field
                            name="interviewer_profile.interviewing_experience_years"
                            validators={{
                                onChange: zodFieldValidator(interviewerSchema.shape.interviewing_experience_years),
                                onBlur: zodFieldValidator(interviewerSchema.shape.interviewing_experience_years),
                            }}
                            children={(field) => (
                              <div>
                                <label className={labelStyle}>Interviewing Exp. (Years)</label>
                                {isEditing ? (
                                  <>
                                  <input
                                    name={field.name}
                                    type="number"
                                    min={0}
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(Number(e.target.value))}
                                    className={getInputStyle(true, field.state.meta.errors.length > 0)}
                                  />
                                  <FieldInfo field={field} />
                                  </>
                                ) : (
                                  <p className="text-sm font-semibold text-slate-900">{field.state.value} Years</p>
                                )}
                              </div>
                            )}
                          />
                          
                          {/* Credits */}
                          <form.Field
                            name="interviewer_profile.credits_per_interview"
                            validators={{
                                onChange: zodFieldValidator(interviewerSchema.shape.credits_per_interview),
                                onBlur: zodFieldValidator(interviewerSchema.shape.credits_per_interview),
                            }}
                            children={(field) => (
                              <div>
                                <label className={labelStyle}>Credits / Interview</label>
                                <div className="flex items-center gap-2">
                                  {isEditing ? (
                                    <div className="w-full">
                                        <input
                                            name={field.name}
                                            type="number"
                                            min={1}
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) => field.handleChange(Number(e.target.value))}
                                            className={getInputStyle(true, field.state.meta.errors.length > 0)}
                                        />
                                        <FieldInfo field={field} />
                                    </div>
                                  ) : (
                                    <p className="text-sm font-bold text-slate-900">{field.state.value}</p>
                                  )}
                                  {isEditing && <span className="text-xs text-slate-400 whitespace-nowrap">(1-10k)</span>}
                                </div>
                              </div>
                            )}
                          />
                          
                          {/* LinkedIn */}
                          <form.Field
                            name="interviewer_profile.linkedin_profile_url"
                            validators={{
                                onChange: zodFieldValidator(interviewerSchema.shape.linkedin_profile_url),
                                onBlur: zodFieldValidator(interviewerSchema.shape.linkedin_profile_url),
                            }}
                            children={(field) => (
                              <div className="col-span-2">
                                <label className={`${labelStyle} flex items-center gap-1`}>
                                  <Linkedin size={14} className="text-blue-600"/> LinkedIn URL
                                </label>
                                {isEditing ? (
                                  <>
                                  <input
                                    name={field.name}
                                    type="url"
                                    value={field.state.value || ""}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    className={getInputStyle(true, field.state.meta.errors.length > 0)}
                                    maxLength={200}
                                  />
                                  <FieldInfo field={field} />
                                  </>
                                ) : (
                                  <a href={field.state.value} target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-600 hover:underline truncate block">
                                    {field.state.value || "Not provided"}
                                  </a>
                                )}
                              </div>
                            )}
                          />
                        </div>
                        
                        {/* Expertise Areas (Array) */}
                        <form.Field 
                          name="interviewer_profile.expertise_areas"
                          mode="array"
                          // 1. Add validator to ensure at least 1 item exists
                          validators={{
                            onChange: zodFieldValidator(
                              z.array(z.unknown()).min(1, "Please add at least one area of expertise")
                            )
                          }}
                          children={(field) => (
                            <div className="pt-4 border-t border-gray-100">
                              {/* 2. Add name={field.name} here for the scroll-to-error logic */}
                              <div 
                                name={field.name}
                                className="flex justify-between items-center mb-3"
                              >
                                <label className={labelStyle}>Areas of Expertise</label>
                                {isEditing && (
                                  <button 
                                    type="button" 
                                    onClick={() => field.pushValue({ area: "", level: "expert" })} 
                                    className="text-xs text-purple-600 font-bold hover:bg-purple-50 px-2 py-1 rounded transition"
                                  >
                                    + Add Area
                                  </button>
                                )}
                              </div>
                              
                              {/* 3. This displays the "Please add at least one area..." error */}
                              {isEditing && <FieldInfo field={field} />}
                              
                              <div className="flex flex-wrap gap-3">
                                {field.state.value?.map((exp: Expertise, idx: number) => (
                                  <div key={idx} className="flex gap-3 items-center">
                                    {isEditing ? (
                                      <>
                                        <form.Field
                                          name={`interviewer_profile.expertise_areas[${idx}].area`}
                                          validators={{
                                            onChange: zodFieldValidator(z.string().min(1, "Skill name is required"))
                                          }}
                                          children={(subField)=>(
                                            <div className="flex-grow min-w-[250px]">
                                                <CustomSelect 
                                                    name={subField.name}
                                                    value={subField.state.value}
                                                    onChange={subField.handleChange}
                                                    options={skillOptions}
                                                    searchable={true}
                                                    placeholder="Select Area"
                                                    hasError={subField.state.meta.errors.length > 0}
                                                />
                                                <FieldInfo field={subField} />
                                            </div>
                                          )}
                                        />
                                        <form.Field
                                          name={`interviewer_profile.expertise_areas[${idx}].level`}
                                          children={(subField)=>(
                                            <div className="w-40">
                                              <CustomSelect 
                                                name={subField.name}
                                                value={subField.state.value}
                                                onChange={subField.handleChange}
                                                options={expertiseLevels}
                                                />
                                            </div>
                                          )}
                                        />
                                        <button type="button" onClick={() => field.removeValue(idx)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                                          <X size={20} />
                                        </button>
                                      </>
                                    ) : (
                                      <div className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100">
                                        <span className="text-sm font-semibold text-purple-900">{exp.area}</span>
                                        <span className="text-[10px] font-bold uppercase text-purple-600 bg-white px-1.5 py-0.5 rounded border border-purple-100">{exp.level}</span>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        />
                      </div>
                    </div>
                  )}
            }
          />

          {/* 3. Interviewee Profile */}
          <form.Subscribe
            selector={(state) => state.values.roles}
            children={(roles) => {
              const isInterviewee = roles?.includes("attender");
              if (!isInterviewee) return null;
              return (
                <div className={`${cardStyle}`}>
                  {/* Background Decoration */}
                  <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-full"></div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 relative z-10 pb-4 border-b border-gray-100">
                    <Award size={20} className="text-green-600" />
                    Candidate Profile
                  </h3>

                  <div className="space-y-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Target Role */}
                      <form.Field
                        name="interviewee_profile.target_role"
                        validators={{
                            onChange: zodFieldValidator(intervieweeSchema.shape.target_role),
                        }}
                        children={(field) => (
                          <div>
                            <label className={labelStyle}>Target Role</label>
                            {isEditing ? (
                              <>
                              <CustomSelect 
                                name={field.name}
                                value={field.state.value}
                                onChange={field.handleChange}
                                options={targetRoles}
                                placeholder="Select Designation"
                                hasError={field.state.meta.errors.length > 0}
                            />
                              <FieldInfo field={field} />
                              </>
                            ) : (
                              <p className="text-sm font-semibold text-slate-900">{field.state.value}</p>
                            )}
                          </div>
                        )}
                      />

                      {/* Language */}
                      <form.Field
                        name="interviewee_profile.preferred_interview_language"
                        validators={{
                            onChange: zodFieldValidator(intervieweeSchema.shape.preferred_interview_language),
                        }}
                        children={(field) => (
                          <div>
                            <label className={labelStyle}>Preferred Language</label>
                            {isEditing ? (
                              <>
                              <CustomSelect
                                name={field.name}
                                value={field.state.value}
                                onChange={field.handleChange}
                                options={languages}
                                placeholder="e.g. English"
                                searchable={true}
                                hasError={field.state.meta.errors.length > 0}
                            />
                              <FieldInfo field={field} />
                              </>
                            ) : (
                              <p className="text-sm font-semibold text-slate-900">{field.state.value}</p>
                            )}
                          </div>
                        )}
                      />

                      {/* Career Goal */}
                      <form.Field
                        name="interviewee_profile.career_goal"
                        validators={{
                            onChange: zodFieldValidator(intervieweeSchema.shape.career_goal),
                        }}
                        children={(field) => (
                          <div className="col-span-2">
                            <label className={labelStyle}>Career Goal</label>
                            {isEditing ? (
                              <>
                              <CustomSelect 
                                    name={field.name}
                                    value={field.state.value}
                                    onChange={field.handleChange}
                                    options={careerGoals}
                                    hasError={field.state.meta.errors.length > 0}
                                />
                                <FieldInfo field={field} />
                              </>
                            ) : (
                              <p className="text-sm font-semibold text-slate-900 capitalize">
                                {careerGoals.find((g: any) => g.value === field.state.value)?.label || field.state.value}
                              </p>
                            )}
                          </div>
                        )}
                      />
                    </div>

                    {/* Technical Skills */}
                    <form.Field 
                      name="interviewee_profile.skills"
                      mode="array"
                      // 1. Add the validator here
                      validators={{
                        onChange: zodFieldValidator(
                          z.array(z.unknown()).min(1, "Please add at least one technical skill")
                        )
                      }}
                      children={(field) => (
                        <div className="pt-4 border-t border-gray-100">
                          {/* 2. Add name={field.name} here so the scroller finds this section when the array is empty */}
                          <div 
                            name={field.name} 
                            className="flex justify-between items-center mb-3"
                          >
                            <label className={labelStyle}>Technical Skills</label>
                            {isEditing && (
                              <button 
                                type="button" 
                                onClick={() => field.pushValue({ skill: "", level: "intermediate" })} 
                                className="text-xs text-green-600 font-bold hover:bg-green-50 px-2 py-1 rounded transition"
                              >
                                + Add Skill
                              </button>
                            )}
                          </div>

                          {/* 3. This displays the "Please add at least one technical skill" error */}
                          {isEditing && <FieldInfo field={field} />}

                          <div className="flex flex-wrap gap-3">
                            {field.state.value?.map((item: Skill, idx: number) => (
                              <div key={idx} className={`${isEditing ? 'w-full flex gap-2' : ''}`}>
                                {isEditing ? (
                                  <>
                                    <form.Field
                                      name={`interviewee_profile.skills[${idx}].skill`}
                                      validators={{
                                        onChange: zodFieldValidator(z.string().min(1, "Skill name is required"))
                                      }}
                                      children={(subField)=>(
                                        <div className="flex-grow min-w-[250px]">
                                            <CustomSelect 
                                                name={subField.name}
                                                value={subField.state.value}
                                                onChange={subField.handleChange}
                                                options={skillOptions}
                                                searchable={true}
                                                placeholder="Select Skill"
                                                hasError={subField.state.meta.errors.length > 0}
                                            />
                                            <FieldInfo field={subField} />
                                        </div>
                                      )}
                                    />
                                    <form.Field
                                      name={`interviewee_profile.skills[${idx}].level`}
                                      children={(subField)=>(
                                        <div className="w-40">
                                            <CustomSelect 
                                                name={subField.name}
                                                value={subField.state.value}
                                                onChange={subField.handleChange}
                                                options={expertiseLevels}
                                            />
                                        </div>
                                      )}
                                    />
                                    <button type="button" onClick={() => field.removeValue(idx)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                                      <X size={20} />
                                    </button>
                                  </>
                                ) : (
                                  <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                                    <span className="text-sm font-semibold text-green-900">{item.skill}</span>
                                    <span className="text-[10px] font-bold uppercase text-green-600 bg-white px-1.5 py-0.5 rounded border border-green-100">{item.level}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    />
                  </div>
                </div>
              )}
            }
          />
        </div>

        {/* --- RIGHT COLUMN: Summary --- */}
        <div className="space-y-6">
            <div className={cardStyle}>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Account Summary</h4>
                
                <div className="flex items-center gap-4 mb-6">
                     <img 
                        src={`https://api.dicebear.com/9.x/identicon/svg?seed=${initialData.name}`} 
                        alt="Avatar" 
                        className="w-16 h-16 rounded-full border-4 border-indigo-50 shadow-sm"
                     />
                     <div>
                         <p className="font-bold text-slate-900 text-lg">{initialData.name}</p>
                         <p className="text-sm text-slate-500">{initialData.designation}</p>
                     </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-100">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-medium">Exp. Years</span>
                        <span className="font-bold text-slate-900">{initialData.experience_years} Years</span>
                    </div>
                    <div className="flex justify-between text-sm items-center">
                        <span className="text-slate-500 font-medium">Onboarding</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${initialData.onboarding_completed ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                            {initialData.onboarding_completed ? "Completed" : "Pending"}
                        </span>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-100">
                        <span className="text-xs text-slate-400 font-bold uppercase block mb-3">Available Slots</span>
                        <div className="flex flex-wrap gap-2">
                            {initialData.available_time_slots?.map((slot: any, i:number) => (
                                <div key={i} className="text-xs bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 font-medium">
                                    <span className="capitalize">{slot.day}</span>: {slot.start_time}-{slot.end_time}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}