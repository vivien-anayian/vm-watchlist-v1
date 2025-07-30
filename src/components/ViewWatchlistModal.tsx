import React from 'react';
import { X } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';

interface ViewWatchlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  entryId: string | null;
  onEdit: (entryId: string) => void;
}

const ViewWatchlistModal: React.FC<ViewWatchlistModalProps> = ({
  isOpen,
  onClose,
  entryId,
  onEdit
}) => {
  const { getWatchlistEntryById } = useWatchlist();
  
  if (!isOpen || !entryId) return null;
  
  const entry = getWatchlistEntryById(entryId);
  if (!entry) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-semibold text-gray-900">
                {entry.firstName} {entry.lastName}
              </h2>
              <button
                onClick={() => onEdit(entry.id)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
              >
                Edit
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Created on Tuesday, Apr 9, 2024 - 2:19 PM CDT by Security Steve
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Details</h3>
            
            <div className="grid grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">First name(s)</h4>
                  <p className="text-sm text-gray-900">
                    {entry.firstName}
                    {entry.aliases.length > 0 && `, ${entry.aliases.join(', ')}`}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Email(s)</h4>
                  <p className="text-sm text-gray-900">{entry.primaryEmail}</p>
                  {entry.additionalEmails.map((email, index) => (
                    <p key={index} className="text-sm text-gray-900">{email}</p>
                  ))}
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
                  <p className="text-sm text-gray-900">{entry.notes}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Reported by</h4>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">A</span>
                    </div>
                    <span className="text-sm text-gray-900">{entry.reportedBy}</span>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Last name(s)</h4>
                  <p className="text-sm text-gray-900">{entry.lastName}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Phone number</h4>
                  <p className="text-sm text-gray-900">{entry.primaryPhone}</p>
                  {entry.additionalPhones.map((phone, index) => (
                    <p key={index} className="text-sm text-gray-900">{phone}</p>
                  ))}
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Security instructions</h4>
                  <p className="text-sm text-gray-900">Notify security immediately.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Attachments */}
          {entry.attachments.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Attachments</h3>
              <div className="grid grid-cols-2 gap-4">
                {entry.attachments.map((attachment) => (
                  <div key={attachment.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={attachment.url}
                      alt={attachment.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-3">
                      <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                      <p className="text-xs text-gray-500">Category: Image</p>
                      <p className="text-xs text-gray-500">{attachment.uploadedAt}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewWatchlistModal;