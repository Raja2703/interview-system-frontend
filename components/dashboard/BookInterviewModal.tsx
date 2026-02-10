"use client";

import { useState } from "react";
import { X, Plus, Trash2, Calendar, Loader2 } from "lucide-react";
import { useInterviewMutations } from "@/hooks/interviews/interviews.mutations";

type ModalProps = {
  expertId: string;
  expertName: string;
  isOpen: boolean;
  onClose: () => void;
};

export default function BookInterviewModal({ expertId, expertName, isOpen, onClose }: ModalProps) {
  const { createRequestMutation } = useInterviewMutations();
  
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [duration, setDuration] = useState(60);
  const [slots, setSlots] = useState<string[]>([""]); 

  if (!isOpen) return null;

  const handleSlotChange = (index: number, value: string) => {
    const newSlots = [...slots];
    newSlots[index] = value;
    setSlots(newSlots);
  };

  const addSlot = () => setSlots([...slots, ""]);
  
  const removeSlot = (index: number) => {
    const newSlots = slots.filter((_, i) => i !== index);
    setSlots(newSlots);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
        
    // --- FIX: FORMAT DATE TO IST ---
    // Input value is "YYYY-MM-DDThh:mm" (Local browser time)
    // We append ":00+05:30" to explicitly tell backend this is IST
    const formattedSlots = slots
        .filter(s => s)
        .map(s => `${s}:00+05:30`); 

    if (formattedSlots.length === 0) {
        alert("Please propose at least one time slot.");
        return;
    }

    createRequestMutation.mutate({
        receiver_id: expertId,
        time_slots: formattedSlots,
        topic,
        message,
        duration_minutes: duration
    }, {
        onSuccess: () => {
            onClose();
            setTopic("");
            setMessage("");
            setSlots([""]);
        }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="font-bold text-lg text-gray-900">Book Interview</h3>
            <p className="text-sm text-gray-500">with {expertName}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200 transition">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto">
          <form id="booking-form" onSubmit={handleSubmit} className="space-y-5">
            
            {/* Topic */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Interview Topic</label>
              <input 
                required
                className="text-gray-900 w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                placeholder="e.g. System Design Mock"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Duration</label>
              <div className="grid grid-cols-3 gap-3">
                {[30, 60, 90].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDuration(mins)}
                    className={`py-2 rounded-lg text-sm font-semibold border transition-all ${
                        duration === mins 
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-md" 
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {mins} min
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slots */}
            <div>
               <div className="flex justify-between items-center mb-2">
                 <label className="block text-sm font-bold text-gray-700">Proposed Times (IST)</label>
                 <button type="button" onClick={addSlot} className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
                    <Plus size={14} /> Add Slot
                 </button>
               </div>
               <div className="space-y-2">
                 {slots.map((slot, idx) => (
                    <div key={idx} className="flex gap-2">
                        <input 
                            type="datetime-local"
                            required={idx === 0}
                            value={slot}
                            onChange={(e) => handleSlotChange(idx, e.target.value)}
                            className="flex-grow px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-gray-600"
                        />
                        {slots.length > 1 && (
                            <button type="button" onClick={() => removeSlot(idx)} className="text-gray-400 hover:text-red-500 p-2">
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>
                 ))}
               </div>
               <p className="text-xs text-gray-400 mt-2">Times are sent in India Standard Time.</p>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Message</label>
              <textarea 
                rows={3}
                className="text-gray-900 w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none"
                placeholder="Share any specific focus areas or questions..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
            <button 
                type="button"
                onClick={onClose} 
                className="px-5 py-2.5 text-gray-600 font-semibold hover:bg-gray-200 rounded-xl transition"
            >
                Cancel
            </button>
            <button 
                type="submit"
                form="booking-form"
                disabled={createRequestMutation.isPending}
                className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 flex items-center gap-2 disabled:opacity-70"
            >
                {createRequestMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <Calendar size={18} />}
                Send Request
            </button>
        </div>
      </div>
    </div>
  );
}