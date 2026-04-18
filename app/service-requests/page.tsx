'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Upload, X } from 'lucide-react';
import Alert from '@/components/UI/Alert/alert';
import AlertHandler from '@/services/Utils/alertHandler';
import { isUserAuthenticated } from '@/services/auth/login';
import inquiryService, { type Inquiry, type InquiryReply } from '@/services/api/inquiry';
import { Api } from '@/services/api/endpoints';
import InquiriesHeader from '../inquiries/components/InquiriesHeader';
import InquiryFilters from '../inquiries/components/InquiryFilters';
import InquiryStatusBadge from '../inquiries/components/InquiryStatusBadge';
import ServiceHowItWorksSteps from './components/ServiceHowItWorksSteps';
import ServiceRequestCard from './components/ServiceRequestCard';

const API_IMAGE_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || Api)
  .replace(/\/app\/v1\/?$/, '')
  .replace(/\/+$/, '');

const resolveInquiryImage = (value?: string | null): string | null => {
  if (!value?.trim()) return null;

  const normalized = value.trim().replace(/\\/g, '/');
  if (
    normalized.startsWith('http://') ||
    normalized.startsWith('https://') ||
    normalized.startsWith('data:') ||
    normalized.startsWith('blob:')
  ) {
    return encodeURI(normalized);
  }

  const cleaned = normalized.replace(/^\/+/, '').replace(/^public\//i, '');
  if (!cleaned) return null;

  return encodeURI(`${API_IMAGE_BASE_URL}/${cleaned}`);
};

export default function ServiceRequestsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white pb-16 px-4 rtl">جاري التحميل...</div>}>
      <ServiceRequestsPageContent />
    </Suspense>
  );
}

function ServiceRequestsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageFromQuery = Number(searchParams?.get('page') || 1);
  const limitFromQuery = Number(searchParams?.get('limit') || 20);
  const page = Number.isFinite(pageFromQuery) && pageFromQuery > 0 ? pageFromQuery : 1;
  const limit =
    Number.isFinite(limitFromQuery) && limitFromQuery > 0 && limitFromQuery <= 100
      ? limitFromQuery
      : 20;
  
  const [requests, setRequests] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [activeStatus, setActiveStatus] = useState<'all' | 'active' | 'accepted' | 'ended'>('all');
  const [selectedRequest, setSelectedRequest] = useState<Inquiry | null>(null);
  
  // Create Service Request Form
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Alerts
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const getErrorMessage = (value: unknown, fallback: string) => {
    if (value && typeof value === 'object' && 'message' in value) {
      const message = (value as { message?: unknown }).message;
      if (typeof message === 'string') return message;
    }
    return fallback;
  };

  const extractErrorMessage = (value: unknown): string | null => {
    if (!value || typeof value !== 'object') return null;

    if ('response' in value) {
      const response = (value as { response?: { data?: { message?: unknown } } }).response;
      const message = response?.data && typeof response.data === 'object'
        ? (response.data as { message?: unknown }).message
        : undefined;
      if (typeof message === 'string') return message;
    }

    if ('message' in value) {
      const message = (value as { message?: unknown }).message;
      if (typeof message === 'string') return message;
    }

    return null;
  };

  const parseRequestError = (value: unknown, fallback: string) => {
    const rawMessage = extractErrorMessage(value) || fallback;
    const normalizedMessage = rawMessage.toLowerCase();

    if (normalizedMessage.includes('only accept inquiries from egyptian customers')) {
      const phoneMatch = rawMessage.match(/\\+?\\d{8,}/)?.[0] || '201026273185';
      const cleanPhone = phoneMatch.replace(/^\\+/, '');
      return {
        message: rawMessage,
        whatsappUrl: `https://wa.me/${cleanPhone}`,
      };
    }

    return { message: rawMessage };
  };

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const statusParam = activeStatus === 'all' ? undefined : activeStatus;
      const result = await inquiryService.getInquiries({ 
        page,
        limit,
        type: 'service_request',
        status: statusParam
      });

      const serviceRequests = (result.inquiries || []).filter(
        (inquiry) => inquiry.type === 'service_request'
      );

      setRequests(serviceRequests);
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error, 'فشل في تحميل الطلبات'));
      console.error('Error fetching service requests:', error);
    }
    setIsLoading(false);
  }, [activeStatus, limit, page]);

  // Fetch requests on mount and when filters change
  useEffect(() => {
    if (!isUserAuthenticated()) {
      router.push(`/login?redirect=${encodeURIComponent('/service-requests')}`);
      return;
    }
    fetchRequests();
  }, [fetchRequests, router]);

  async function handleCreateRequest(e: React.FormEvent) {
    e.preventDefault();

    const trimmedDescription = description.trim();
    const minDescriptionLength = 10;
    if (!trimmedDescription || trimmedDescription.length < minDescriptionLength || trimmedDescription.length > 1000) {
      setErrorMessage('الوصف يجب أن يكون بين 10 و 1000 حرف');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await inquiryService.createInquiry({
        type: 'service_request',
        description: trimmedDescription,
        images,
      });
      
      setSuccessMessage('تم إنشاء طلب الخدمة بنجاح! سنرسل لك العروض قريباً');
      setDescription('');
      setImages([]);
      
      // Refresh requests list
      setTimeout(() => {
        fetchRequests();
        setActiveTab('list');
      }, 1500);
    } catch (error: unknown) {
      const parsedError = parseRequestError(error, 'فشل في إنشاء طلب الخدمة');
      if (parsedError.whatsappUrl) {
        AlertHandler.warning(parsedError.message, {
          buttons: [
            {
              label: 'التواصل عبر واتساب',
              onClick: () => window.open(parsedError.whatsappUrl as string, '_blank'),
              variant: 'primary'
            }
          ]
        });
        return;
      }

      setErrorMessage(parsedError.message);
      console.error('Error creating service request:', error);
    }
    
    setIsSubmitting(false);
  }

  async function handleAcceptReply(request: Inquiry, reply: InquiryReply) {
    try {
      await inquiryService.acceptReply(request._id, reply._id);
      setSuccessMessage('تم قبول العرض بنجاح');
      setSelectedRequest(null);
      setActiveTab('list');
      setActiveStatus('accepted');
      fetchRequests();
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error, 'فشل في قبول العرض'));
      console.error('Error accepting reply:', error);
    }
  }

  async function handleRejectReply(request: Inquiry) {
    try {
      await inquiryService.rejectReply(request._id);
      setSuccessMessage('تم رفض العرض');
      setSelectedRequest(null);
      setActiveTab('list');
      setActiveStatus('active');
      fetchRequests();
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error, 'فشل في رفض العرض'));
      console.error('Error rejecting reply:', error);
    }
  }

  async function handleEndRequest(request: Inquiry) {
    try {
      await inquiryService.endInquiry(request._id);
      setSuccessMessage('تم إغلاق الطلب بنجاح');
      fetchRequests();
      setSelectedRequest(null);
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error, 'فشل في إغلاق الطلب'));
      console.error('Error ending request:', error);
    }
  }

  async function handleDeleteRequest(requestId: string) {
    if (confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
      try {
        await inquiryService.deleteInquiry(requestId);
        setSuccessMessage('تم حذف الطلب بنجاح');
        fetchRequests();
        setSelectedRequest(null);
      } catch (error: unknown) {
        setErrorMessage(getErrorMessage(error, 'فشل في حذف الطلب'));
        console.error('Error deleting request:', error);
      }
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImages(prev => [...prev, ...files].slice(0, 5));
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const objectUrls = images.map((file) => URL.createObjectURL(file));
    setPreviewUrls(objectUrls);

    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images]);

  const filteredRequests = activeStatus === 'all' 
    ? requests 
    : requests.filter(r => r.status === activeStatus);

  return (
    <div className="min-h-screen bg-white pb-16 px-4 rtl">
      {/* Alerts */}
      {successMessage && (
        <Alert
          message={successMessage}
          setClose={() => setSuccessMessage('')}
          type="success"
        />
      )}
      
      {errorMessage && (
        <Alert
          message={errorMessage}
          setClose={() => {
            setErrorMessage('');
          }}
          type="error"
        />
      )}

      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <InquiriesHeader
          title="طلب خدمة للرخام والجرانيت"
          subtitle="اكتب تفاصيل التنفيذ الذي تحتاجه وسيقوم مقدمو الخدمة بإرسال عروضهم لتنفيذ العمل."
        />

        {/* شرح كيف تعمل الخدمة */}
        <ServiceHowItWorksSteps />

        <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => setActiveTab('list')}
              className={`rounded-2xl px-6 py-3 text-base font-semibold transition-all ${
                activeTab === 'list'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              قائمة الطلبات
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`hidden md:flex rounded-2xl px-6 py-3 text-base font-semibold transition-all ${
                activeTab === 'create'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              طلب خدمة جديد
            </button>
          </div>
          <InquiryFilters
            activeStatus={activeStatus}
            onChange={setActiveStatus}
            count={filteredRequests.length}
          />
        </div>

        {/* List Tab */}
        {activeTab === 'list' && (
          <div className="space-y-5">
            {isLoading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
                <div className="text-slate-600">جاري التحميل...</div>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
                <p className="mb-4 text-lg font-semibold text-slate-900">لا توجد طلبات خدمات حالياً</p>
                <p className="mb-6 text-sm text-slate-600">ابدأ بإنشاء طلب خدمة جديد وسيقوم مقدمو الخدمة بإرسال عروضهم</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="rounded-2xl bg-blue-600 px-8 py-3 text-base font-semibold text-white transition hover:bg-blue-700"
                >
                  إنشاء طلب خدمة
                </button>
              </div>
            ) : (
              filteredRequests.map((request) => (
                <ServiceRequestCard
                  key={request._id}
                  request={request}
                  onViewDetails={() => setSelectedRequest(request)}
                  onViewOffers={() => setSelectedRequest(request)}
                />
              ))
            )}
          </div>
        )}

        {/* Create Tab */}
        {activeTab === 'create' && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="mb-6 text-2xl font-bold text-slate-900">إنشاء طلب خدمة جديد</h2>
            
            <form onSubmit={handleCreateRequest} className="space-y-6">
              {/* Description */}
              <div>
                <label htmlFor="description" className="mb-2 block text-sm font-semibold text-slate-700">
                  وصف الخدمة المطلوبة <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  maxLength={1000}
                  placeholder="اشرح تفاصيل الخدمة المطلوبة بدقة... مثل: المساحة، المنطقة، نوع الرخام، المواصفات، الموعد المتوقع، إلخ"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
                <div className="mt-1 flex justify-between text-xs text-slate-500">
                  <span>من 10 إلى 1000 حرف</span>
                  <span>{description.length} / 1000</span>
                </div>
              </div>

              {/* Images */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  الصور (اختياري - حتى 5 صور)
                </label>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*,.heic,.heif,.webp"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                    id="service-image-upload"
                  />
                  <label
                    htmlFor="service-image-upload"
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-slate-700 transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700"
                  >
                    <Upload className="h-5 w-5" />
                    <span className="text-sm font-semibold">اختر الصور</span>
                  </label>
                  
                  {images.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 md:grid-cols-5">
                      {images.map((image, index) => (
                        <div key={index} className="relative aspect-square">
                          <Image
                            src={previewUrls[index] || '/acessts/NoImage.jpg'}
                            alt={`صورة ${index + 1}`}
                            fill
                            sizes="(max-width: 768px) 33vw, 20vw"
                            className="rounded-xl object-cover"
                            unoptimized
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white shadow-md transition hover:bg-rose-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-blue-600 py-3 text-base font-semibold text-white shadow-md transition hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'جاري الإرسال...' : 'إرسال طلب الخدمة'}
              </button>
            </form>
          </div>
        )}
      </div>

      {activeTab === 'list' && (
        <div className="fixed bottom-4 left-4 right-4 z-40 md:hidden">
          <button
            onClick={() => setActiveTab('create')}
            className="w-full rounded-2xl bg-blue-600 py-3 text-base font-semibold text-white shadow-lg shadow-blue-200/50 transition hover:bg-blue-700"
          >
            طلب خدمة جديد
          </button>
        </div>
      )}

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">تفاصيل طلب الخدمة</h3>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Status and Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <InquiryStatusBadge status={selectedRequest.status} />
                  <span className="text-sm text-slate-500">
                    {new Date(selectedRequest.createdAt).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="rounded-xl bg-white border border-slate-200 p-4">
                <h4 className="mb-2 text-sm font-semibold text-slate-700">وصف الخدمة</h4>
                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">
                  {selectedRequest.description}
                </p>
              </div>

              {/* Images */}
              {selectedRequest.imageList && selectedRequest.imageList.length > 0 && (
                <div className="rounded-xl bg-white border border-slate-200 p-4">
                  <h4 className="mb-3 text-sm font-semibold text-slate-700">الصور المرفقة</h4>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {selectedRequest.imageList.map((img, index) => (
                      <div key={index} className="relative aspect-square">
                        <Image
                          src={resolveInquiryImage(img) || '/acessts/NoImage.jpg'}
                          alt={`صورة ${index + 1}`}
                          fill
                          sizes="(max-width: 768px) 50vw, 33vw"
                          className="rounded-lg object-cover"
                          unoptimized
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Replies/Offers */}
              <div className="rounded-xl bg-white border border-slate-200 p-4">
                <h4 className="mb-3 text-sm font-semibold text-slate-700">
                  العروض المستلمة ({selectedRequest.reply.length})
                </h4>
                
                {selectedRequest.reply.length === 0 ? (
                  <p className="text-center py-6 text-sm text-slate-500">
                    لا توجد عروض حتى الآن. سنخطرك عند استلام عروض جديدة.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {selectedRequest.reply.map((reply) => (
                      <div
                        key={reply._id}
                        className={`rounded-lg border p-4 ${
                          reply.status === 'accepted'
                            ? 'border-emerald-200 bg-emerald-50'
                            : reply.status === 'rejected'
                            ? 'border-slate-200 bg-slate-50'
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-900">عرض من مقدم خدمة</p>
                            <p className="text-xs text-slate-500 mt-1">
                              {new Date(reply.createdAt).toLocaleDateString('ar-EG')}
                            </p>
                          </div>
                          {reply.status === 'accepted' && (
                            <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 border border-emerald-200 rounded-full px-3 py-1">
                              مقبول
                            </span>
                          )}
                          {reply.status === 'rejected' && (
                            <span className="text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 rounded-full px-3 py-1">
                              مرفوض
                            </span>
                          )}
                        </div>
                        <p className="text-sm leading-6 text-slate-700 mb-3">{reply.text}</p>
                        
                        {reply.status === 'pending' && selectedRequest.status === 'active' && (
                          <button
                            onClick={() => handleAcceptReply(selectedRequest, reply)}
                            className="w-full rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                          >
                            قبول العرض
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              {selectedRequest.status === 'accepted' && (
                <div className="space-y-3">
                  <button
                    onClick={() => handleRejectReply(selectedRequest)}
                    className="w-full rounded-xl border border-amber-300 bg-amber-50 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
                  >
                    رفض العرض المقبول
                  </button>
                  <button
                    onClick={() => handleEndRequest(selectedRequest)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-100 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                  >
                    إغلاق الطلب
                  </button>
                </div>
              )}

              {selectedRequest.status === 'active' && (
                <button
                  onClick={() => handleDeleteRequest(selectedRequest._id)}
                  className="w-full rounded-xl border border-rose-300 bg-rose-50 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                >
                  حذف الطلب
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
