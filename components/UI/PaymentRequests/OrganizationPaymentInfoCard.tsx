'use client';

import React from 'react';
import { OrganizationPaymentInfo, PaymentMethod } from '@/services/checkout/paymentRequest';
import { Smartphone, MapPin } from 'lucide-react';

interface OrganizationPaymentInfoCardProps {
  paymentInfo: OrganizationPaymentInfo;
  selectedMethod?: PaymentMethod;
}

export const OrganizationPaymentInfoCard: React.FC<OrganizationPaymentInfoCardProps> = ({
  paymentInfo,
  selectedMethod,
}) => {
  if (!paymentInfo.instaPay && !paymentInfo.cash) {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-blue-900 mb-4">معلومات الدفع</h3>
      
      <div className="space-y-4">
        {paymentInfo.instaPay && (
          <div className={`p-3 rounded-lg border-2 transition-colors ${
            selectedMethod === 'instaPay' 
              ? 'bg-blue-100 border-blue-400' 
              : 'bg-white border-blue-200'
          }`}>
            <div className="flex items-start gap-3">
              <Smartphone className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">InstaPay</p>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">اسم صاحب انستا باي:</span> {paymentInfo.instaPay.accountName}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">رقم الانستا باي:</span> {paymentInfo.instaPay.phone}
                </p>
              </div>
            </div>
          </div>
        )}

        {paymentInfo.cash && (
          <div className={`p-3 rounded-lg border-2 transition-colors ${
            selectedMethod === 'cash' 
              ? 'bg-blue-100 border-blue-400' 
              : 'bg-white border-blue-200'
          }`}>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">الدفع علي المحفظه</p>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">اسم صاحب المحفظة:</span> {paymentInfo.cash.accountName}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">رقم المحفظة:</span> {paymentInfo.cash.location}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationPaymentInfoCard;
