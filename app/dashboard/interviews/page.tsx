"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Check, X, Calendar, Clock, Video, Loader2, AlertCircle, Ban, ArrowUpRight, ArrowDownLeft, MessageSquare, Lock } from "lucide-react";
import { useInterviewRequestsQuery, useInterviewRequestDetailQuery } from "@/hooks/interviews/interviews.queries";
import { useInterviewMutations } from "@/hooks/interviews/interviews.mutations";
import { useUserQuery } from "@/hooks/user/user.queries"; 
import { format } from "date-fns";
import ConfirmationModal from "@/components/ConfirmationModal";

// --- Helpers ---
const formatDate = (d: string) => { try { return format(new Date(d), "MMM dd"); } catch { return ""; } };
const formatFullDate = (d: string) => { try { return format(new Date(d), "MMM dd, yyyy"); } catch { return ""; } };
const formatTime = (d: string) => { try { return format(new Date(d), "h:mm a"); } catch { return ""; } };

// --- Types ---
type TimeOption = { id: string; proposed_time: string; is_selected: boolean };
type Request = {
  id: string; 
  sender_id: string;
  sender_name: string;
  receiver_id: string;
  receiver_name: string;
  topic: string;
  message?: string;
  duration_minutes: number;
  status: "pending" | "accepted" | "rejected" | "cancelled" | "completed";
  time_options: TimeOption[];
  selected_time_option?: TimeOption;
  scheduled_time: string;
  credits: number;
  is_joinable: boolean;
  created_at: string;
  role?: string; 
};

// =========================================================
// SUB-COMPONENT: Rejection Modal
// =========================================================
const RejectionModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isPending 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: (reason: string) => void; 
  isPending: boolean; 
}) => {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="bg-red-50 p-4 border-b border-red-100 flex items-center gap-3">
            <div className="bg-white p-2 rounded-full text-red-600 shadow-sm">
                <AlertCircle size={20} />
            </div>
            <h3 className="font-bold text-gray-900">Reject Interview Request</h3>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
            <p className="text-sm text-gray-600">
                Please provide a reason for rejecting this request. This will be sent to the requester.
            </p>
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Reason</label>
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g., Scheduling conflicts, not a good fit..."
                    className="text-text-primary w-full p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none resize-none h-24"
                />
            </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
            <button 
                onClick={onClose}
                disabled={isPending}
                className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition text-sm"
            >
                Cancel
            </button>
            <button 
                onClick={() => onConfirm(reason)}
                disabled={isPending || !reason.trim()}
                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition text-sm flex items-center gap-2"
            >
                {isPending ? <Loader2 className="animate-spin" size={16} /> : <X size={16} />}
                Reject Request
            </button>
        </div>
      </div>
    </div>
  );
};

