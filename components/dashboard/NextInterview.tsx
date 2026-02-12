"use client";

import React, { useState, useMemo } from 'react';
import Link from "next/link";
import { Clock, Video } from "lucide-react";
import { format, isToday, parseISO } from "date-fns";

interface NextInterviewProps {
    events: any[];
    currentUser: any;
    onJoin: (id: string) => void;
    isJoinPending: boolean;
}

const NextInterview = ({ events, currentUser, onJoin, isJoinPending }: NextInterviewProps) => {
    const nextInterview = useMemo(() => {
      if (!events) return null;
      // Filter for accepted events that have a time
      const upcoming = events.filter((e: any) => 
          e.status === 'accepted' && e.scheduled_time 
          // Note: Add '&& new Date(e.scheduled_time) > now' here if you want to hide past events
      );
      // Sort by time ascending
      return upcoming.sort((a: any, b: any) => 
          new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime()
      )[0];
  }, [events]);

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-full -z-0"></div>
        
        <div className="flex justify-between items-center mb-6 relative z-10">
            <h3 className="font-bold text-gray-900">Up Next</h3>
            {nextInterview ? (
                <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-lg">
                    {isToday(parseISO(nextInterview.scheduled_time)) ? "Today" : format(parseISO(nextInterview.scheduled_time), "MMM dd")}
                </span>
            ) : (
                <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">None</span>
            )}
        </div>
        
        {nextInterview ? (
            <>
                <div className="flex items-center gap-4 mb-6 relative z-10">
                    <div className="h-14 w-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center font-bold text-xl shadow-sm uppercase">
                        {currentUser.public_id == nextInterview.receiver_id 
                            ? nextInterview.sender_name?.charAt(0) 
                            : nextInterview.receiver_name?.charAt(0) || "U"}
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 text-lg truncate max-w-[150px]" title={nextInterview.receiver_name}>
                            {currentUser.public_id == nextInterview.receiver_id 
                                ? nextInterview.sender_name 
                                : nextInterview.receiver_name}
                        </h4>
                        <p className="text-sm text-gray-500">{nextInterview.topic}</p>
                        <p className="text-xs font-semibold text-indigo-600 flex items-center gap-1 mt-1 bg-indigo-50 w-fit px-2 py-0.5 rounded">
                            <Clock size={12} /> {format(parseISO(nextInterview.scheduled_time), "h:mm a")}
                        </p>
                    </div>
                </div>
                
                <button 
                    disabled={!nextInterview.is_joinable || isJoinPending}
                    onClick={() => { onJoin(nextInterview.id) }}
                    className={`hover:cursor-pointer w-full py-3 text-white font-semibold rounded-xl transition shadow-lg flex justify-center items-center gap-2 relative z-10 ${
                    nextInterview.is_joinable && !isJoinPending
                        ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
                        : "bg-gray-300 cursor-not-allowed shadow-gray-100"
                    }`}
                >
                    <Video size={18} /> {isJoinPending ? "Joining..." : "Join Meeting Room"}
                </button>
            </>
        ) : (
            <div className="text-center py-8 relative z-10">
                <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock className="text-gray-400" size={24} />
                </div>
                <p className="text-gray-500 text-sm">No confirmed interviews.</p>
                <Link href="/dashboard/experts" className="text-indigo-600 font-semibold text-sm mt-2 block hover:underline">
                    Book an Expert
                </Link>
            </div>
        )}
    </div>
  );
};

export default NextInterview;