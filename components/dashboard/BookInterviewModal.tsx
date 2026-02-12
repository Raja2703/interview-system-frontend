"use client";

import { X, Plus, Trash2, Calendar, Loader2 } from "lucide-react";
import { useInterviewMutations } from "@/hooks/interviews/interviews.mutations";
import DateTimePickerComponent from "@/components/ui/DatetimePicker";
import type { Dayjs } from 'dayjs';
import { useForm } from '@tanstack/react-form';
import { interviewBookingTimeSlotSchema } from "@/types"

type ModalProps = {
  expertId: string;
  expertName: string;
  isOpen: boolean;
  onClose: () => void;
};

export default function BookInterviewModal({ expertId, expertName, isOpen, onClose }: ModalProps) {
  const { createRequestMutation } = useInterviewMutations();

  const form = useForm({
    defaultValues: {
      topic: "",
      message: "",
      duration: 60,
      slots: [null] as (Dayjs | null)[],
    },
    validators: {
      onChange: interviewBookingTimeSlotSchema, 
    },
    onSubmit: async ({ value }) => {
      // Format dayjs objects to ISO string with IST timezone
      const formattedSlots = value.slots
        .filter((slot): slot is Dayjs => slot !== null)
        .map(slot => slot.format('YYYY-MM-DDTHH:mm:ss') + '+05:30');

      await createRequestMutation.mutateAsync({
        receiver_id: expertId,
        time_slots: formattedSlots,
        topic: value.topic,
        message: value.message || "",
        duration_minutes: value.duration
      });

      onClose();
      form.reset();
    },
  });

  if (!isOpen) return null;

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
          <form 
            id="booking-form" 
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }} 
            className="space-y-5"
          >
            
            {/* Topic Field */}
            <form.Field
              name="topic"
              children={(field) => (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Interview Topic</label>
                  <input 
                    className={`text-gray-900 w-full px-4 py-2.5 rounded-xl border outline-none text-sm transition-all
                      ${field.state.meta.errors.length ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-200 focus:ring-2 focus:ring-indigo-500'}
                    `}
                    placeholder="e.g. System Design Mock"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  <div className="min-h-[20px]">
                    {field.state.meta.errors.length > 0 && (
                      <em className="text-xs text-red-500 mt-1 block">
                        {field.state.meta.errors.map(err => typeof err === 'string' ? err : err.message || String(err)).join(", ")}
                      </em>
                    )}
                  </div>
                </div>
              )}
            />

            {/* Duration Field */}
            <form.Field
              name="duration"
              children={(field) => (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Duration</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[30, 60, 90].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => field.handleChange(mins)}
                        className={`py-2 rounded-lg text-sm font-semibold border transition-all ${
                            field.state.value === mins 
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-md" 
                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {mins} min
                      </button>
                    ))}
                  </div>
                </div>
              )}
            />

            {/* Time Slots Field (Array) */}
            <form.Field
              name="slots"
              mode="array"
              children={(field) => (
                <div>
                   <div className="flex justify-between items-center mb-4">
                     <label className="block text-sm font-bold text-gray-700">Proposed Times (IST)</label>
                     <button 
                        type="button" 
                        onClick={() => field.pushValue(null)} 
                        className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                     >
                        <Plus size={14} /> Add Slot
                     </button>
                   </div>
                   
                   <div className="space-y-4">
                     {field.state.value.map((slot, idx) => (
                        <div key={idx} className="flex gap-2 items-start">
                            <div className="flex-grow">
                              <DateTimePickerComponent
                                value={slot}
                                onChange={(newValue) => {
                                    // Update specific index in array
                                    const newSlots = [...field.state.value];
                                    newSlots[idx] = newValue;
                                    field.handleChange(newSlots);
                                }}
                                label={`Time Slot ${idx + 1}`}
                              />
                            </div>
                            {field.state.value.length > 1 && (
                                <button 
                                  type="button" 
                                  onClick={() => field.removeValue(idx)} 
                                  className="text-gray-400 hover:text-red-500 p-2 mt-1 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>
                     ))}
                   </div>
                   
                   {/* Validation Error for Slots - Fixed Height Container */}
                   <div className="min-h-[44px] mt-2">
                     {field.state.meta.errors.length > 0 && (
                       <div className="text-xs text-red-500 font-medium bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                         {field.state.meta.errors.map(err => typeof err === 'string' ? err : err.message || String(err)).join(", ")}
                       </div>
                     )}
                   </div>
                   
                   <p className="text-xs text-gray-400">Times are sent in India Standard Time.</p>
                </div>
              )}
            />

            {/* Message Field */}
            <form.Field
              name="message"
              children={(field) => (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Message</label>
                  <textarea 
                    rows={3}
                    className="text-gray-900 w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none"
                    placeholder="Share any specific focus areas or questions..."
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            />

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
            
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <button 
                    type="submit"
                    form="booking-form"
                    disabled={!canSubmit || createRequestMutation.isPending}
                    className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {createRequestMutation.isPending || isSubmitting ? (
                        <Loader2 className="animate-spin" size={18} />
                    ) : (
                        <Calendar size={18} />
                    )}
                    Send Request
                </button>
              )}
            />
        </div>
      </div>
    </div>
  );
}