// =========================================================
// SUB-COMPONENT: Individual Pending Request Card
// =========================================================
const PendingRequestCard = ({ requestSummary }: { requestSummary: Request }) => {
  const { data: detail, isLoading } = useInterviewRequestDetailQuery(requestSummary.id);
  const { acceptMutation, rejectMutation } = useInterviewMutations();
  
  // Local State
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    variant: "info" as "info" | "danger" | "success",
    isAlert: false, // true = like alert(), false = like confirm()
    onConfirm: () => {}, // The function to run if they click "Yes"
  });

  const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

  if (isLoading) return <div className="p-6 border rounded-2xl bg-gray-50 flex justify-center"><Loader2 className="animate-spin text-gray-400" /></div>;
  if (!detail) return null;

  const handleAccept = () => {
    if (!selectedSlotId) {
      setModalConfig({
        isOpen: true,
        title: "Selection Required",
        message: "Please select a time slot before accepting the interview.",
        variant: "info",
        isAlert: true, // Only shows "Okay" button
        onConfirm: () => {} // No action needed
      });
      return;
    }

    const slot = detail.time_options.find((t: TimeOption) => t.id === selectedSlotId);
    const timeDisplay = slot ? `${formatFullDate(slot.proposed_time)} at ${formatTime(slot.proposed_time)}` : "selected time";

    setModalConfig({
      isOpen: true,
      title: "Confirm Interview",
      message: `Are you sure you want to confirm the interview for ${timeDisplay}?`,
      variant: "success",
      isAlert: false,
      onConfirm: () => {
        acceptMutation.mutate({ uuid: detail.id, selected_time_option_id: selectedSlotId });
      }
    });
  };

  const handleConfirmReject = (reason: string) => {
    rejectMutation.mutate(
        { uuid: detail.id, reason: reason || "No reason provided" },
        {
            onSuccess: () => setIsRejectModalOpen(false),
        }
    );
  };

  return (
    <>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-4 border-l-4 border-l-amber-400">
            
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <ArrowDownLeft size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900">{detail?.topic}</h3>
                    <p className="text-sm text-gray-500">From: <span className="font-medium text-gray-700">{detail.sender.name}</span></p>
                    <p className="text-xs text-gray-400 mt-0.5">{detail?.duration_minutes} mins</p>
                </div>
            </div>

            {/* Message */}
            {detail.message && (
                <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 italic border border-gray-100 flex gap-2">
                    <MessageSquare size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
                    <span>"{detail?.message}"</span>
                </div>
            )}

            {/* Time Slots */}
            <div className="w-full">
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Select a Time:</p>
                <div className="flex flex-wrap gap-2">
                    {detail.time_options?.map((slot: TimeOption) => {
                        const isSelected = selectedSlotId === slot.id;
                        return (
                            <button
                                key={slot.id}
                                onClick={() => setSelectedSlotId(slot.id)}
                                className={`flex flex-col items-center justify-center px-4 py-2 rounded-xl border transition-all text-sm ${
                                    isSelected 
                                    ? "bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-200 shadow-md" 
                                    : "bg-white text-gray-700 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50"
                                }`}
                            >
                                <span className="font-bold">{formatDate(slot?.proposed_time)}</span>
                                <span className={`text-xs ${isSelected ? "text-indigo-200" : "text-gray-500"}`}>
                                    {formatTime(slot?.proposed_time)}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 w-full pt-2 border-t border-gray-100">
                <button 
                    onClick={() => setIsRejectModalOpen(true)}
                    className="flex-1 px-4 py-2.5 bg-white border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition text-sm"
                    disabled={rejectMutation?.isPending}
                >
                    Reject
                </button>
                <button 
                    onClick={handleAccept} 
                    className={`flex-1 px-4 py-2.5 text-white font-semibold rounded-xl transition text-sm flex justify-center items-center gap-2 ${
                        selectedSlotId 
                        ? "bg-indigo-600 hover:bg-indigo-700 shadow-md" 
                        : "bg-gray-300 cursor-not-allowed"
                    }`}
                    disabled={!selectedSlotId || acceptMutation?.isPending}
                >
                    {acceptMutation?.isPending ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                    Accept
                </button>
            </div>
        </div>

        {/* Modal Injection */}
        <RejectionModal 
            isOpen={isRejectModalOpen}
            onClose={() => setIsRejectModalOpen(false)}
            onConfirm={handleConfirmReject}
            isPending={rejectMutation.isPending}
        />

        <ConfirmationModal
            isOpen={modalConfig.isOpen}
            onClose={closeModal}
            title={modalConfig.title}
            message={modalConfig.message}
            variant={modalConfig.variant}
            isAlert={modalConfig.isAlert}
            onConfirm={modalConfig.onConfirm}
            confirmText={modalConfig.variant === 'danger' ? "Yes, Cancel" : "Yes, Confirm"}
        />
    </>
  );
};

// =========================================================
// MAIN COMPONENT
// =========================================================
export default function InterviewsPage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") as "history" | "pending" | "accepted" | "rejected" | null;

    const [activeTab, setActiveTab] = useState<"history" | "pending" | "accepted" | "rejected">(
        initialTab && ["history", "pending", "accepted", "rejected"].includes(initialTab) 
        ? initialTab 
        : "history"
    );  
    
  // Sync state if URL param changes (e.g. clicking notification while already on page)
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["history", "pending", "accepted", "rejected"].includes(tabParam)) {
        setActiveTab(tabParam as any);
    }
  }, [searchParams]);

  const { data: interviews, isLoading: requestLoading, isError } = useInterviewRequestsQuery();
  const { getUserProfileQuery } = useUserQuery();
  const { data: userProfile, isLoading: isUserLoading } = getUserProfileQuery;
  const { cancelMutation, joinMutation } = useInterviewMutations();

  const isLoading = requestLoading || isUserLoading;
  const currentUserId = userProfile?.public_id; 

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    variant: "info" as "info" | "danger" | "success",
    isAlert: false, // true = like alert(), false = like confirm()
    onConfirm: () => {}, // The function to run if they click "Yes"
  });

  const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

  const handleCancel = (uuid: string) => {
    setModalConfig({
      isOpen: true,
      title: "Cancel Request",
      message: "Are you sure you want to cancel this sent request? This action cannot be undone.",
      variant: "danger",
      isAlert: false,
      onConfirm: () => {
        cancelMutation.mutate({ uuid, reason: "Changed mind" });
      }
    });
  };

  // --- Filter Logic ---
  const allRequests: Request[] = interviews?.results || [];
  
  const pendingIncoming = allRequests.filter(r => r.status === "pending" && String(r.receiver_id) === String(currentUserId));
  const scheduledRequests = allRequests.filter(r => r.status === "accepted");
  const rejectedRequests = allRequests.filter(r => r.status === "rejected");
 
  const historyRequests = allRequests.filter(r => {
    const isOutgoingPending = r.status === "pending" && String(r.sender_id) === String(currentUserId);
    const isPast = ["cancelled", "completed"].includes(r.status) && String(r.sender_id) === String(currentUserId);
    // const isMyRejected = r.status === "rejected" && String(r.sender_id) === String(currentUserId);
    return isOutgoingPending || isPast; 
  });

  if (isLoading) return <div className="mt-20 flex justify-center"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>;
  if (isError) return <div className="mt-20 text-center text-red-500">Failed to load interviews.</div>;

  return (
    <div className="mt-15 space-y-6 max-w-5xl mx-auto">
      {/* Header & Tabs */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Interviews</h1>
           <p className="text-gray-500 text-sm">Manage your schedule and requests.</p>
        </div>
        <div className="flex flex-wrap p-1 bg-gray-100 rounded-xl">
          {[
            { id: "history", label: "My Requests" },
            { id: "pending", label: `Pending (${pendingIncoming.length})` },
            { id: "accepted", label: "Scheduled" },
            { id: "rejected", label: "Rejected" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                activeTab === tab.id ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        
        {/* --- 1. PENDING (Uses Sub-Component for Detail Query) --- */}
        {activeTab === "pending" && (
            pendingIncoming?.length === 0 ? <EmptyState message="No pending requests to accept." /> : (
                pendingIncoming.map((req) => (
                    <PendingRequestCard key={req.id} requestSummary={req} />
                ))
            )
        )}

        {/* --- 2. HISTORY --- */}
        {activeTab === "history" && (
             historyRequests.length === 0 ? <EmptyState message="No request history found." /> : (
                historyRequests.map((req) => {
                    const isOutgoingPending = req.status === 'pending';
                    return (
                        <div key={req.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className={`h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 ${isOutgoingPending ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                    {isOutgoingPending ? <ArrowUpRight size={20} /> : <Calendar size={20} />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{req.topic}</h3>
                                    <p className="text-sm text-gray-500">
                                        {isOutgoingPending ? `Sent to: ${req.receiver_name}` : `Role: ${req.role || 'User'}`}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                                            req.status === 'pending' ? 'bg-blue-100 text-blue-700' : 
                                            req.status === 'cancelled' ? 'bg-gray-100 text-gray-600' : 
                                            req.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                        }`}>
                                            {req.status}
                                        </span>
                                        <span className="text-xs text-gray-400">{formatFullDate(req.created_at)}</span>
                                    </div>
                                </div>
                            </div>
                            {isOutgoingPending && (
                                <button onClick={() => handleCancel(req.id)} className="px-4 py-2 border border-red-200 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition text-sm flex items-center gap-2">
                                    <Ban size={14} /> Cancel
                                </button>
                            )}
                        </div>
                    )
                })
             )
        )}

        {/* --- 3. SCHEDULED --- */}
        {activeTab === "accepted" && (
             scheduledRequests.length === 0 ? <EmptyState message="No scheduled interviews." /> : (
                scheduledRequests.map((req) => {
                    const isJoiningThis = joinMutation.isPending && joinMutation.variables === req.id;
                    const confirmed = req.scheduled_time;
                    return (
                        <div key={req.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 border-l-4 border-l-green-500">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                                    <Video size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{req.topic}</h3>
                                    {req.is_joinable && (
                                        <span className="animate-pulse px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded-full uppercase">
                                            Live Now
                                        </span>
                                    )}
                                    <p className="text-sm text-gray-500">
                                        {String(req.sender_id) === String(currentUserId) 
                                            ? `With: ${req.receiver_name}` 
                                            : `With: ${req.sender_name}`}
                                    </p>
                                    {confirmed && (
                                        <div className="flex items-center gap-3 mt-1 text-xs text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded w-fit">
                                            <Calendar size={12}/> {formatFullDate(confirmed)} • <Clock size={12}/> {formatTime(confirmed)}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button disabled={!req.is_joinable || isJoiningThis} onClick={() => joinMutation.mutate(req.id)} 
                                className={`w-full md:w-auto px-6 py-2 font-medium rounded-xl transition shadow-md flex items-center justify-center gap-2 ${
                                    req.is_joinable && !isJoiningThis
                                    ? "bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer" 
                                    : "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                                }`}>
                                    {isJoiningThis ? (
                                          "Joining..."
                                      ) : req.is_joinable ? (
                                          <>
                                          <Video size={16} /> Join Now
                                          </>
                                      ) : (
                                          <>
                                          <Lock size={16} /> Not Started
                                          </>
                                      )
                                    }
                            </button>
                        </div>
                    )
                })
            )
        )}

        {/* --- 4. REJECTED --- */}
        {activeTab === "rejected" && (
             rejectedRequests.length === 0 ? <EmptyState message="No rejected requests." /> : (
                rejectedRequests.map((req) => (
                    <div key={req.id} className="bg-white p-4 rounded-xl border border-gray-200 opacity-75 flex items-center gap-4">
                        <div className="h-10 w-10 bg-red-50 text-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <X size={18} />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800 text-sm">{req.topic}</h4>
                            <p className="text-xs text-gray-500">
                                {String(req.sender_id) === String(currentUserId) 
                                    ? `To: ${req.receiver_name} (Rejected)` 
                                    : `From: ${req.sender_name} (You rejected)`}
                            </p>
                        </div>
                    </div>
                ))
             )
        )}
      </div>
      
      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={modalConfig.title}
        message={modalConfig.message}
        variant={modalConfig.variant}
        isAlert={modalConfig.isAlert}
        onConfirm={modalConfig.onConfirm}
        confirmText={modalConfig.variant === 'danger' ? "Yes, Cancel" : "Yes, Confirm"}
      />
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 border-dashed">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="text-gray-400" size={32} />
            </div>
            <h3 className="text-gray-900 font-medium text-sm">{message}</h3>
        </div>
    );
}