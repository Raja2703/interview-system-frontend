"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { Search, Filter } from "lucide-react";
import { useTakersQuery } from "@/hooks/profiles/profiles.queries";
import { useEnumsQuery } from "@/hooks/common/enums.queries";

// --- Dynamic Imports ---
const ExpertsGrid = dynamic(
  () => import("@/app/dashboard/experts/components/ExpertsGrid"), 
  { 
    loading: () => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {[1, 2, 3].map((i) => (
           <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 h-80 animate-pulse">
             <div className="flex gap-4 mb-4">
               <div className="w-14 h-14 bg-gray-200 rounded-full"></div>
               <div className="flex-1 space-y-2">
                 <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                 <div className="h-3 bg-gray-200 rounded w-1/2"></div>
               </div>
             </div>
             <div className="h-24 bg-gray-200 rounded mb-4"></div>
           </div>
        ))}
      </div>
    )
  }
);

const ExpertsFilter = dynamic(
  () => import("@/app/dashboard/experts/components/ExpertsFilter"), 
  { ssr: false }
);

const BookInterviewModal = dynamic(
  () => import("@/components/dashboard/BookInterviewModal"), 
  { ssr: false }
);


export default function ExpertsPage() {
  // --- Local State ---
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<{public_id: string, name: string} | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = Number(process.env.NEXT_PUBLIC_EXPERT_COUNT_PER_PAGE) || 10;

  // Filter State
  const [filters, setFilters] = useState({
    designations: [] as string[],
    skills: [] as string[],
    levels: [] as string[],
    languages: [] as string[],
  });

  // --- Data Fetching ---
  // We pass searchTerm to the API to fetch server-side results
  const { data: takers, isLoading: loadingTakers, isError } = useTakersQuery({ 
    page: currentPage,
    search: searchTerm 
  });
  
  const { data: enums, isLoading: loadingEnums } = useEnumsQuery();

  const allExperts = takers?.results || [];
  const totalCount = takers?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Reset page on search/filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  // --- Filter Logic ---
  const filteredExperts = useMemo(() => {
    return allExperts.filter((expert: any) => {
      
      // 1. Search Term Match (Restored)
      // This allows filtering the currently visible page instantly while the new API data loads
      const matchesSearch = 
        searchTerm === "" ||
        expert.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expert.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expert.bio?.toLowerCase().includes(searchTerm.toLowerCase());

      // 2. Designation Match
      const matchesDesignation = 
          filters.designations.length === 0 || 
          (expert.designation && filters.designations.includes(expert.designation));

      // 3. Skill Match
      const expertSkills = expert.interviewer_profile?.expertise_areas?.map((e: any) => e.area);
      const matchesSkill = 
          filters.skills.length === 0 || 
          filters.skills.some(s => expertSkills?.includes(s));

      // 4. Level Match
      const expertLevels = expert.interviewer_profile?.expertise_areas?.map((e: any) => e.level);
      const matchesLevel = 
          filters.levels.length === 0 || 
          filters.levels.some(l => expertLevels?.includes(l));

      // 5. Language Match
      const matchesLanguage = 
          filters.languages.length === 0 || 
          (expert.languages && filters.languages.some(l => expert.languages?.includes(l)));

      return matchesSearch && matchesDesignation && matchesSkill && matchesLevel && matchesLanguage;
    });
  }, [allExperts, filters, searchTerm]); // <--- Added searchTerm to dependencies

  // --- Handlers ---
  const toggleFilter = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value) 
        ? prev[key].filter(i => i !== value) 
        : [...prev[key], value]
    }));
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setFilters({ designations: [], skills: [], levels: [], languages: [] });
  };

  const activeFilterCount = Object.values(filters).reduce((acc, curr) => acc + curr.length, 0);

  return (
    <div className="relative min-h-[calc(100vh-100px)]">
      
      <ExpertsFilter 
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        enums={enums}
        loading={loadingEnums}
        filters={filters}
        onToggle={toggleFilter}
        onClear={clearAllFilters}
        activeCount={activeFilterCount}
      />

      <div className="mt-1 lg:mt-15 w-full max-w-7xl mx-auto">
        
        {/* Header & Search Bar */}
        <div className="mb-8">
            {/* <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Experts</h1> */}
            <h3 className="text-lg text-gray-500 mb-6">Connect with top industry professionals.</h3>
            
            <div className="flex flex-row gap-4">
                <div className="relative flex-grow max-w-7xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search by name, bio, or role..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition text-sm text-gray-700 bg-white shadow-sm"
                    />
                </div>
                
                <button 
                    onClick={() => setIsFilterOpen(true)}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition shadow-sm active:scale-95"
                >
                    <Filter size={18} className={activeFilterCount > 0 ? "text-indigo-600" : "text-gray-500"} />
                    <span>Filters</span>
                    {activeFilterCount > 0 && (
                        <span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">
                            {activeFilterCount}
                        </span>
                    )}
                </button>
            </div>
        </div>

        <ExpertsGrid 
            experts={filteredExperts}
            isLoading={loadingTakers || loadingEnums}
            isError={isError}
            hasResults={allExperts.length > 0}
            onBook={(expert: any) => setSelectedExpert({ public_id: expert.public_id, name: expert.name })}
            onClearFilters={clearAllFilters}
        />

        {totalPages > 1 && (
             <div className="flex items-center justify-center gap-2 mt-12 pb-10">
                <button 
                  disabled={currentPage === 1} 
                  onClick={() => setCurrentPage(p => p - 1)} 
                  className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="px-4 py-2 font-bold text-indigo-600">{currentPage} / {totalPages}</span>
                <button 
                  disabled={currentPage === totalPages} 
                  onClick={() => setCurrentPage(p => p + 1)} 
                  className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
             </div>
        )}
      </div>

      {selectedExpert && (
        <BookInterviewModal 
            isOpen={!!selectedExpert}
            onClose={() => setSelectedExpert(null)}
            expertId={selectedExpert.public_id}
            expertName={selectedExpert.name}
        />
      )}
    </div>
  );
}