import React from 'react';
import { X, AlertCircle } from 'lucide-react';

export const ErrorMessage = ({ message, onClose, darkMode }) => (
  <div className={`mx-4 mt-4 p-4 rounded-lg border ${
    darkMode 
      ? 'bg-red-900 border-red-700 text-red-100' 
      : 'bg-red-50 border-red-200 text-red-800'
  }`}>
    <div className="flex items-start justify-between">
      <div className="flex items-start gap-2">
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <p className="text-sm">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={`p-1 rounded-lg ${
            darkMode 
              ? 'hover:bg-red-800 text-red-200' 
              : 'hover:bg-red-100 text-red-600'
          }`}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  </div>
);