"use client";

import React from 'react';
import Link from "next/link";
import { useAuthGuard } from "@/hooks/auth/auth.guard";
import { Loader2, MoreHorizontal, Users, ArrowRight, Clock } from "lucide-react";
import { useInterviewDasboardQuery } from "@/hooks/interviews/interviews.queries";
import { useInterviewMutations } from "@/hooks/interviews/interviews.mutations";
import { useUserQuery } from "@/hooks/user/user.queries"; 
import Calendar from './Calendar';
import NextInterview from './NextInterview';

const Dashboard = () => {
  useAuthGuard("auth");

  const { data: dashboard, isLoading: dashboardLoading } = useInterviewDasboardQuery();
  const { joinMutation } = useInterviewMutations(); // cancelMutation available if needed later
  const { getUserProfileQuery } = useUserQuery();
  const { data: userProfile, isLoading: isUserLoading } = getUserProfileQuery;

  if (dashboardLoading || isUserLoading) {
      return (
        <div className="h-[60vh] flex items-center justify-center">
            <Loader2 className="animate-spin text-indigo-600 w-8 h-8" />
        </div>
      );
  }

  // Safe fallback if data is missing
  const events = dashboard?.results || [];
  const currentUser = userProfile;

  return (
    <div className="mt-15 space-y-6 relative">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- LEFT COLUMN: CALENDAR --- */}
        <div className="lg:col-span-2">
            <Calendar 
                events={events} 
                currentUser={currentUser} 
                onJoin={(id) => joinMutation.mutate(id)}
                isJoinPending={joinMutation.isPending}
            />
        </div>

        {/* --- RIGHT COLUMN: NEXT INTERVIEW & ACTIONS --- */}
        <div className="flex flex-col gap-6">
            <NextInterview 
                events={events} 
                currentUser={currentUser} 
                onJoin={(id) => joinMutation.mutate(id)}
                isJoinPending={joinMutation.isPending}
            />

            {/* Quick Actions Component (Inline for simplicity, or extract if it grows) */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">Quick Actions</h3>
                    <MoreHorizontal size={18} className="text-gray-400" />
                </div>
                
                <div className="space-y-3">
                    <Link href="/dashboard/experts" className="group flex items-center justify-between p-4 bg-gray-50 hover:bg-white hover:shadow-md border border-gray-100 hover:border-gray-200 rounded-2xl transition-all duration-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                <Users size={18} />
                            </div>
                            <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">Find an Expert</span>
                        </div>
                        <ArrowRight size={16} className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <Link href="/dashboard/profile" className="group flex items-center justify-between p-4 bg-gray-50 hover:bg-white hover:shadow-md border border-gray-100 hover:border-gray-200 rounded-2xl transition-all duration-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                <Clock size={18} />
                            </div>
                            <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">Update Availability</span>
                        </div>
                        <ArrowRight size={16} className="text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;