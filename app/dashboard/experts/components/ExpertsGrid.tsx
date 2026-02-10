"use client";

import { Users } from "lucide-react";
import ExpertCard from "./ExpertCard";

interface ExpertsGridProps {
    experts: any[];
    isLoading: boolean;
    isError: boolean;
    hasResults: boolean;
    onBook: (expert: any) => void;
    onClearFilters: () => void;
}

export default function ExpertsGrid({ experts, isLoading, isError, hasResults, onBook, onClearFilters }: ExpertsGridProps) {
  
  if (isLoading) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 h-80 animate-pulse">
                <div className="flex gap-4 mb-4">
                    <div className="w-14 h-14 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </div>
                <div className="h-24 bg-gray-200 rounded mb-4"></div>
                <div className="h-10 bg-gray-200 rounded mt-auto"></div>
            </div>
        ))}
        </div>
    );
  }

  if (isError) {
    return (
        <div className="bg-red-50 text-red-600 p-8 rounded-2xl text-center border border-red-100">
            <p className="font-semibold">Unable to load experts at this time.</p>
        </div>
    );
  }

  // Case 1: Database empty
  if (!hasResults) {
    return (
        <div className="text-center py-24 bg-white rounded-2xl border border-gray-200 border-dashed flex flex-col items-center justify-center">
            <Users className="text-gray-300 mb-4" size={48} />
            <h3 className="text-lg font-bold text-gray-900">No Experts Yet</h3>
            <p className="text-gray-500 mt-1">Check back later.</p>
        </div>
    );
  }

  // Case 2: Database has data, but filters matched nothing
  if (experts.length === 0) {
    return (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 border-dashed">
            <p className="text-gray-500 font-medium">No matches found for your filters.</p>
            <button onClick={onClearFilters} className="mt-2 text-indigo-600 font-semibold hover:underline">
                Clear all filters
            </button>
        </div>
    );
  }

  // Case 3: Success
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {experts.map((expert) => (
        <ExpertCard key={expert.id} expert={expert} onBook={() => onBook(expert)} />
      ))}
    </div>
  );
}