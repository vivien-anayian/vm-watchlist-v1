import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';

const ViewWatchlistEntry: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getWatchlistEntryById } = useWatchlist();
  
  if (!id) return <div>Entry not found</div>;
  
  const entry = getWatchlistEntryById(id);
  if (!entry) return <div>Entry not found</div>;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <Link to="/watchlist" className="hover:text-gray-700">Watchlist</Link>
        <span>/</span>
        <span>Watchlist details</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <h1 className="text-2xl font-semibold text-gray-900">
              {entry.firstName} {entry.lastName}
            </h1>
            <Link
              to={`/watchlist/edit/${entry.id}`}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
            >
              Edit
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Created on Tuesday, Apr 9, 2024 - 2:19 PM CDT by Security Steve
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Details</h3>
        
        <div className="grid grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">First name(s)</h4>
              <p className="text-sm text-gray-900">
                {entry.firstName}
                {entry.alternativeFirstNames.length > 0 && `, ${entry.alternativeFirstNames.join(', ')}`}
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
                  <span className="text-white text-sm font-medium">
                    {entry.reportedBy.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm text-gray-900">{entry.reportedBy}</span>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Last name(s)</h4>
              <p className="text-sm text-gray-900">
                {entry.lastName}
                {entry.alternativeLastNames.length > 0 && `, ${entry.alternativeLastNames.join(', ')}`}
              </p>
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
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Attachments</h3>
          <div className="flex space-x-4">
            {entry.attachments.map((attachment) => (
              <div key={attachment.id} className="flex flex-col">
                <img
                  src={attachment.url}
                  alt={attachment.name}
                  className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                />
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-32">{attachment.name}</p>
                  <p className="text-xs text-gray-500">{attachment.uploadedAt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewWatchlistEntry;