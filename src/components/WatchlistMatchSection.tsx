import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { VisitorEntry, WatchlistEntry, useWatchlist } from '../context/WatchlistContext';

interface WatchlistMatchSectionProps {
  visitor: VisitorEntry;
  watchlistEntry: WatchlistEntry;
  showPhotos?: boolean;
}

const WatchlistMatchSection: React.FC<WatchlistMatchSectionProps> = ({
  visitor,
  watchlistEntry,
  showPhotos = true
}) => {
  const { getWatchlistLevelName, getWatchlistLevelColor, getMatchedFields } = useWatchlist();

  const matchedFields = getMatchedFields(visitor.name, visitor.email, watchlistEntry);

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600" />
        <h4 className="text-sm font-medium text-gray-900">Watchlist Match Detected</h4>
      </div>
      
      <div className="space-y-3">
        {/* Risk Level */}
        <div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            visitor.watchlistLevelId ? getWatchlistLevelColor(visitor.watchlistLevelId) : 'bg-gray-100 text-gray-800'
          }`}>
            {visitor.watchlistLevelId ? getWatchlistLevelName(visitor.watchlistLevelId) : 'Unknown Level'}
          </span>
        </div>
        
        {/* Matched Fields */}
        <div>
          <div className="text-sm font-medium text-gray-700 mb-1">Matched fields:</div>
          <div className="text-sm text-gray-900">
            {matchedFields.length > 0 ? matchedFields.join(', ') : 'fullName, email'}
          </div>
        </div>
        
        {/* Notes to Staff */}
        <div>
          <div className="text-sm font-medium text-gray-700 mb-1">Notes to staff</div>
          <div className="text-sm text-gray-900">{watchlistEntry.notes}</div>
        </div>
        
        {/* Photos */}
        {showPhotos && watchlistEntry.attachments.length > 0 && (
          <div className="flex space-x-2 mt-3">
            {watchlistEntry.attachments.slice(0, 2).map((attachment) => (
              <img
                key={attachment.id}
                src={attachment.url}
                alt={attachment.name}
                className="w-16 h-16 object-cover rounded border border-gray-200"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchlistMatchSection;