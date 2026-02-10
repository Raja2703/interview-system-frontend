"use client";

import { useState, useEffect, useRef, useMemo, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Search } from "lucide-react";
import { CustomSelectOption } from "@/types";

interface CustomSelectProps {
  value: string | number;
  onChange: (value: any) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  searchable?: boolean;
  hasError?: boolean;
  name?: string;
}

const CustomSelect = ({
  value,
  onChange,
  options,
  placeholder,
  className,
  disabled,
  searchable,
  hasError,
  name,
}: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        !containerRef.current?.contains(target) &&
        !dropdownRef.current?.contains(target)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen, searchable]);

  // Compute dropdown position (portal alignment)
  const updatePosition = () => {
    if (!buttonRef.current) return;

    const r = buttonRef.current.getBoundingClientRect();
    
    // Get actual dropdown height if available, otherwise estimate
    const dropdownHeight = dropdownRef.current?.offsetHeight || 
      (searchable ? 260 : Math.min(options.length * 45 + 20, 260));
    
    const spaceBelow = window.innerHeight - r.bottom;
    const spaceAbove = r.top;
    const gap = 4; // gap between button and dropdown

    let top;

    // Only flip upward if dropdown would overflow viewport AND there's more space above
    if (spaceBelow < dropdownHeight + gap && spaceAbove > spaceBelow) {
      top = r.top + window.scrollY - dropdownHeight - gap;
    } else {
      top = r.bottom + window.scrollY + gap;
    }

    setCoords({
      top,
      left: r.left + window.scrollX,
      width: r.width,
    });
  };

  useLayoutEffect(() => {
    if (!isOpen) return;
    updatePosition();

    // Small delay to recalculate after dropdown renders
    const timer = setTimeout(updatePosition, 10);

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, options.length, searchable]);

  const handleSelect = (val: any) => {
    onChange(val);
    setIsOpen(false);
    setSearchTerm("");
  };

  const getLabel = () => {
    if (!value) return placeholder || "Select...";
    const selected = options.find(
      (opt) => (typeof opt === "string" ? opt : opt.value) === value
    );
    if (!selected) return value;
    return typeof selected === "string" ? selected : selected.label;
  };

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.filter((opt) => {
      const label = typeof opt === "string" ? opt : opt.label;
      return label.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [options, searchTerm]);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        ref={buttonRef}
        name={name} // <--- Pass name to the button so querySelector finds it
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all outline-none text-left bg-white ${
          hasError
            ? "border-red-300 ring-2 ring-red-100"
            : "border-gray-200 hover:border-gray-300"
        } ${
          isOpen && !hasError ? "border-indigo-500 ring-4 ring-indigo-500/10" : ""
        } ${
          disabled
            ? "bg-gray-50 text-gray-400 cursor-not-allowed"
            : "cursor-pointer text-slate-900"
        }`}
      >
        <span className="truncate block">{getLabel()}</span>
        <ChevronDown
          size={16}
          className={`flex-shrink-0 ml-2 transition-transform ${
            isOpen ? "rotate-180" : ""
          } ${hasError ? "text-red-400" : "text-gray-400"}`}
        />
      </button>

      {isOpen &&
        !disabled &&
        coords &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "absolute",
              top: coords.top,
              left: coords.left,
              width: coords.width,
              zIndex: 9999,
            }}
            className="bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100"
          >
            {searchable && (
              <div className="p-2 border-b border-gray-100 bg-gray-50 sticky top-0">
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    ref={searchInputRef}
                    type="text"
                    className="text-slate-900 w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="max-h-[260px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent bg-white">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt, idx) => {
                  const optValue = typeof opt === "string" ? opt : opt.value;
                  const optLabel = typeof opt === "string" ? opt : opt.label;
                  const isSelected = optValue === value;

                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelect(optValue)}
                      className={`px-4 py-2.5 text-sm cursor-pointer flex items-center justify-between transition-colors ${
                        isSelected
                          ? "bg-indigo-50 text-indigo-700 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {optLabel}
                      {isSelected && <Check size={14} />}
                    </div>
                  );
                })
              ) : (
                <div className="px-4 py-8 text-sm text-gray-400 text-center">
                  No options found
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default CustomSelect;