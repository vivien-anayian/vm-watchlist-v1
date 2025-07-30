import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { VisitorEntry } from '../context/WatchlistContext';

interface StatusChangeConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  visitor: VisitorEntry | null;
  newStatus: VisitorEntry['status'];
}

const StatusChangeConfirmationModal: React.FC<StatusChangeConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  visitor,
  newStatus
}) => {
  if (!isOpen || !visitor) return null;

  const getStatusChangeMessage = () => {
    if (newStatus === 'Validated') {
      return `Are you sure you want to validate ${visitor.name}? This will remove their watchlist flag and allow them to proceed with their visit.`;
    }
    return `Are you sure you want to change ${visitor.name}'s status to ${newStatus}?`;
  };

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
              Confirm Status Change
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
          <p className="text-gray-600">
            {getStatusChangeMessage()}
          </p>
          {visitor.watchlistMatch && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>Note:</strong> This visitor is currently flagged on the watchlist ({visitor.watchlistLevel}).
              </p>
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
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusChangeConfirmationModal;