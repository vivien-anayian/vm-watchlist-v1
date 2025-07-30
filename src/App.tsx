import React from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, Link } from 'react-router-dom';
import Layout from './components/Layout';
import VisitorLog from './pages/VisitorLog';
import Watchlist from './pages/Watchlist';
import ViewWatchlistEntry from './pages/ViewWatchlistEntry';
import EditWatchlistEntry from './pages/EditWatchlistEntry';
import AddToWatchlistPage from './pages/AddToWatchlistPage';
import CreateNewVisit from './pages/CreateNewVisit';
import VisitorConfiguration from './pages/VisitorConfiguration';
import { WatchlistProvider, useWatchlist } from './context/WatchlistContext';

// Visitor Details Component
const VisitorDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getVisitorById } = useWatchlist();
  const visitor = id ? getVisitorById(id) : null;

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

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <Link to="/visitor-log" className="hover:text-gray-700">Visitor log</Link>
        <span>/</span>
        <span>Visitor details</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{visitor.name}</h1>
        <p className="text-sm text-gray-500 mt-2">
          Visit scheduled for {visitor.date} from {visitor.expectedArrival} to {visitor.expectedDeparture}
        </p>
      </div>

      {/* Content */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Visitor Information</h3>
        
        <div className="grid grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Name</h4>
              <p className="text-sm text-gray-900">{visitor.name}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Email</h4>
              <p className="text-sm text-gray-900">{visitor.email}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Phone</h4>
              <p className="text-sm text-gray-900">{visitor.phone}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Status</h4>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                visitor.status === 'Checked in' ? 'bg-green-100 text-green-800' :
                visitor.status === 'Upcoming' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {visitor.status}
              </span>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Visit Date</h4>
              <p className="text-sm text-gray-900">{visitor.date}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Expected Arrival</h4>
              <p className="text-sm text-gray-900">{visitor.expectedArrival}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Expected Departure</h4>
              <p className="text-sm text-gray-900">{visitor.expectedDeparture}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Submitted By</h4>
              <p className="text-sm text-gray-900">{visitor.submittedBy}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Registered From</h4>
              <p className="text-sm text-gray-900">{visitor.registeredFrom}</p>
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