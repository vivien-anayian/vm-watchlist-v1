import React from 'react';
import { useWatchlist } from '../context/WatchlistContext';
import { Mail, CheckCircle, XCircle } from 'lucide-react';

const SentEmailsList: React.FC = () => {
  const { getSentEmails } = useWatchlist();
  const sentEmails = getSentEmails();

  if (sentEmails.length === 0) {
    return (
      <div className="text-center py-8">
        <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No emails sent yet</p>
        <p className="text-sm text-gray-400 mt-1">
          Approve or deny visitors to see email notifications here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {sentEmails.map((email) => (
        <div key={email.id} className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                email.action === 'approved' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {email.action === 'approved' ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    email.action === 'approved' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {email.action === 'approved' ? 'Approved' : 'Denied'}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {email.visitorName}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <strong>To:</strong> {email.hostName} ({email.hostEmail})
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <strong>Subject:</strong> {email.subject}
                </div>
                <div className="text-xs text-gray-500">
                  Sent: {new Date(email.sentAt).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
          
          {/* Email Body Preview */}
          <details className="mt-3">
            <summary className="text-sm text-indigo-600 cursor-pointer hover:text-indigo-800">
              View email content
            </summary>
            <div className="mt-2 p-3 bg-gray-50 rounded border text-sm text-gray-700 whitespace-pre-line">
              {email.body}
            </div>
          </details>
        </div>
      ))}
    </div>
  );
};

export default SentEmailsList;