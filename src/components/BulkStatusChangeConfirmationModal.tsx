import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { VisitorEntry } from '../context/WatchlistContext';

interface BulkStatusChangeConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  visitors: VisitorEntry[];
  newStatus: string;
  watchlistVisitors: VisitorEntry[];
}

const BulkStatusChangeConfirmationModal: React.FC<BulkStatusChangeConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  visitors,
  newStatus,
  watchlistVisitors
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Confirm Bulk Status Change
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Are you sure you want to change the status of {visitors.length} visitor{visitors.length > 1 ? 's' : ''} to <strong>{newStatus}</strong>?
          </p>
          
          {watchlistVisitors.length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 font-medium mb-2">
                ⚠️ Watchlist Alert
              </p>
              <p className="text-sm text-red-800 mb-3">
                {watchlistVisitors.length} of the selected visitor{watchlistVisitors.length > 1 ? 's are' : ' is'} currently flagged on the watchlist:
              </p>
              <ul className="text-sm text-red-800 space-y-1">
                {watchlistVisitors.map((visitor) => (
                  <li key={visitor.id} className="flex items-center space-x-2">
                    <span>•</span>
                    <span>{visitor.name} ({visitor.watchlistLevel})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            Confirm Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkStatusChangeConfirmationModal;