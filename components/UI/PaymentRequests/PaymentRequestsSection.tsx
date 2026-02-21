'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PaymentRequest, paymentRequestService } from '@/services/checkout/paymentRequest';
import { getAuthToken } from '@/services/auth/login';
import { PaymentRequestCard } from './PaymentRequestCard';
import { OrganizationPaymentInfoCard } from './OrganizationPaymentInfoCard';
import { AlertCircle, Building2 } from 'lucide-react';

interface PaymentRequestsSectionProps {
  orderId: string;
  orderTotal?: number;
}

interface ApiPaymentResponse {
  status: string;
  results: number;
  organizationId?: string;
  organizationPaymentInfo?: {
    instaPayName?: string;
    instaPayNumber?: string;
    cashName?: string;
    cashNumber?: string;
  };
  data: PaymentRequest[];
}

export const PaymentRequestsSection: React.FC<PaymentRequestsSectionProps> = ({
  orderId,
  orderTotal,
}) => {
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [paymentInfo, setPaymentInfo] = useState({
    instaPay: { phone: '', accountName: '' },
    cash: { location: '', accountName: '' },
  });

  // Initialize service and fetch data
  useEffect(() => {
    const initializeAndFetch = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = getAuthToken();
        if (!token) {
          throw new Error('UNAUTHORIZED');
        }

        paymentRequestService.setToken(token);

        // Fetch payment requests for this order
        const response = await fetch(`https://shakeltaaban-d8cwcdeteadge4fe.switzerlandnorth-01.azurewebsites.net/app/v1/payment-requests/order/${orderId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data: ApiPaymentResponse = await response.json();

        if (!response.ok) {
          throw new Error(data.status === 'success' ? 'فشل تحميل طلبات الدفع' : data.status);
        }

        setRequests(data.data || []);

        // Set organization ID from API response or from first payment request
        if (data.organizationId) {
          setOrganizationId(data.organizationId);
        } else if (data.data && data.data.length > 0 && (data.data[0] as any).organizationId) {
          setOrganizationId((data.data[0] as any).organizationId);
        }

        // Set organization payment info from API response
        if (data.organizationPaymentInfo) {
          setPaymentInfo({
            instaPay: {
              phone: data.organizationPaymentInfo.instaPayNumber || '',
              accountName: data.organizationPaymentInfo.instaPayName || '',
            },
            cash: {
              location: data.organizationPaymentInfo.cashNumber || '',
              accountName: data.organizationPaymentInfo.cashName || '',
            },
          });
        }
      } catch (err) {
        if (err instanceof Error) {
          if (err.message === 'UNAUTHORIZED') {
            setError('يرجى تسجيل الدخول');
          } else {
            setError(err.message);
          }
        }
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    initializeAndFetch();
  }, [orderId]);

  // Handle upload proof
  const handleUploadProof = async (requestId: string, file: File) => {
    try {
      setActionLoading(true);
      const updated = await paymentRequestService.submitPaymentProof(requestId, file);
      setRequests((prev) =>
        prev.map((r) => (r.paymentRequestId === requestId ? updated : r))
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'فشل تحميل الصورة';
      throw new Error(message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="h-40 bg-gray-100 rounded animate-pulse" />
          <div className="h-40 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-900">خطأ</p>
            <p className="text-sm text-red-800 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">طلبات الدفع</h2>
        
        {/* Organization ID Badge */}
        {organizationId && (
          <Link 
            href={`/organization/${organizationId}`}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl px-4 py-3 shadow-sm hover:shadow-lg hover:border-blue-300 hover:scale-[1.02] transition-all cursor-pointer"
          >
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg group-hover:bg-blue-700 transition-colors">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">المنظمة</span>
              <span className="text-base font-bold text-blue-700 mt-0.5 group-hover:text-blue-800">{organizationId}</span>
            </div>
          </Link>
        )}
      </div>

      {/* Organization Payment Info - Only show if we have payment requests */}
      {requests.length > 0 && (paymentInfo.instaPay.phone || paymentInfo.cash.location) && (
        <OrganizationPaymentInfoCard
          paymentInfo={paymentInfo}
          selectedMethod={requests[0].paymentMethod}
        />
      )}

      {/* Payment Requests List */}
      {requests.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">لا توجد طلبات دفع لهذا الطلب</p>
          {orderTotal && (
            <p className="text-sm text-gray-500">
              مبلغ الطلب: {Number(orderTotal).toFixed(2)} ج.م
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <PaymentRequestCard
              key={request.paymentRequestId}
              request={request}
              isLoading={actionLoading}
              onUploadProof={(file) => handleUploadProof(request.paymentRequestId, file)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentRequestsSection;
