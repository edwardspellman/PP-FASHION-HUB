import React from 'react';
import { Check, X } from 'lucide-react';

export default function Toast({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2.5 bg-neutral-950 text-white px-4 py-3 border border-neutral-700 shadow-xl animate-in slide-in-from-bottom-4 duration-150">
      <Check className="w-4 h-4 text-red-500 shrink-0" />
      <span className="text-xs font-medium">{message}</span>
      <button 
        onClick={onClose}
        className="ml-3 text-neutral-400 hover:text-white transition-colors cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
