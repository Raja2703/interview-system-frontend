"use client";

import { useState } from "react";
import { 
  MessageCircleQuestion, 
  X, 
  Send, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Mail, 
  FileText 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Mock Data for FAQs ---
const FAQS = [
  {
    question: "How do I book an expert?",
    answer: "You can book an expert by browsing the 'Find Experts' page, selecting a profile, and clicking the 'Book' button to choose a time slot."
  },
  {
    question: "What happens if I miss an interview?",
    answer: "If you miss a scheduled interview, please contact support immediately. Depending on the cancellation policy, you may be able to reschedule."
  },
  {
    question: "How do I update my profile skills?",
    answer: "Go to your Profile settings, scroll to the 'Skills' section, and add or remove skills as needed. Don't forget to save changes."
  },
  {
    question: "Can I request a refund?",
    answer: "Refunds are processed on a case-by-case basis. Please use the contact form here to submit a refund request with your booking ID."
  }
];

export default function HelpWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"faq" | "contact">("faq");

  return (
    <>
      {/* --- FLOATING BUTTON --- */}
      <button 
        className="fixed bottom-8 right-8 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105 z-50 flex items-center group"
        onClick={() => setIsOpen(true)} 
      >
        <MessageCircleQuestion size={24} />
        <span className="max-w-0 overflow-hidden ml-0 group-hover:ml-2 group-hover:max-w-xs transition-all duration-300 ease-in-out font-medium whitespace-nowrap">
          Help & Support
        </span>
      </button>

      {/* --- SLIDE-OVER DRAWER --- */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            
            {/* Drawer Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white shadow-2xl z-50 flex flex-col border-l border-gray-100"
            >
              {/* Header */}
              <div className="p-6 bg-indigo-600 text-white flex items-center justify-between shadow-md">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <MessageCircleQuestion className="opacity-80" /> Help Center
                  </h2>
                  <p className="text-indigo-100 text-sm mt-1">We are here to assist you.</p>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-100">
                <button
                  onClick={() => setActiveTab("faq")}
                  className={`flex-1 py-4 text-sm font-semibold transition-colors flex items-center justify-center gap-2 border-b-2 ${
                    activeTab === "faq" 
                      ? "border-indigo-600 text-indigo-600 bg-indigo-50/50" 
                      : "border-transparent text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <FileText size={16} /> FAQs
                </button>
                <button
                  onClick={() => setActiveTab("contact")}
                  className={`flex-1 py-4 text-sm font-semibold transition-colors flex items-center justify-center gap-2 border-b-2 ${
                    activeTab === "contact" 
                      ? "border-indigo-600 text-indigo-600 bg-indigo-50/50" 
                      : "border-transparent text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <Mail size={16} /> Contact Support
                </button>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
                {activeTab === "faq" ? <FAQSection /> : <ContactForm />}
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// --- SUB-COMPONENT: FAQ List ---
function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [search, setSearch] = useState("");

  const filteredFaqs = FAQS.filter(f => 
    f.question.toLowerCase().includes(search.toLowerCase()) || 
    f.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input 
          type="text" 
          placeholder="Search for answers..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-text-primary w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm transition shadow-sm"
        />
      </div>

      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No results found.</p>
        ) : (
          filteredFaqs.map((faq, idx) => (
            <div 
              key={idx} 
              className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden ${
                openIndex === idx ? "border-indigo-200 shadow-md" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <button 
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full text-left p-4 flex items-center justify-between font-semibold text-gray-800 text-sm"
              >
                {faq.question}
                {openIndex === idx ? <ChevronUp size={16} className="text-indigo-600" /> : <ChevronDown size={16} className="text-gray-400" />}
              </button>
              <AnimatePresence>
                {openIndex === idx && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-2"
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>
      
      <div className="bg-indigo-50 p-4 rounded-xl text-center">
        <p className="text-xs text-indigo-800 font-medium mb-2">Can't find what you're looking for?</p>
        <p className="text-xs text-indigo-600">Switch to the "Contact Support" tab to send us a message.</p>
      </div>
    </div>
  );
}

// --- SUB-COMPONENT: Contact Form ---
function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
    }, 1500);
  };

  if (isSent) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-6 animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
          <Send size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
        <p className="text-gray-500 text-sm mb-6">
          Thanks for reaching out. Our support team will get back to you within 24 hours.
        </p>
        <button 
          onClick={() => setIsSent(false)}
          className="text-indigo-600 font-semibold text-sm hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Topic</label>
        <select className="text-text-primary  w-full p-3 bg-white rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition">
          <option>General Inquiry</option>
          <option>Technical Issue</option>
          <option>Billing & Refunds</option>
          <option>Report a User</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Message</label>
        <textarea 
          required
          rows={6}
          placeholder="Describe your issue in detail..."
          className="text-text-primary  w-full p-3 bg-white rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition resize-none"
        ></textarea>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Email (for updates)</label>
        <input 
          type="email" 
          required
          placeholder="your@email.com"
          className="text-text-primary w-full p-3 bg-white rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
        />
      </div>

      <button 
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
      >
        {isSubmitting ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            Sending...
          </>
        ) : (
          <>
            <Send size={18} /> Send Message
          </>
        )}
      </button>
    </form>
  );
}