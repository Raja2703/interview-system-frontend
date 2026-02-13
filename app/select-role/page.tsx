"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { useSelectRoleMutation } from "@/hooks/selectRole/selectRole.mutations";
import RoleOption from "@/types"
import Logo from "@/components/Logo"

// Local types for the UI selection state
// type RoleOption = "attender" | "taker" | "both";

export default function SelectRolePage() {
  const [selected, setSelected] = useState<RoleOption | null>(null);
  
  // Use the custom mutation hook
  const { mutate, isPending } = useSelectRoleMutation();

  const handleContinue = () => {
    if (!selected) {
      toast.error("Please select a role");
      return;
    }

    // Map UI selection to API payload
    let rolesPayload: string[] = [];
    if (selected === "attender") rolesPayload = ["attender"];
    else if (selected === "taker") rolesPayload = ["taker"];
    else if (selected === "both") rolesPayload = ["attender", "taker"];

    mutate({ roles: rolesPayload });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* --- Header --- */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center items-center gap-2 mb-2">
          {/* Logo Placeholder */}
          <div className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold">
            <Logo />
          </div>
          <h2 className="text-2xl font-extrabold text-text-primary tracking-wide">
            AgentsFactory
          </h2>
        </div>
        <h2 className="mt-2 text-3xl font-bold text-text-primary tracking-wide">
          Select Your Role
        </h2>
        <p className="mt-2 text-base text-text-secondary">
          Choose how you want to use the platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="bg-white py-8 px-4 shadow sm:rounded-xl sm:px-10 border border-border">
          
          <div className="space-y-4">
            {/* Option 1: Attender */}
            <RoleCard
              title="Attender"
              description="I want to practice interviews and get hired."
              icon={<UserIcon />}
              active={selected === "attender"}
              onClick={() => setSelected("attender")}
            />

            {/* Option 2: Taker */}
            <RoleCard
              title="Taker"
              description="I want to conduct interviews and assess talent."
              icon={<BriefcaseIcon />}
              active={selected === "taker"}
              onClick={() => setSelected("taker")}
            />

            {/* Option 3: Both */}
            <RoleCard
              title="Both"
              description="I want to do both interviewing and hiring."
              icon={<SparklesIcon />}
              active={selected === "both"}
              onClick={() => setSelected("both")}
            />
          </div>

          <div className="mt-6">
            <button
              onClick={handleContinue}
              disabled={!selected || isPending}
              className={`w-full hover:cursor-pointer flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-primary transition-all
                ${!selected || isPending ? "opacity-50 cursor-not-allowed" : "hover:bg-primary-hover"}
              `}
            >
              {isPending ? "Saving..." : "Continue"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

// --- Sub-components & Icons ---

function RoleCard({
  title,
  description,
  icon,
  active,
  onClick,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`relative flex items-start p-4 cursor-pointer rounded-xl border-2 transition-all duration-200
        ${
          active
            ? "border-primary bg-primary/5 ring-1 ring-primary"
            : "border-border hover:border-primary/40 hover:bg-gray-50"
        }
      `}
    >
      <div
        className={`flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg transition-colors
        ${active ? "bg-primary text-white" : "bg-gray-100 text-gray-500"}
      `}
      >
        {icon}
      </div>
      <div className="ml-4 flex-1">
        <h3 className={`text-base font-bold ${active ? "text-primary" : "text-text-primary"}`}>
          {title}
        </h3>
        <p className="text-sm text-text-secondary mt-1 leading-snug">{description}</p>
      </div>
      <div className="ml-3 flex items-center h-10">
        <div
          className={`h-5 w-5 rounded-full border flex items-center justify-center
            ${active ? "border-primary" : "border-gray-300"}
          `}
        >
          {active && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
        </div>
      </div>
    </div>
  );
}

// Icons (Heroicons style)
const UserIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const SparklesIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);