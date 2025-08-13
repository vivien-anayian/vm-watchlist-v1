import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  BarChart3, 
  Users, 
  Settings, 
  Building2,
  ChevronDown,
  User,
  Bell,
  Search
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold">Activate</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          <div className="mb-6">
            <button className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center space-x-2 text-sm">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              <span>New content</span>
            </button>
          </div>

          <Link
            to="/"
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm ${
              isActive('/') && location.pathname === '/' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>

          <Link
            to="#"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Insights and reports</span>
          </Link>

          <div className="space-y-1">
            <div className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-300">
              <Users className="w-4 h-4" />
              <span>Visitor management</span>
              <ChevronDown className="w-4 h-4 ml-auto" />
            </div>
            <div className="ml-7 space-y-1">
              <Link
                to="/visitor-log"
                className={`block px-3 py-2 rounded-lg text-sm ${
                  isActive('/visitor-log') ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                Visitor log
              </Link>
              <Link
                to="#"
                className="block px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white"
              >
                Registration forms
              </Link>
              <Link
                to="/visitor-configuration"
                className={`block px-3 py-2 rounded-lg text-sm ${
                  isActive('/visitor-configuration') ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                Visitor configuration
              </Link>
              <Link
                to="/watchlist"
                className={`block px-3 py-2 rounded-lg text-sm ${
                  isActive('/watchlist') ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                Watchlist
              </Link>
            </div>
          </div>

          <Link
            to="#"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            <FileText className="w-4 h-4" />
            <span>Reservations</span>
          </Link>

          <div className="space-y-1">
            <div className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-300">
              <User className="w-4 h-4" />
              <span>User management</span>
              <ChevronDown className="w-4 h-4 ml-auto" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-300">
              <Building2 className="w-4 h-4" />
              <span>Property settings</span>
              <ChevronDown className="w-4 h-4 ml-auto" />
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 text-xs text-gray-500">
          <div>VTS Activate © 2023</div>
          <div>
            v5.123.0
            {import.meta.env.VITE_COMMIT_SHA && (
              <span className="ml-2 text-gray-400">commit {import.meta.env.VITE_COMMIT_SHA}</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-sm text-gray-600">
                Welcome to [your company] channel, Renee Berrigan!
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Search className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <User className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Settings className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                <div className="flex items-center space-x-1">
                  <span className="text-sm font-medium">Your Company</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;