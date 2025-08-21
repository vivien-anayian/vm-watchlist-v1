import React from 'react';
import { VisitorEntry, useWatchlist } from '../context/WatchlistContext';
import WatchlistMatchSection from './WatchlistMatchSection';

interface ApprovalCardProps {
  visitor: VisitorEntry;
  onApprove: (visitorId: string) => void;
  onDeny: (visitorId: string) => void;
}

const ApprovalCard: React.FC<ApprovalCardProps> = ({
  visitor,
  onApprove,
  onDeny
}) => {
  const { getWatchlistEntryForVisitor } = useWatchlist();
  
  // Get watchlist entry - either from stored match or by checking name
  let watchlistEntry = getWatchlistEntryForVisitor(visitor.id);
  
  // If no entry found but visitor has watchlist match, try to find it by name
  if (!watchlistEntry && visitor.watchlistMatch) {
    const { checkWatchlistMatchWithRules } = useWatchlist();
    const [firstName, ...lastNameParts] = visitor.name.split(' ');
    const lastName = lastNameParts.join(' ');
    watchlistEntry = checkWatchlistMatchWithRules({
      firstName,
      lastName,
      email: visitor.email,
      phone: visitor.phone
    });
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
      {/* Visitor and Host Info */}
      <div className="grid grid-cols-3 gap-6">
        {/* Visitor */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Visitor</h4>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">
                {visitor.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </span>
            </div>
            <div>
              <div className="font-medium text-gray-900">{visitor.name}</div>
              <div className="text-sm text-gray-500">{visitor.email} | {visitor.phone}</div>
            </div>
          </div>
          
          <div className="mt-3 space-y-1 text-sm text-gray-600">
            <div><strong>Date:</strong> {visitor.date}</div>
            <div><strong>Time window:</strong> {visitor.arrival} - {visitor.departure}</div>
          </div>
          
          <div className="mt-2">
            <div className="text-xs text-gray-500 mb-1">Recurrence schedule</div>
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <span>🔄</span>
              <span>Every day between April 1 to May 31, 2023</span>
            </div>
            <button className="text-xs text-indigo-600 hover:text-indigo-800 mt-1">
              View recurrence details
            </button>
          </div>
        </div>

        {/* Host */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Host</h4>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {visitor.host.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </span>
            </div>
            <div>
              <div className="font-medium text-gray-900">{visitor.host}</div>
              <div className="text-sm text-gray-500">{visitor.hostEmail} | {visitor.hostPhone}</div>
            </div>
          </div>
        </div>

        {/* Hosting Company */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Hosting company</h4>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {visitor.hostCompany.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </span>
            </div>
            <div>
              <div className="font-medium text-gray-900">{visitor.hostCompany}</div>
              <div className="text-sm text-gray-500">{visitor.hostCompanyLocation}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Watchlist Match Section */}
      {watchlistEntry && (
        <WatchlistMatchSection 
          visitor={visitor} 
          watchlistEntry={watchlistEntry}
          showPhotos={true}
        />
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          onClick={() => onDeny(visitor.id)}
          className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Reject
        </button>
        <button
          onClick={() => onApprove(visitor.id)}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Approve
        </button>
      </div>
    </div>
  );
};

export default ApprovalCard;