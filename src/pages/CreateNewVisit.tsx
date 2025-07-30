import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, Search, ChevronDown, Plus, Trash2 } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import { useToast } from '../hooks/useToast';
import Toast from '../components/Toast';

interface CreatedVisitor {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'Checked in' | 'Upcoming' | 'No show' | 'Validated' | 'Canceled';
  date: string;
  expectedArrival: string;
  expectedDeparture: string;
  submittedBy: string;
  registeredFrom: string;
  watchlistMatch?: boolean;
  watchlistLevel?: string;
}

const CreateNewVisit: React.FC = () => {
  const { checkWatchlistMatch, addVisitor } = useWatchlist();
  const { toast, showToast, hideToast } = useToast();
  const navigate = useNavigate();
  
  const [visitors, setVisitors] = useState([
    {
      id: '1',
      firstName: '',
      lastName: '',
      email: '',
      isOnWatchlist: false,
      watchlistEntry: null as any
    }
  ]);

  const [hostName, setHostName] = useState('');
  const [tenantCompany, setTenantCompany] = useState('TechCorp Industries');
  const [floor, setFloor] = useState('15');
  const [selectedDate, setSelectedDate] = useState('2024-06-20');
  const [startTime, setStartTime] = useState('9:00 AM EST');
  const [endTime, setEndTime] = useState('12:00 PM EST');
  const [notesToStaff, setNotesToStaff] = useState('');
  const [notesToVisitors, setNotesToVisitors] = useState('');

  const updateVisitor = (id: string, field: string, value: string) => {
    setVisitors(prev => prev.map(visitor => {
      if (visitor.id === id) {
        const updated = { ...visitor, [field]: value };
        
        // Check for watchlist match when first or last name changes
        if (field === 'firstName' || field === 'lastName') {
          const match = checkWatchlistMatch(
            field === 'firstName' ? value : visitor.firstName,
            field === 'lastName' ? value : visitor.lastName
          );
          
          updated.isOnWatchlist = !!match;
          updated.watchlistEntry = match;
        }
        
        return updated;
      }
      return visitor;
    }));
  };

  const removeVisitor = (id: string) => {
    setVisitors(prev => prev.filter(v => v.id !== id));
  };

  const addVisitorFormRow = () => {
    const newVisitor = {
      id: Date.now().toString(),
      firstName: '',
      lastName: '',
      email: '',
      isOnWatchlist: false,
      watchlistEntry: null
    };
    setVisitors(prev => [...prev, newVisitor]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that at least one visitor has both first and last name
    const validVisitors = visitors.filter(v => v.firstName.trim() && v.lastName.trim());
    
    if (validVisitors.length === 0) {
      showToast('Please enter at least one visitor with both first and last name', 'error');
      return;
    }
    
    // Create visitor entries for each visitor and collect them
    const createdVisitors: CreatedVisitor[] = [];
    
    validVisitors.forEach(visitor => {
      const watchlistMatch = checkWatchlistMatch(visitor.firstName, visitor.lastName);
      const newVisitor = addVisitor({
        name: `${visitor.firstName} ${visitor.lastName}`,
        email: visitor.email || 'no-email@example.com',
        phone: '555-0123', // Default phone for demo
        status: 'Upcoming' as const,
        date: selectedDate,
        expectedArrival: startTime,
        expectedDeparture: endTime,
        submittedBy: hostName || 'Alex Smith',
        registeredFrom: 'New VM form',
        watchlistMatch: !!watchlistMatch,
        watchlistLevel: watchlistMatch?.level
      });
      createdVisitors.push(newVisitor);
    });
    
    // Navigate to visitor log with success message
    const visitorNames = validVisitors
      .map(v => `${v.firstName} ${v.lastName}`)
      .join(', ');
    
    navigate('/visitor-log', { 
      state: { 
        showToast: true, 
        toastMessage: `${createdVisitors.length === 1 ? 'Visit' : 'Visits'} registered successfully for ${visitorNames}`,
        toastType: 'success'
      } 
    });
  };

  const hasWatchlistMatches = visitors.some(v => v.isOnWatchlist);

  return (
    <div className="max-w-2xl space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <Link to="/visitor-log" className="hover:text-gray-700">Visitor log</Link>
        <span>/</span>
        <span>Create new visit</span>
      </div>

      {/* Header */}
      <div className="relative">
        <div className="h-48 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-2xl font-bold mb-2">Register a visitor</h1>
            <p className="text-blue-100">Please fill out the form below to grant visitors access to this building.</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Registration Policy */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Registration Policy</h3>
          <p className="text-sm text-gray-600">
            Information about when visitors can register and any other relevant information.
          </p>
        </div>

        {/* Watchlist Warning */}
        {hasWatchlistMatches && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-800">
                  One or more guests are on the Watchlist. Entry may be approved or denied after 
                  security review. Contact your building team for guidance.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Visitor Details */}
        <div>
          <h3 className="font-medium text-gray-900 mb-4">Visitor details</h3>
          <div className="space-y-3">
            {visitors.map((visitor) => (
              <div key={visitor.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First name
                    </label>
                    <input
                      type="text"
                      value={visitor.firstName}
                      onChange={(e) => updateVisitor(visitor.id, 'firstName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last name
                    </label>
                    <input
                      type="text"
                      value={visitor.lastName}
                      onChange={(e) => updateVisitor(visitor.id, 'lastName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Last name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={visitor.email}
                      onChange={(e) => updateVisitor(visitor.id, 'email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="example@demo.com"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {visitor.isOnWatchlist && (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                        on Watchlist
                      </span>
                    )}
                  </div>
                  {visitors.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVisitor(visitor.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <button
            type="button"
            onClick={addVisitorFormRow}
            className="mt-3 flex items-center space-x-2 text-indigo-600 hover:text-indigo-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add visitor</span>
          </button>
        </div>

        {/* Host Information */}
        <div>
          <h3 className="font-medium text-gray-900 mb-4">Host information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Host name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pr-10"
                  placeholder="Alex Smith"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tenant company
              </label>
              <div className="relative">
                <select
                  value={tenantCompany}
                  onChange={(e) => setTenantCompany(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
                >
                  <option value="TechCorp Industries">TechCorp Industries</option>
                  <option value="Global Enterprises">Global Enterprises</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Floor
              </label>
              <input
                type="text"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="15"
              />
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div>
          <h3 className="font-medium text-gray-900 mb-4">Schedule</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start time
              </label>
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End time
              </label>
              <input
                type="text"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Notes to Staff */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes to staff
          </label>
          <p className="text-sm text-gray-500 mb-2">
            Security and reception staff would see these notes to help welcome your visitor(s).
          </p>
          <textarea
            value={notesToStaff}
            onChange={(e) => setNotesToStaff(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Optional"
          />
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-500">Helper text</span>
            <span className="text-xs text-gray-500">{notesToStaff.length} / 200</span>
          </div>
        </div>

        {/* Notes to Visitors */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes to visitors
          </label>
          <p className="text-sm text-gray-500 mb-2">
            your visitor(s) would see this message on their invitation.
          </p>
          <textarea
            value={notesToVisitors}
            onChange={(e) => setNotesToVisitors(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Optional"
          />
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-500">Helper text</span>
            <span className="text-xs text-gray-500">{notesToVisitors.length} / 200</span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateNewVisit;