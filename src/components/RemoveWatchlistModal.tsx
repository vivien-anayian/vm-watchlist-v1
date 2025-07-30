import React from 'react';
import { X } from 'lucide-react';

interface RemoveWatchlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const RemoveWatchlistModal: React.FC<RemoveWatchlistModalProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Remove from the Watchlist?
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-8">
          <p className="text-gray-600 text-lg leading-relaxed">
            Are you sure you this individual is to be removed from the Watchlist? 
            Archived watchlist individuals will no longer be blocked by security.
          </p>
        </div>

        {/* Actions */}
        <div className="flex space-x-4">
          <button
            onClick={onConfirm}
            className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-full text-lg font-medium hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Remove
          </button>
          <button
            onClick={onClose}
            className="flex-1 border-2 border-indigo-600 text-indigo-600 py-3 px-6 rounded-full text-lg font-medium hover:bg-indigo-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Return to page
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemoveWatchlistModal;