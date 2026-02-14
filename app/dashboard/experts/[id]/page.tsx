"use client";

import { use } from "react";
import { useTakersQuery } from "@/hooks/profiles/profiles.queries";
import { ArrowLeft, Star, Briefcase, Linkedin, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import BookInterviewModal from "@/components/dashboard/BookInterviewModal";

export default function ExpertDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: takers, isLoading } = useTakersQuery();

  // Find expert from cached list (Simplest approach without new API endpoint)
  const expert = takers?.results?.find((t: any) => t.id === Number(id));

  if (isLoading) return <div className="flex justify-center mt-20"><Loader2 className="animate-spin text-indigo-600" /></div>;
  if (!expert) return (
    <div className="mt-15 max-w-4xl mx-auto">
      <Link href="/dashboard/experts" className="inline-flex items-center text-gray-500 hover:text-indigo-600 mb-6 transition">
        <ArrowLeft size={18} className="mr-2" /> Back to Experts
      </Link>
      <div className="text-center mt-20 text-gray-500">Expert not found.</div>;
    </div>
  )

  return (
    <div className="mt-15 max-w-7xl">
      <Link href="/dashboard/experts" className="inline-flex items-center text-gray-500 hover:text-indigo-600 mb-6 transition">
        <ArrowLeft size={18} className="mr-2" /> Back to Experts
      </Link>

      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-bl-full -z-0 opacity-50"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
            <img 
                src={expert?.profile_picture_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${expert.name}`} 
                alt={expert?.name} 
                className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-md bg-white"
            />
            
            <div className="flex-grow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{expert?.name}</h1>
                        <p className="text-lg text-indigo-600 font-medium mt-1">{expert?.designation}</p>
                        {expert?.company && (
                            <p className="text-gray-500 flex items-center gap-2 mt-2">
                                <Briefcase size={16} /> {expert?.company}
                            </p>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-4">
                         <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">{expert.interviewer_profile?.credits_per_interview || "Credits not specified"}</p>
                            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Credits / Hr</p>
                         </div>
                         <button 
                            onClick={() => setIsModalOpen(true)}
                            className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-slate-200 transition transform hover:-translate-y-0.5 active:translate-y-0"
                         >
                            Book Interview
                         </button>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 mt-6">
                    {expert?.interviewer_profile?.expertise_areas?.map((tag:any, i:number) => (
                        <span key={i} className="px-3 py-1.5 bg-gray-50 text-gray-700 font-medium text-sm rounded-lg border border-gray-200">
                            {tag.area} <span className="text-gray-400 text-xs ml-1">| {tag.level}</span>
                        </span>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Left: About */}
         <div className="md:col-span-2 bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">About Me</h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {expert?.bio || "No bio provided."}
            </p>

            <div className="mt-8 pt-8 border-t border-gray-100 grid grid-cols-2 gap-4">
                 <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Experience</h4>
                    <p className="font-semibold text-gray-900">{expert?.interviewer_profile?.interviewing_experience_years ? expert?.interviewer_profile?.interviewing_experience_years + " Years Interviewing": 'Not specified'}</p>
                 </div>
                 <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Rating</h4>
                    <div className="flex items-center gap-1 font-bold text-gray-900">
                        <Star size={18} className="text-amber-500 fill-current" />
                        {expert?.interviewer_profile?.rating || "5.0"}
                    </div>
                 </div>
            </div>
         </div>

         {/* Right: Sidebar Info */}
         <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                 <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Linkedin size={20} className="text-blue-600"/> Socials
                 </h3>
                 {expert?.interviewer_profile?.linkedin_profile_url ? (
                    <a 
                        href={expert?.interviewer_profile?.linkedin_profile_url} 
                        target="_blank" 
                        className="text-sm text-blue-600 hover:underline truncate block"
                    >
                        LinkedIn Profile ↗
                    </a>
                 ) : (
                    <p className="text-sm text-gray-400">Not connected</p>
                 )}
            </div>

             <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
                 <h3 className="font-bold text-indigo-900 mb-2">Ready to prep?</h3>
                 <p className="text-indigo-700 text-sm mb-4">
                    Book a session now to get personalized feedback on your skills.
                 </p>
                 <button 
                    onClick={() => setIsModalOpen(true)}
                    className="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition"
                 >
                    Book Now
                 </button>
             </div>
         </div>
      </div>

      <BookInterviewModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        expertId={expert?.public_id}
        expertName={expert?.name}
      />
    </div>
  );
}