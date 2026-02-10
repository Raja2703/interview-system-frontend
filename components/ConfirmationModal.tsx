"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Info, CheckCircle, X } from "lucide-react";

type ModalVariant = "danger" | "success" | "info";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  variant?: ModalVariant;
  confirmText?: string;
  cancelText?: string;
  isAlert?: boolean; // If true, only shows one button (like browser alert)
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  variant = "info",
  confirmText = "Confirm",
  cancelText = "Cancel",
  isAlert = false,
}: ConfirmationModalProps) {
  
  const getIcon = () => {
    switch (variant) {
      case "danger": return <AlertTriangle className="text-red-600" size={24} />;
      case "success": return <CheckCircle className="text-green-600" size={24} />;
      default: return <Info className="text-indigo-600" size={24} />;
    }
  };

  const getButtonStyles = () => {
    switch (variant) {
      case "danger": return "bg-red-600 hover:bg-red-700 focus:ring-red-200";
      case "success": return "bg-green-600 hover:bg-green-700 focus:ring-green-200";
      default: return "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-200";
    }
  };

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
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 transition-opacity"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-xl z-50 overflow-hidden border border-gray-100"
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full flex-shrink-0 ${
                  variant === 'danger' ? 'bg-red-50' : 
                  variant === 'success' ? 'bg-green-50' : 'bg-indigo-50'
                }`}>
                  {getIcon()}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>

              <div className="mt-6 flex gap-3 justify-end">
                {!isAlert && (
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
                  >
                    {cancelText}
                  </button>
                )}
                <button
                  onClick={() => {
                    if (onConfirm) onConfirm();
                    onClose();
                  }}
                  className={`px-4 py-2 text-sm font-bold text-white rounded-lg shadow-sm transition-all ${getButtonStyles()}`}
                >
                  {isAlert ? "Okay" : confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}