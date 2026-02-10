"use client";

import { useState, useMemo } from "react";
import { Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FilterProps {
  isOpen: boolean;
  onClose: () => void;
  enums: any;
  loading: boolean;
  filters: {
    designations: string[];
    skills: string[];
    levels: string[];
    languages: string[];
  };
  onToggle: (key: "designations" | "skills" | "levels" | "languages", value: string) => void;
  onClear: () => void;
  activeCount: number;
}

export default function ExpertsFilter({ 
    isOpen, onClose, enums, loading, filters, onToggle, onClear, activeCount 
}: FilterProps) {
    
  return (
    <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            
            {/* Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 bottom-0 w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col border-r border-gray-100"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                  <Filter size={20} className="text-indigo-600" /> Filters
                </h2>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-200">
                {activeCount > 0 && (
                    <div className="mb-6 flex justify-end">
                        <button onClick={onClear} className="text-xs text-red-600 hover:underline font-medium flex items-center gap-1">
                            <X size={12} /> Clear all ({activeCount})
                        </button>
                    </div>
                )}

                {loading && (
                    <div className="space-y-4 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                )}

                {!loading && enums && (
                    <div className="space-y-8">
                        <FilterSection 
                            title="Designation" 
                            options={enums.designation_options} 
                            selected={filters.designations} 
                            onChange={(val) => onToggle("designations", val)} 
                        />
                        <FilterSection 
                            title="Expertise Level" 
                            options={enums.expertise_levels.map((l:any) => l.value)}
                            labels={enums.expertise_levels.map((l:any) => l.label)}
                            selected={filters.levels} 
                            onChange={(val) => onToggle("levels", val)} 
                        />
                        <FilterSection 
                            title="Skills" 
                            options={enums.skills} 
                            selected={filters.skills} 
                            onChange={(val) => onToggle("skills", val)} 
                            limit={8}
                            searchable
                        />
                        <FilterSection 
                            title="Languages" 
                            options={enums.languages} 
                            selected={filters.languages} 
                            onChange={(val) => onToggle("languages", val)} 
                            limit={5}
                        />
                    </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50">
                <button 
                  onClick={onClose}
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
                >
                  Show Results
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
  );
}

// Helper Sub-component
const FilterSection = ({ 
    title, options, selected, onChange, limit, searchable, labels 
}: any) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [showAll, setShowAll] = useState(false);
    const [search, setSearch] = useState("");

    const displayedOptions = useMemo(() => {
        let filtered = options;
        if (searchable && search) {
            filtered = options.filter((opt: string) => opt.toLowerCase().includes(search.toLowerCase()));
        }
        if (limit && !showAll && !search) {
            return filtered.slice(0, limit);
        }
        return filtered;
    }, [options, limit, showAll, search, searchable]);

    return (
        <div className="border-b border-gray-100 pb-4 last:border-0">
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center justify-between w-full text-left mb-3 group"
            >
                <h3 className="font-bold text-gray-800 text-sm group-hover:text-indigo-600 transition-colors">{title}</h3>
                {isExpanded ? <ChevronUp size={16} className="text-gray-400"/> : <ChevronDown size={16} className="text-gray-400"/>}
            </button>

            {isExpanded && (
                <div className="space-y-2 animate-in slide-in-from-top-1 duration-200">
                    {searchable && (
                        <input 
                            type="text" 
                            placeholder={`Filter ${title}...`}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="text-text-primary w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg mb-2 focus:ring-1 focus:ring-indigo-500 outline-none"
                        />
                    )}
                    
                    <div className="flex flex-wrap gap-2">
                        {displayedOptions.map((opt: string) => {
                            const label = labels ? labels[options.indexOf(opt)] : opt;
                            const isActive = selected?.includes(opt);
                            return (
                                <button
                                    key={opt}
                                    onClick={() => onChange(opt)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                        isActive
                                            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                    }`}
                                >
                                    {label}
                                </button>
                            )
                        })}
                    </div>

                    {limit && options.length > limit && !search && (
                        <button 
                            onClick={() => setShowAll(!showAll)}
                            className="text-xs text-indigo-600 font-medium hover:underline mt-2 inline-block"
                        >
                            {showAll ? "Show less" : `+ ${options.length - limit} more`}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};