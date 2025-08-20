import React from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, Link } from 'react-router-dom';
import { AlertTriangle, User, Building2 } from 'lucide-react';
import Layout from './components/Layout';
import VisitorLog from './pages/VisitorLog';
import Watchlist from './pages/Watchlist';
import ViewWatchlistEntry from './pages/ViewWatchlistEntry';
import EditWatchlistEntry from './pages/EditWatchlistEntry';
import AddToWatchlistPage from './pages/AddToWatchlistPage';
import CreateNewVisit from './pages/CreateNewVisit';
import VisitorConfiguration from './pages/VisitorConfiguration';
import { WatchlistProvider, useWatchlist } from './context/WatchlistContext';

// Avatar Component
const Avatar: React.FC<{ name: string; className?: string }> = ({ name, className = "w-10 h-10" }) => {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'];
  const colorIndex = name.length % colors.length;
  
  return (
    <div className={`${className} ${colors[colorIndex]} rounded-full flex items-center justify-center text-white font-medium text-sm`}>
      {initials}
    </div>
  );
};

// Photo Gallery Component
const PhotoGallery: React.FC<{ attachments: Array<{ id: string; name: string; url: string }> }> = ({ attachments }) => {
  const [selectedPhoto, setSelectedPhoto] = React.useState<string | null>(null);
  
  if (attachments.length === 0) return null;
  
  return (
    <>
      <div className="flex space-x-2 mt-4">
        {attachments.map((attachment) => (
          <img
            key={attachment.id}
            src={attachment.url}
            alt={attachment.name}
            className="w-20 h-20 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80"
            onClick={() => setSelectedPhoto(attachment.url)}
          />
        ))}
      </div>
      
      {/* Modal for larger view */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedPhoto(null)}>
          <div className="max-w-4xl max-h-4xl p-4">
            <img
              src={selectedPhoto}
              alt="Enlarged view"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
};

// Visitor Details Component
const VisitorDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getVisitorById, getWatchlistEntryForVisitor, getMatchedFields } = useWatchlist();
  const visitor = id ? getVisitorById(id) : null;
  const watchlistEntry = id ? getWatchlistEntryForVisitor(id) : null;

  if (!visitor) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-gray-900">Visitor Not Found</h1>
        <p className="text-gray-600 mt-2">The requested visitor could not be found.</p>
        <Link to="/visitor-log" className="text-indigo-600 hover:text-indigo-800 mt-4 inline-block">
          ← Back to Visitor Log
        </Link>
      </div>
    );
  }

  const matchedFields = watchlistEntry ? getMatchedFields(visitor.name, visitor.email, watchlistEntry) : [];
  
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
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <Link to="/visitor-log" className="hover:text-gray-700">Visitor log</Link>
        <span>/</span>
        <span>Pass details</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Visitor pass for {visitor.name}</h1>
        <p className="text-sm text-gray-500 mt-2">
          Created on Friday, March 30, 2023 - 9:46 AM EST by {visitor.host}
        </p>
        <div className="mt-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(visitor.status)}`}>
            {visitor.status}
          </span>
        </div>
      </div>

      {/* Host Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Host</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar name={visitor.host} />
            <div>
              <div className="font-medium text-gray-900">{visitor.host}</div>
              <div className="text-sm text-gray-500">{visitor.hostEmail} | {visitor.hostPhone}</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Avatar name={visitor.hostCompany} className="w-12 h-12" />
            <div className="text-right">
              <div className="font-medium text-gray-900">{visitor.hostCompany}</div>
              <div className="text-sm text-gray-500">{visitor.hostCompanyLocation}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Watchlist Match Section - Only show if there's a match */}
      {watchlistEntry && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <h3 className="text-lg font-medium text-gray-900">Watchlist Match Detected</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getWatchlistLevelColor(visitor.watchlistLevel)}`}>
                {visitor.watchlistLevel}
              </span>
            </div>
            
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Matched fields:</div>
              <div className="text-sm text-gray-900">{matchedFields.join(', ')}</div>
            </div>
            
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Notes to staff</div>
              <div className="text-sm text-gray-900">{watchlistEntry.notes}</div>
            </div>
            
            {watchlistEntry.attachments.length > 0 && (
              <PhotoGallery attachments={watchlistEntry.attachments} />
            )}
          </div>
        </div>
      )}

      {/* Visit Details Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Visit details</h3>
          <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium border border-indigo-600 px-3 py-1 rounded">
            Edit
          </button>
        </div>
        
        <div className="mb-6">
          <div className="text-sm font-medium text-gray-700 mb-2">Recurrence schedule</div>
          <div className="flex items-center space-x-2 text-sm text-gray-900">
            <span>🔄</span>
            <span>Every day between April 1 to May 31, 2023</span>
          </div>
          <Link to="#" className="text-indigo-600 hover:text-indigo-800 text-sm">
            View recurrence details
          </Link>
        </div>
        
        <div className="grid grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Visitor name</h4>
              <p className="text-sm text-gray-900">{visitor.name}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Visitor company</h4>
              <p className="text-sm text-gray-900">Eataly</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Date</h4>
              <p className="text-sm text-gray-900">{visitor.date}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Notes to staff</h4>
              <p className="text-sm text-gray-900">Host to receive in lobby</p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Visitor email</h4>
              <p className="text-sm text-gray-900">{visitor.email}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Visitor phone number</h4>
              <p className="text-sm text-gray-900">{visitor.phone}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Time window</h4>
              <p className="text-sm text-gray-900">{visitor.arrival} - {visitor.departure}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Notes to visitor</h4>
              <p className="text-sm text-gray-900">Welcome to {visitor.hostCompany}! {visitor.host} will meet you in the lobby.</p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Additional notification recipients</h4>
            <p className="text-sm text-gray-900">-</p>
          </div>
        </div>
      </div>
    </div>
  );
};

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Arrival</h4>
              <p className="text-sm text-gray-900">{visitor.arrival}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Departure</h4>
              <p className="text-sm text-gray-900">{visitor.departure}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Host</h4>
              <p className="text-sm text-gray-900">{visitor.host}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Host Company</h4>
              <p className="text-sm text-gray-900">{visitor.hostCompany}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Floor</h4>
              <p className="text-sm text-gray-900">{visitor.floor}</p>
            </div>

            {visitor.watchlistMatch && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Watchlist Status</h4>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {visitor.watchlistLevel}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <WatchlistProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<VisitorLog />} />
            <Route path="/visitor-log" element={<VisitorLog />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/watchlist/view/:id" element={<ViewWatchlistEntry />} />
            <Route path="/watchlist/edit/:id" element={<EditWatchlistEntry />} />
            <Route path="/watchlist/add" element={<AddToWatchlistPage />} />
            <Route path="/create-visit" element={<CreateNewVisit />} />
            <Route path="/visitor-log/view/:id" element={<VisitorDetails />} />
            <Route path="/visitor-configuration" element={<VisitorConfiguration />} />
          </Routes>
        </Layout>
      </Router>
    </WatchlistProvider>
  );
}

export default App;