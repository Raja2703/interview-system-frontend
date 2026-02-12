"use client";

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  Video, 
  MessageSquare 
} from "lucide-react";
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, 
  isSameDay, isToday, parseISO 
} from "date-fns";

// --- Helper: Status Colors ---
const getStatusColor = (status: string) => {
    switch (status) {
        case "accepted": return "bg-green-100 border-green-200 text-green-700";
        case "pending": return "bg-amber-100 border-amber-200 text-amber-700";
        case "completed": return "bg-blue-100 border-blue-200 text-blue-700";
        case "rejected": return "bg-red-50 border-red-100 text-red-500 decoration-red-500/30 line-through";
        case "cancelled": return "bg-slate-100 border-slate-200 text-slate-500 decoration-slate-500/50 line-through";
        case "not attended": return "bg-orange-50 border-orange-200 text-orange-600 border-dashed";
        default: return "bg-gray-50 border-gray-200 text-gray-600";
    }
};

interface CalendarProps {
    events: any[];
    currentUser: any;
    onJoin: (id: string) => void;
    isJoinPending: boolean;
}

const Calendar = ({ events, currentUser, onJoin, isJoinPending }: CalendarProps) => {
  const router = useRouter(); 
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dayDetails, setDayDetails] = useState<{ date: Date, events: any[] } | null>(null);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Memoize event mapping
  const eventsByDate = useMemo(() => {
    const map: Record<string, any[]> = {};
    if (events) {
        events.forEach((event: any) => {
            const timeStr = event.scheduled_time || event.created_at;
            if (timeStr) {
                const dateObj = parseISO(timeStr);
                const dateKey = format(dateObj, "yyyy-MM-dd");
                if (!map[dateKey]) map[dateKey] = [];
                map[dateKey].push(event);
            }
        });
    }
    return map;
  }, [events]);

  const handleFeedbackClick = (interviewId: string) => {
    router.push(`/feedback/${interviewId}?role=interviewer`);
  };

  return (
    <>
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    {format(currentDate, "MMMM yyyy")}
                    <span className="text-xs font-normal text-gray-400 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">Month View</span>
                </h2>
                <div className="flex gap-1">
                    <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition">
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition">
                        Today
                    </button>
                    <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50 flex-shrink-0">
                {weekDays.map(day => (
                    <div key={day} className="py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 flex-1 auto-rows-fr min-h-0">
                {calendarDays.map((day) => {
                    const dateKey = format(day, "yyyy-MM-dd");
                    const dayEvents = eventsByDate[dateKey] || [];
                    const isCurrentMonth = isSameMonth(day, monthStart);
                    const isSelected = isSameDay(day, selectedDate);
                    const isTodayDate = isToday(day);
                    
                    const visibleEvents = dayEvents.slice(0, 1);
                    const hiddenCount = dayEvents.length - 1;

                    // Check for pending feedback on this specific day
                    const hasPendingFeedback = dayEvents.some((event: any) => 
                        event.status === 'completed' && 
                        event.has_pending_feedback && 
                        currentUser.public_id === event.receiver_id
                    );

                    return (
                        <div 
                            key={day.toString()} 
                            onClick={() => {
                                setSelectedDate(day);
                                setDayDetails({ date: day, events: dayEvents });
                            }}
                            className={`
                                relative border-b border-r border-gray-100 p-2 transition-all cursor-pointer group hover:bg-gray-50 flex flex-col gap-1 min-h-0
                                ${!isCurrentMonth ? "bg-gray-50/30 text-gray-300" : "text-gray-700"}
                                ${isSelected ? "bg-indigo-50/30" : ""}
                            `}
                        >
                            <div className="flex justify-between items-start mb-1 flex-shrink-0">
                                <span className={`
                                    text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full
                                    ${isTodayDate ? "bg-indigo-600 text-white shadow-md" : ""}
                                    ${isSelected && !isTodayDate ? "text-indigo-600" : ""}
                                `}>
                                    {format(day, "d")}
                                </span>

                                {/* ORANGE DOT INDICATOR */}
                                {hasPendingFeedback && (
                                    <span 
                                        className="h-2 w-2 rounded-full bg-amber-500 shadow-sm" 
                                        title="Pending Feedback" 
                                    />
                                )}
                            </div>

                            <div className="flex-1 flex flex-col gap-1 overflow-hidden">
                                {visibleEvents.map((event: any) => (
                                    <div 
                                        key={event.id} 
                                        className={`px-1.5 py-0.5 rounded border text-[13px] font-semibold truncate transition-colors ${getStatusColor(event.status)}`}
                                        title={`${event.topic} - ${event.status}`}
                                    >
                                        {event.topic}
                                    </div>
                                ))}
                                {hiddenCount > 0 && (
                                    <span className="mt-auto text-[13px] font-bold text-gray-500 bg-gray-100 rounded px-1.5 py-0.5 text-center w-full block">
                                        +{hiddenCount} more
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Modal */}
        {dayDetails && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <div>
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <CalendarIcon size={18} className="text-indigo-600" />
                            {format(dayDetails.date, "EEEE, MMMM do")}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">{dayDetails.events.length} Interviews scheduled</p>
                        </div>
                        <button 
                        onClick={() => setDayDetails(null)}
                        className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="p-4 max-h-[60vh] overflow-y-auto">
                        {dayDetails.events.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">No events for this day.</div>
                        ) : (
                            <div className="space-y-3">
                                {dayDetails.events.map((event: any) => {
                                    // Logic Checks
                                    const isInterviewer = currentUser.public_id === event.receiver_id;
                                    const isCompleted = event.status === "completed";
                                    const showFeedback = event.has_pending_feedback && isInterviewer && isCompleted;

                                    return (
                                        <div key={event.id} className="p-4 rounded-2xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className={`h-2 w-2 rounded-full ${event.status === 'accepted' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                                    <span className="font-bold text-gray-900 text-sm">{event.topic}</span>
                                                </div>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${getStatusColor(event.status)}`}>
                                                    {event.status}
                                                </span>
                                            </div>
                                            
                                            <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                                                <div className="flex items-center gap-1">
                                                    <Clock size={12} />
                                                    {event.scheduled_time ? format(parseISO(event.scheduled_time), "h:mm a") : "TBD"}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Users size={12} />
                                                    {currentUser.public_id == event.receiver_id ? event.sender_name : event.receiver_name || "Unknown User"}
                                                </div>
                                            </div>

                                            {/* JOIN BUTTON */}
                                            {event.is_joinable && (
                                                <button 
                                                    disabled={!event.is_joinable || isJoinPending} 
                                                    onClick={() => onJoin(event.id)} 
                                                    className={`hover:cursor-pointer w-full py-2 text-sm text-white font-semibold rounded-xl transition shadow-lg flex justify-center items-center gap-2 relative z-10 ${
                                                    event.is_joinable && !isJoinPending
                                                        ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
                                                        : "bg-gray-300 cursor-not-allowed shadow-gray-100"
                                                    }`}
                                                >
                                                    <Video size={14} /> {isJoinPending ? "Joining..." : "Join Now"}
                                                </button>
                                            )}

                                            {/* FEEDBACK BUTTON */}
                                            {showFeedback && (
                                                <button 
                                                    onClick={() => handleFeedbackClick(event.id)} 
                                                    className="w-full mt-2 py-2 bg-amber-500 text-white text-xs font-bold rounded-lg hover:bg-amber-600 transition flex items-center justify-center gap-2"
                                                >
                                                    <MessageSquare size={14} /> Give Feedback
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
    </>
  );
};

export default Calendar;