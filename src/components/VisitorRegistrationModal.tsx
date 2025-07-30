import React, { useState } from 'react';
import { X, AlertTriangle, Search, ChevronDown, Plus, Trash2 } from 'lucide-react';

interface VisitorRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VisitorRegistrationModal: React.FC<VisitorRegistrationModalProps> = ({
  isOpen,
  onClose
}) => {
  const [visitors, setVisitors] = useState([
    {
      id: '1',
      name: 'Willy Wonka',
      email: 'example@demo.com',
      isOnWatchlist: true
    }
  ]);

  const [hostName, setHostName] = useState('');
  const [tenantCompany, setTenantCompany] = useState('VTS New York');
  const [floor, setFloor] = useState('14');
  const [selectedDate, setSelectedDate] = useState('2024-06-20');
  const [startTime, setStartTime] = useState('9:00 AM EST');
  const [endTime, setEndTime] = useState('12:00 PM EST');
  const [notesToStaff, setNotesToStaff] = useState('');
  const [notesToVisitors, setNotesToVisitors] = useState('');

  const removeVisitor = (id: string) => {
    setVisitors(prev => prev.filter(v => v.id !== id));
  };

  const addVisitor = () => {
    const newVisitor = {
      id: Date.now().toString(),
      name: 'Full name',
      email: 'example@demo.com',
      isOnWatchlist: false
    };
    setVisitors(prev => [...prev, newVisitor]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative">
          <div className="h-48 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-lg flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-2xl font-bold mb-2">Register a visitor</h1>
              <p className="text-blue-100">Please fill out the form below to grant visitors access to this building.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Registration Policy */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Registration Policy</h3>
            <p className="text-sm text-gray-600">
              Information about when visitors can register and any other relevant information.
            </p>
          </div>

          {/* Watchlist Warning */}
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

          {/* Visitor Details */}
          <div>
            <h3 className="font-medium text-gray-900 mb-4">Visitor details</h3>
            <div className="space-y-3">
              {visitors.map((visitor) => (
                <div key={visitor.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                  {visitor.isOnWatchlist && (
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-600 font-medium text-sm">WW</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{visitor.name}</span>
                      {visitor.isOnWatchlist && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                          on Watchlist
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{visitor.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVisitor(visitor.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            
            <button
              type="button"
              onClick={addVisitor}
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
                    placeholder="Rachelle Tai"
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
                    <option value="VTS New York">VTS New York</option>
                    <option value="Company HQ">Company HQ</option>
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
                  placeholder="14"
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
              <span className="text-xs text-gray-500">0 / 200</span>
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
              <span className="text-xs text-gray-500">0 / 200</span>
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
    </div>
  );
};

export default VisitorRegistrationModal;