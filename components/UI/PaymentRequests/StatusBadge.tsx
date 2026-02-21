'use client';

import React from 'react';
import { PaymentRequestStatus } from '@/services/checkout/paymentRequest';

interface StatusBadgeProps {
  status: PaymentRequestStatus;
}

const getStatusColor = (status: PaymentRequestStatus): string => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'submitted':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'approved':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'rejected':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'cancelled':
      return 'bg-gray-100 text-gray-800 border-gray-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

const getStatusLabel = (status: PaymentRequestStatus): string => {
  switch (status) {
    case 'pending':
      return 'قيد الانتظار';
    case 'submitted':
      return 'قيد المراجعة';
    case 'approved':
      return 'موافق عليه';
    case 'rejected':
      return 'مرفوض';
    case 'cancelled':
      return 'ملغى';
    default:
      return status;
  }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(status)}`}>
      {getStatusLabel(status)}
    </span>
  );
};

export default StatusBadge;
