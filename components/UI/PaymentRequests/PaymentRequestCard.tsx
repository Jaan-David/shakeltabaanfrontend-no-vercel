'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { PaymentRequest } from '@/services/checkout/paymentRequest';
import { StatusBadge } from './StatusBadge';
import { UploadProofModal } from './UploadProofModal';
import { AlertCircle, Check, X, Download } from 'lucide-react';

interface PaymentRequestCardProps {
  request: PaymentRequest;
  onUploadProof?: (file: File) => Promise<void>;
  isLoading?: boolean;
}

export const PaymentRequestCard: React.FC<PaymentRequestCardProps> = ({
  request,
  onUploadProof,
  isLoading = false,
}) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);

  const handleUploadProof = async (file: File) => {
    setUploadLoading(true);
    try {
      if (onUploadProof) {
        await onUploadProof(file);
      }
      setShowUploadModal(false);
    } finally {
      setUploadLoading(false);
    }
  };

  const canUpload = request.status === 'pending' || request.status === 'rejected';
  const showProofImage = request.paymentProofImage && (request.status === 'submitted' || request.status === 'approved');

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900">طلب الدفع</h3>
              <StatusBadge status={request.status} />
            </div>
            <p className="text-sm text-gray-600">
              المبلغ: <span className="font-medium">{Number(request.requestedAmount).toFixed(2)} ج.م</span>
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          {/* Proof Image */}
          {showProofImage && request.paymentProofImage && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">إثبات الدفع</p>
              <Image
                src={request.paymentProofImage}
                alt="Payment proof"
                width={600}
                height={400}
                className="w-full h-40 object-cover rounded-lg border border-gray-200"
              />
              <a
                href={request.paymentProofImage}
                download
                className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                تحميل الصورة
              </a>
            </div>
          )}

          {/* Rejection Reason */}
          {request.status === 'rejected' && request.rejectionReason && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-900">سبب الرفض</p>
                  <p className="text-sm text-red-800 mt-1">{request.rejectionReason}</p>
                </div>
              </div>
            </div>
          )}

          {/* Waiting for Review */}
          {request.status === 'submitted' && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-800">جاري مراجعة طلبك من قبل فريقنا</p>
            </div>
          )}

          {/* Approved Status */}
          {request.status === 'approved' && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
              <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-green-800">تم الموافقة على طلب الدفع</p>
            </div>
          )}

          {/* Cancelled Status */}
          {request.status === 'cancelled' && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-start gap-2">
              <X className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-800">تم إلغاء طلب الدفع</p>
            </div>
          )}
        </div>

        {/* Actions */}
        {canUpload && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => setShowUploadModal(true)}
              disabled={isLoading}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {request.status === 'rejected' ? 'إعادة الرفع' : 'رفع إثبات الدفع'}
            </button>
          </div>
        )}

        {/* Date Info */}
        <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
          <p>أنشئ بتاريخ: {new Date(request.createdAt).toLocaleDateString('ar-EG')}</p>
          {request.submittedAt && (
            <p>تم الإرسال: {new Date(request.submittedAt).toLocaleDateString('ar-EG')}</p>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      <UploadProofModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSubmit={handleUploadProof}
        isLoading={uploadLoading}
      />
    </>
  );
};

export default PaymentRequestCard;
