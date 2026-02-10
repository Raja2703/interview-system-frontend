"use client";

import { useState, useEffect } from "react";
import { useSelectRoles } from "@/hooks/selectRole/selectRole.queries";
import { useOnboardingMutations } from "@/hooks/onboarding/onboarding.mutations";
import { useEnumsQuery } from "@/hooks/common/enums.queries";
import CommonForm from "@/components/CommonForm";
import InterviewerForm from "@/components/InterviewerForm";
import IntervieweeForm from "@/components/IntervieweeForm";
import { Check, Loader2 } from "lucide-react"; 
import { useRouter } from "next/navigation";
import { onboardingApi } from "@/controller/onboarding.api";

export default function OnboardingPage() {
  const router = useRouter();

  // 1. Fetch Data
  const { data: roleData, isLoading: roleLoading } = useSelectRoles();
  const { data: enumsData, isLoading: enumsLoading } = useEnumsQuery(); // Fetch Enums
  const { saveStepMutation, completeOnboardingMutation } = useOnboardingMutations();
  
  const [isOnboardCompletedChecking, setIsOnboardCompletedChecking] = useState(true);

  // 2. Check Onboarding Status
  useEffect(() => {
    (async function checkStatus() {
      try {
        const onboardingData = await onboardingApi.getStatus();
        if (onboardingData?.onboarding_status?.onboarding_completed) { 
          router.replace('/dashboard');
        } else {
          setIsOnboardCompletedChecking(false);
        }
      } catch (error) {
        console.error("Failed to check status", error);
        setIsOnboardCompletedChecking(false);
      }
    })();
  }, [router]);

  const [formData, setFormData] = useState({
    common: null,
    interviewer: null,
    interviewee: null,
  });

  const [currentStep, setCurrentStep] = useState(0);

  const userRoles = roleData?.current_roles || [];
  const steps = ["common"];
  if (userRoles.includes("taker")) steps.push("interviewer");
  if (userRoles.includes("attender")) steps.push("interviewee");

  const activeStepName = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  // --- Logic ---
  const handleNext = async (stepName: string, stepData: any) => {
    const updatedFormData = { ...formData, [stepName]: stepData };
    setFormData(updatedFormData);

    if (!isLastStep) {
      // if you want to wait for save to complete before moving to next step,
      // use mutateAsync. Otherwise you can keep mutate (fire-and-forget).
      if (saveStepMutation.mutateAsync) {
        try {
          await saveStepMutation.mutateAsync({ step: stepName as any, data: stepData });
        } catch (err) {
          console.error("Failed saving step:", err);
        }
      } else {
        saveStepMutation.mutate({ step: stepName as any, data: stepData });
      }
      setCurrentStep((prev) => prev + 1);
      return;
    } else {
      // IMPORTANT: return the Promise so the child's form sees it and
      // TanStack will set its isSubmitting correctly.
      return handleFinalSubmit(updatedFormData);
    }
  };


  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleFinalSubmit = async (finalData: any) => {
    const payload: any = { common: finalData.common };
    if (userRoles.includes("taker")) payload.interviewer = finalData.interviewer;
    if (userRoles.includes("attender")) payload.interviewee = finalData.interviewee;
    
    return completeOnboardingMutation.mutateAsync(payload);
  };

  // Loading State
  if (roleLoading || enumsLoading || isOnboardCompletedChecking) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-indigo-600 font-medium">
      <Loader2 className="animate-spin mb-2" size={32} />
      <span>Loading onboarding experience...</span>
    </div>
  );

  // Extract Lists for ease of use
  const skillOptions = enumsData?.skills || [];
  const designationOptions = enumsData?.designation_options || [];
  const phonePrefixes = enumsData?.phone_prefixes || [];
  const daysOfWeek = enumsData?.days_of_week || [];
  const expertiseLevels = enumsData?.expertise_levels || [];
  const careerGoals = enumsData?.career_goals || [];
  const languages = enumsData?.languages || [];
  const targetRoles = enumsData?.target_roles || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          Welcome Aboard
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Let's get your profile set up in just a few steps.
        </p>
      </div>

      <div className="w-full max-w-3xl">
        {/* Visual Stepper */}
        <div className="mb-10">
          <div className="flex items-center justify-between w-full px-4 relative">
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10 rounded-full" />
            
            {steps.map((step, index) => {
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              let label = "Basic Info";
              if (step === "interviewer") label = "Interviewer";
              if (step === "interviewee") label = "Candidate";

              return (
                <div key={step} className="flex flex-col items-center bg-transparent">
                  <div
                    className={`w-10 h-10 flex items-center justify-center rounded-full border-2 transition-all duration-300 ${
                      isActive
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110"
                        : isCompleted
                        ? "bg-green-500 border-green-500 text-white"
                        : "bg-white border-gray-300 text-gray-400"
                    }`}
                  >
                    {isCompleted ? <Check size={20} /> : <span className="font-bold">{index + 1}</span>}
                  </div>
                  <span className={`mt-2 text-xs font-semibold uppercase tracking-wider ${isActive ? "text-indigo-600" : "text-gray-400"}`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card Container */}
        <div className="bg-white/80 backdrop-blur-xl shadow-2xl shadow-indigo-100 rounded-3xl p-8 sm:p-10 border border-white">
          
          <div className="mb-6">
             <h2 className="text-2xl font-bold text-gray-900">
              {activeStepName === "common" && "Tell us about yourself"}
              {activeStepName === "interviewer" && "Setup Interviewer Profile"}
              {activeStepName === "interviewee" && "Candidate Preferences"}
            </h2>
          </div>

          {/* PASSING DATA TO CHILD FORMS 
              Ensure your child components accept these props!
          */}

          {activeStepName === "common" && (
            <CommonForm 
              initialData={formData.common} 
              onSubmit={(data:any) => handleNext("common", data)}
              phonePrefixes={phonePrefixes}
              designationOptions={designationOptions}
              // skillOptions={skillOptions}
            />
          )}

          {activeStepName === "interviewer" && (
            <InterviewerForm
              initialData={formData.interviewer}
              onSubmit={(data:any) => handleNext("interviewer", data)}
              onBack={handleBack}
              isSubmitting={completeOnboardingMutation.isPending && isLastStep}
              daysOfWeek={daysOfWeek}
              expertiseLevels={expertiseLevels}
              skillOptions={skillOptions}
            />
          )}

          {activeStepName === "interviewee" && (
            <IntervieweeForm
              initialData={formData.interviewee}
              onSubmit={(data:any) => handleNext("interviewee", data)}
              onBack={handleBack}
              isSubmitting={completeOnboardingMutation.isPending && isLastStep}
              careerGoals={careerGoals}
              expertiseLevels={expertiseLevels}
              skillOptions={skillOptions}
              languages={languages}
              targetRoles={targetRoles}
            />
          )}
        </div>
      </div>
    </div>
  );
}