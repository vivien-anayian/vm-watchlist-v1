import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Settings, 
  Download, 
  ChevronDown, 
  ChevronLeft,
  ChevronRight,
  Lock,
  ChevronUp,
} from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import StatusChangeConfirmationModal from '../components/StatusChangeConfirmationModal';

type SortField = 'status' | 'date' | 'arrival' | 'departure' | 'name' | 'watchlist' | 'host' | 'hostCompany' | 'floor' | 'id';
type SortDirection = 'asc' | 'desc';

const VisitorLog: React.FC = () => {
  const { searchVisitors, updateVisitorStatus } = useWatchlist();
  const { toast, showToast, hideToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'scheduled' | 'past'>('scheduled');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredVisitors, setFilteredVisitors] = useState(searchVisitors(''));
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState<string | null>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    visitorId: string;
    newStatus: string;
  } | null>(null);
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [watchlistMatchFilter, setWatchlistMatchFilter] = useState<string>('');

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.status-dropdown-container') && !target.closest('.action-menu-container')) {
        setShowStatusDropdown(null);
        setShowActionMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle toast messages from navigation state
  useEffect(() => {
    if (location.state?.showToast) {
      showToast(location.state.toastMessage, location.state.toastType);
      // Clear the state to prevent showing toast on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state, showToast]);

  useEffect(() => {
    let results = searchVisitors(searchQuery);
    
    // Filter by status if selected
    if (statusFilter) {
      results = results.filter(visitor => visitor.status === statusFilter);
    }
    
    // Filter by watchlist match if selected
    if (watchlistMatchFilter === 'No matches') {
      results = results.filter(visitor => !visitor.watchlistMatch);
    } else if (watchlistMatchFilter === 'High risk') {
      results = results.filter(visitor => visitor.watchlistMatch);
    }
    
    // Sort results
    results.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;
      
      switch (sortField) {
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'date':
          aValue = a.date;
          bValue = b.date;
          break;
        case 'arrival':
          aValue = a.arrival;
          bValue = b.arrival;
          break;
        case 'departure':
          aValue = a.departure;
          bValue = b.departure;
          break;
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'watchlist':
          aValue = a.watchlistLevel || '';
          bValue = b.watchlistLevel || '';
          break;
        case 'host':
          aValue = a.host;
          bValue = b.host;
          break;
        case 'hostCompany':
          aValue = a.hostCompany;
          bValue = b.hostCompany;
          break;
        case 'floor':
          aValue = a.floor;
          bValue = b.floor;
          break;
        case 'id':
          aValue = parseInt(a.id);
          bValue = parseInt(b.id);
          break;
        default:
          aValue = parseInt(a.id);
          bValue = parseInt(b.id);
      }
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
    
    setFilteredVisitors(results);
  }, [searchQuery, searchVisitors, sortField, sortDirection, statusFilter, watchlistMatchFilter]);

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

  const handleAddToWatchlist = (visitorId: string) => {
    // Navigate to the add page with visitor data
    const params = new URLSearchParams();
    params.set('visitorId', visitorId);
    navigate(`/watchlist/add?${params.toString()}`);
    setShowActionMenu(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Checked in':
        return 'bg-green-100 text-green-800';
      case 'Upcoming':
        return 'bg-yellow-100 text-yellow-800';
      case 'Validated':
        return 'bg-white text-gray-900 border border-gray-400';
      case 'No show':
        return 'bg-gray-100 text-gray-800';
      case 'Canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusOptions = (currentStatus: string) => {
    switch (currentStatus) {
      case 'Upcoming':
        return ['Validated', 'No show', 'Canceled'];
      case 'Validated':
        return ['Upcoming', 'Checked in', 'No show', 'Canceled'];
      case 'No show':
        return ['Upcoming', 'Canceled'];
      case 'Canceled':
        return ['Upcoming'];
      default:
        return [];
    }
  };

  const handleStatusChange = (visitorId: string, newStatus: string) => {
    const visitor = filteredVisitors.find(v => v.id === visitorId);
    
    // Show confirmation modal only for watchlist-flagged visitors
    if (visitor?.watchlistMatch) {
      setPendingStatusChange({ visitorId, newStatus });
      setShowConfirmationModal(true);
    } else {
      // Update status immediately for non-flagged visitors
      updateVisitorStatus(visitorId, newStatus as any);
      showToast(`Status updated to ${newStatus}`, 'success');
    }
    
    setShowStatusDropdown(null);
  };

  const getWatchlistLevelColor = (level?: string) => {
    switch (level) {
      case 'High risk':
        return 'bg-red-100 text-red-800';
      case 'Medium risk':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low risk':
        return 'bg-blue-100 text-blue-800';
      case 'VIP':
        return 'bg-purple-100 text-purple-800';
      default:
        return '';
    }
  };

  const confirmStatusChange = () => {
    if (pendingStatusChange) {
      updateVisitorStatus(pendingStatusChange.visitorId, pendingStatusChange.newStatus as any);
      showToast(`Status updated to ${pendingStatusChange.newStatus}`, 'success');
      setPendingStatusChange(null);
    }
    setShowConfirmationModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Visitor log</h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/create-visit')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            Create new visit
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('scheduled')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'scheduled'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Scheduled visits
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'past'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Past visits
          </button>
        </nav>
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
              Visit date
            </label>
            <input
              type="date"
              defaultValue="2025-06-17"
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full"
            />
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <div className="relative">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full"
              >
                <option value="">Select option</option>
                <option value="Checked-in">Checked-in</option>
                <option value="Upcoming">Upcoming</option>
                <option value="No show">No show</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Watchlist match
            </label>
            <div className="relative">
              <select 
                value={watchlistMatchFilter}
                onChange={(e) => setWatchlistMatchFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full"
              >
                <option value="">Select option</option>
                <option value="No matches">No matches</option>
                <option value="High risk">High risk</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              <span>Edit filters</span>
            </button>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
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

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Status</span>
                    {getSortIcon('status')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('arrival')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Arrival</span>
                    {getSortIcon('arrival')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('departure')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Departure</span>
                    {getSortIcon('departure')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Visitor</span>
                    {getSortIcon('name')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('watchlist')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Watchlist</span>
                    {getSortIcon('watchlist')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('host')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Host</span>
                    {getSortIcon('host')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('hostCompany')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Host company</span>
                    {getSortIcon('hostCompany')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('floor')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Floor</span>
                    {getSortIcon('floor')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVisitors.map((visitor) => (
                <tr key={visitor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="relative status-dropdown-container">
                      <button 
                        onClick={() => setShowStatusDropdown(showStatusDropdown === visitor.id ? null : visitor.id)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(visitor.status)} space-x-1 hover:opacity-80 transition-opacity`}
                      >
                        <span>{visitor.status}</span>
                        <ChevronDown className="w-3 h-3" />
                      </button>
                      
                      {showStatusDropdown === visitor.id && (
                        <div className="absolute top-full left-0 mt-1 w-32 bg-white rounded-md shadow-lg z-30 border border-gray-200">
                          <div className="py-1">
                            {getStatusOptions(visitor.status).map((status) => (
                              <button
                                key={status}
                                onClick={() => handleStatusChange(visitor.id, status)}
                                className="block px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 w-full text-left"
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {visitor.arrival}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {visitor.departure}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link 
                      to={`/visitor-log/view/${visitor.id}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      {visitor.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {visitor.watchlistMatch && visitor.watchlistLevel ? (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getWatchlistLevelColor(visitor.watchlistLevel)}`}>
                        {visitor.watchlistLevel}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {visitor.host}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {visitor.hostCompany}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {visitor.floor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="relative action-menu-container">
                      <button 
                        onClick={() => setShowActionMenu(showActionMenu === visitor.id ? null : visitor.id)}
                        className="text-indigo-600 hover:text-indigo-900 flex items-center space-x-1 text-xs sm:text-sm"
                      >
                        <span className="hidden sm:inline">Actions</span>
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      
                      {showActionMenu === visitor.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-30 border border-gray-200">
                          <div className="py-1">
                            <button
                              onClick={() => {
                                navigate(`/visitor-log/view/${visitor.id}`);
                                setShowActionMenu(null);
                              }}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              View details
                            </button>
                            <button
                              onClick={() => handleAddToWatchlist(visitor.id)}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              Add to Watchlist
                            </button>
                            <button
                              onClick={() => setShowActionMenu(null)}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              View submission receipt
                            </button>
                            <button
                              onClick={() => setShowActionMenu(null)}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              Download QR code
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
                {filteredVisitors.length} items | Showing <span className="font-medium">50</span> per page
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

      {/* Modals */}
      <StatusChangeConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => {
          setShowConfirmationModal(false);
          setPendingStatusChange(null);
        }}
        onConfirm={confirmStatusChange}
        visitor={pendingStatusChange ? filteredVisitors.find(v => v.id === pendingStatusChange.visitorId) || null : null}
        newStatus={pendingStatusChange?.newStatus as any}
      />
      
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
};

export default VisitorLog;