import React, { useState } from 'react';
import { useWatchlist } from '../context/WatchlistContext';
import { useToast } from '../hooks/useToast';
import ApprovalCard from './ApprovalCard';
import ApprovalConfirmationModal from './ApprovalConfirmationModal';

const PendingApprovalTab: React.FC = () => {
  const { getPendingApprovalVisitors, approveVisitor, denyVisitor, getVisitorById } = useWatchlist();
  const { showToast } = useToast();
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    visitorId: string;
    action: 'approve' | 'deny';
  } | null>(null);

  const pendingVisitors = getPendingApprovalVisitors();

  const handleApprove = (visitorId: string) => {
    setPendingAction({ visitorId, action: 'approve' });
    setShowConfirmationModal(true);
  };

  const handleDeny = (visitorId: string) => {
    setPendingAction({ visitorId, action: 'deny' });
    setShowConfirmationModal(true);
  };

  const confirmAction = () => {
    if (!pendingAction) return;

    const visitor = getVisitorById(pendingAction.visitorId);
    if (!visitor) return;

    if (pendingAction.action === 'approve') {
      approveVisitor(pendingAction.visitorId, 'Current User'); // In real app, get from auth context
      showToast(`${visitor.name} has been approved. Notification sent to ${visitor.hostEmail}`, 'success');
    } else {
      denyVisitor(pendingAction.visitorId, 'Current User'); // In real app, get from auth context
      showToast(`${visitor.name} has been denied. Notification sent to ${visitor.hostEmail}`, 'info');
    }

    setShowConfirmationModal(false);
    setPendingAction(null);
  };

  const closeModal = () => {
    setShowConfirmationModal(false);
    setPendingAction(null);
  };

  if (pendingVisitors.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">No pending approvals</div>
        <div className="text-gray-400 text-sm mt-2">
          Visitors requiring manual approval will appear here
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {pendingVisitors.map((visitor) => (
        <ApprovalCard
          key={visitor.id}
          visitor={visitor}
          onApprove={handleApprove}
          onDeny={handleDeny}
        />
      ))}

      <ApprovalConfirmationModal
        isOpen={showConfirmationModal}
        onClose={closeModal}
        onConfirm={confirmAction}
        visitor={pendingAction ? getVisitorById(pendingAction.visitorId) : null}
        action={pendingAction?.action || 'approve'}
      />
    </div>
  );
};

export default PendingApprovalTab;