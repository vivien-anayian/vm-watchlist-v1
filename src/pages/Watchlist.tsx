import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Settings, 
  Download, 
  ChevronDown, 
  ChevronLeft,
  ChevronRight,
  ChevronUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWatchlist, WatchlistEntry } from '../context/WatchlistContext';
import RemoveWatchlistModal from '../components/RemoveWatchlistModal';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';

type SortField = 'name' | 'contact' | 'level' | 'notes' | 'lastUpdated' | 'reportedBy';
type SortDirection = 'asc' | 'desc';

const Watchlist: React.FC = () => {
  const { searchWatchlist, removeFromWatchlist, getWatchlistLevelName, getWatchlistLevelColor } = useWatchlist();
  const { toast, showToast, hideToast } = useToast();
  const location = useLocation();
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [removingEntry, setRemovingEntry] = useState<string | null>(null);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEntries, setFilteredEntries] = useState(searchWatchlist(''));
  const [sortField, setSortField] = useState<SortField>('lastUpdated');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Handle toast messages from navigation state
  useEffect(() => {
    if (location.state?.showToast) {
      showToast(location.state.toastMessage, location.state.toastType);
      // Clear the state to prevent showing toast on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state, showToast]);

  useEffect(() => {
    let results = searchWatchlist(searchQuery);
    
    // Sort results
    results.sort((a, b) => {
      let aValue: string;
      let bValue: string;
      
      switch (sortField) {
        case 'name':
          aValue = `${a.firstName} ${a.lastName}`;
          bValue = `${b.firstName} ${b.lastName}`;
          break;
        case 'contact':
          aValue = a.primaryEmail;
          bValue = b.primaryEmail;
          break;
        case 'level':
          aValue = getWatchlistLevelName(a.levelId);
          bValue = getWatchlistLevelName(b.levelId);
          break;
        case 'notes':
          aValue = a.notes;
          bValue = b.notes;
          break;
        case 'lastUpdated':
          aValue = a.lastUpdated;
          bValue = b.lastUpdated;
          break;
        case 'reportedBy':
          aValue = a.reportedBy;
          bValue = b.reportedBy;
          break;
        default:
          aValue = `${a.firstName} ${a.lastName}`;
          bValue = `${b.firstName} ${b.lastName}`;
      }
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
    
    setFilteredEntries(results);
  }, [searchQuery, searchWatchlist, sortField, sortDirection, getWatchlistLevelName]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronDown className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4 text-gray-600" /> : 
      <ChevronDown className="w-4 h-4 text-gray-600" />;
  };

  const handleRemove = (entryId: string) => {
    setRemovingEntry(entryId);
    setShowRemoveModal(true);
    setShowActionMenu(null);
  };

  const confirmRemove = () => {
    if (removingEntry) {
      const entry = filteredEntries.find(e => e.id === removingEntry);
      removeFromWatchlist(removingEntry);
      if (entry) {
        showToast(`${entry.firstName} ${entry.lastName} was successfully removed from the Watchlist`, 'success');
      }
      setRemovingEntry(null);
      setShowRemoveModal(false);
    }
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Watchlist</h1>
        <Link
          to="/watchlist/add"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          Add to watchlist
        </Link>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Type to search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full"
              />
            </div>
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Watchlist type
            </label>
            <div className="relative">
              <select className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full">
                <option>All types</option>
                <option>High risk</option>
                <option>Medium risk</option>
                <option>Low risk</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>
          </div>
          <div className="relative lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              &nbsp;
            </label>
            <div className="flex items-center justify-between space-x-4">
              <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                <Filter className="w-4 h-4" />
                <span>Edit filters</span>
              </button>
              <div className="flex items-center space-x-2">
                <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                  <Settings className="w-4 h-4" />
                  <span>Edit columns</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden w-full">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200 table-fixed">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th 
                  className="w-48 px-4 py-3 text-left text-xs font-medium text-gray-500 tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Name</span>
                    {getSortIcon('name')}
                  </div>
                </th>
                <th 
                  className="w-48 px-4 py-3 text-left text-xs font-medium text-gray-500 tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('contact')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Contact</span>
                    {getSortIcon('contact')}
                  </div>
                </th>
                <th 
                  className="w-32 px-4 py-3 text-left text-xs font-medium text-gray-500 tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('level')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Level</span>
                    {getSortIcon('level')}
                  </div>
                </th>
                <th 
                  className="w-56 px-4 py-3 text-left text-xs font-medium text-gray-500 tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('notes')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Notes</span>
                    {getSortIcon('notes')}
                  </div>
                </th>
                <th 
                  className="w-32 px-4 py-3 text-left text-xs font-medium text-gray-500 tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('lastUpdated')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Last updated</span>
                    {getSortIcon('lastUpdated')}
                  </div>
                </th>
                <th 
                  className="w-32 px-4 py-3 text-left text-xs font-medium text-gray-500 tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('reportedBy')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Reported by</span>
                    {getSortIcon('reportedBy')}
                  </div>
                </th>
                <th className="w-24 px-4 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="relative group">
                      <Link 
                        to={`/watchlist/view/${entry.id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer block truncate"
                      >
                        {entry.firstName} {entry.lastName}
                      </Link>
                      {(entry.alternativeFirstNames.length > 0 || entry.alternativeLastNames.length > 0) && (
                        <div className="text-sm text-gray-500 truncate">
                          {truncateText([...entry.alternativeFirstNames, ...entry.alternativeLastNames].join(', '))}
                        </div>
                      )}
                      {(entry.firstName.length + entry.lastName.length > 20 || entry.alternativeFirstNames.length > 0 || entry.alternativeLastNames.length > 0) && (
                        <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 p-2 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 max-w-xs pointer-events-none">
                          <div className="font-medium">{entry.firstName} {entry.lastName}</div>
                          {entry.alternativeFirstNames.length > 0 && (
                            <div className="text-gray-300">Alternative first names: {entry.alternativeFirstNames.join(', ')}</div>
                          )}
                          {entry.alternativeLastNames.length > 0 && (
                            <div className="text-gray-300">Alternative last names: {entry.alternativeLastNames.join(', ')}</div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="relative group">
                      <Link 
                        to={`/watchlist/view/${entry.id}`}
                        className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer block truncate"
                      >
                        {truncateText(entry.primaryEmail)}
                      </Link>
                      <div className="text-sm text-gray-500 truncate">{entry.primaryPhone}</div>
                      {(entry.primaryEmail.length > 50 || entry.additionalEmails.length > 0 || entry.additionalPhones.length > 0) && (
                        <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 p-2 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 max-w-xs pointer-events-none">
                          <div>Email: {entry.primaryEmail}</div>
                          {entry.additionalEmails.map((email, idx) => (
                            <div key={idx}>Additional: {email}</div>
                          ))}
                          <div>Phone: {entry.primaryPhone}</div>
                          {entry.additionalPhones.map((phone, idx) => (
                            <div key={idx}>Additional: {phone}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getWatchlistLevelColor(entry.levelId)}`}>
                      {getWatchlistLevelName(entry.levelId)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="relative group">
                      <div className="text-sm text-gray-900 truncate">
                        {truncateText(entry.notes)}
                      </div>
                      {entry.notes.length > 50 && (
                        <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 p-2 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 max-w-xs pointer-events-none">
                          {entry.notes}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900 truncate">
                    {entry.lastUpdated}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900 truncate">
                    {entry.reportedBy}
                  </td>
                  <td className="px-4 py-4 text-right text-sm font-medium relative">
                    <div className="relative">
                      <button
                        onClick={() => setShowActionMenu(showActionMenu === entry.id ? null : entry.id)}
                        className="text-indigo-600 hover:text-indigo-900 flex items-center space-x-1 text-xs"
                      >
                        <span className="hidden sm:inline">Actions</span>
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      
                      {showActionMenu === entry.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border border-gray-200">
                          <div className="py-1">
                            <Link
                              to={`/watchlist/view/${entry.id}`}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                              onClick={() => setShowActionMenu(null)}
                            >
                              View/Edit details
                            </Link>
                            <button
                              onClick={() => handleRemove(entry.id)}
                              className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                            >
                              Remove from watchlist
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 sm:px-6 space-y-3 sm:space-y-0">
          <div className="flex-1 flex justify-between sm:hidden">
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Previous
            </button>
            <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                <span className="font-medium">{filteredEntries.length}</span> items | Showing <span className="font-medium">50</span> per page
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  1
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Remove Modal */}
      {showRemoveModal && (
        <RemoveWatchlistModal
          isOpen={showRemoveModal}
          onClose={() => {
            setShowRemoveModal(false);
            setRemovingEntry(null);
          }}
          onConfirm={confirmRemove}
        />
      )}
      
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
};

export default Watchlist;