"use client";

import Link from "next/link";
import { Briefcase, Star } from "lucide-react";

export default function ExpertCard({ expert, onBook }: { expert: any, onBook: () => void }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col hover:shadow-lg hover:border-indigo-100 transition-all duration-300 group">
        
        <Link href={`/dashboard/experts/${expert.id}`} className="flex gap-4 mb-4 cursor-pointer">
            <img 
                src={expert.profile_picture_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${expert.name}`} 
                alt={expert.name} 
                className="w-14 h-14 rounded-full bg-gray-50 border border-gray-100 object-cover group-hover:scale-105 transition-transform" 
            />
            <div>
                <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition">{expert.name || "Unknown user"}</h3>
                <p className="text-indigo-600 font-medium text-sm line-clamp-1">{expert.designation || "Interviewer"}</p>
                {expert.company && (
                    <p className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
                        <Briefcase size={12} /> {expert.company}
                    </p>
                )}
            </div>
        </Link>

        <div className="flex flex-wrap gap-2 mb-4 h-16 overflow-hidden content-start">
            {expert.interviewer_profile?.expertise_areas?.slice(0, 4).map((tag: any, idx: number) => (
            <span key={idx} className="px-2.5 py-1 bg-gray-50 border border-gray-100 text-gray-600 text-xs font-semibold rounded-lg group-hover:bg-gray-100 transition-colors">
                {tag.area} <span className="text-gray-400 font-normal">| {tag.level}</span>
            </span>
            ))}
            {(expert.interviewer_profile?.expertise_areas?.length || 0) > 4 && (
                <span className="px-2.5 py-1 bg-gray-50 border border-gray-100 text-gray-400 text-xs font-semibold rounded-lg">
                    +{expert.interviewer_profile.expertise_areas.length - 4}
                </span>
            )}
        </div>

        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
            <div>
                <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-gray-900">{expert.interviewer_profile?.credits_per_interview}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Credits</span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                    <Star size={12} className="text-amber-400 fill-current" />
                    <span className="text-xs font-bold text-gray-700">{expert.interviewer_profile?.rating || "5.0"}</span>
                </div>
            </div>
            
            <button 
                onClick={onBook}
                className="px-5 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
            >
                Book
            </button>
        </div>
    </div>
  );
}