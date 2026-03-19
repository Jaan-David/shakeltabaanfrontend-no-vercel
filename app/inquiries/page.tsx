'use client';

// Disable prerendering for inquiries page to avoid build-time auth/client issues
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import { Suspense, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  inquiryService,
  type Inquiry,
  type InquiryReply
} from '@/services/api/inquiry';
import { isUserAuthenticated } from '@/services/auth/login';
import AlertHandler from '@/services/Utils/alertHandler';
import Alert from '@/components/UI/Alert/alert';
import HowItWorksSteps from './components/HowItWorksSteps';
import InquiriesHeader from './components/InquiriesHeader';
import InquiryCard from './components/InquiryCard';
import InquiryFilters from './components/InquiryFilters';
import InquiryStatusBadge from './components/InquiryStatusBadge';

export default function InquiriesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white pb-16 px-4 rtl">جاري التحميل...</div>}>
      <InquiriesPageContent />
    </Suspense>
  );
}

function InquiriesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const marbleType = searchParams?.get('marbleType') ?? '';
  
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'create'>(marbleType ? 'create' : 'list');
  const [activeStatus, setActiveStatus] = useState<'all' | 'active' | 'accepted' | 'ended'>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  
  // Create Inquiry Form
  const [description, setDescription] = useState(marbleType ? `طلب لـ: ${marbleType}\n\nالتفاصيل:\n` : '');
  const [images, setImages] = useState<File[]>([]);
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

  const parseInquiryError = (value: unknown, fallback: string) => {
    const rawMessage = extractErrorMessage(value) || fallback;
    const normalizedMessage = rawMessage.toLowerCase();

    if (normalizedMessage.includes('only accept inquiries from egyptian customers')) {
      const phoneMatch = rawMessage.match(/\+?\d{8,}/)?.[0] || '201026273185';
      const cleanPhone = phoneMatch.replace(/^\+/, '');
      return {
        message: rawMessage,
        whatsappUrl: `https://wa.me/${cleanPhone}`,
      };
    }

    return { message: rawMessage };
  };

  const fetchInquiries = useCallback(async () => {
    setIsLoading(true);
    try {
      const statusParam = activeStatus === 'all' ? undefined : activeStatus;
      const result = await inquiryService.getInquiries({ 
        page: 1, 
        limit: 100,
        status: statusParam
      });
      setInquiries(result.inquiries || []);
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error, 'فشل في تحميل الطلبات'));
      console.error('Error fetching inquiries:', error);
    }
    setIsLoading(false);
  }, [activeStatus]);

  // Fetch inquiries on mount and when filters change
  useEffect(() => {
    if (!isUserAuthenticated()) {
      router.push(`/login?redirect=${encodeURIComponent('/inquiries')}`);
      return;
    }
    fetchInquiries();
  }, [fetchInquiries, router]);

  async function handleCreateInquiry(e: React.FormEvent) {
    e.preventDefault();
    
    if (!description.trim() || description.length < 10 || description.length > 1000) {
      setErrorMessage('الوصف يجب أن يكون بين 10 و 1000 حرف');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await inquiryService.createInquiry({
        description,
        images,
      });
      
      setSuccessMessage('تم إنشاء الطلب بنجاح! سنرسل لك العروض قريباً');
      setDescription(marbleType ? `طلب لـ: ${marbleType}\n\nالتفاصيل:\n` : '');
      setImages([]);
      
      // Refresh inquiries list
      setTimeout(() => {
        fetchInquiries();
        setActiveTab('list');
      }, 1500);
    } catch (error: unknown) {
      const parsedError = parseInquiryError(error, 'فشل في إنشاء الطلب');
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
      console.error('Error creating inquiry:', error);
    }
    
    setIsSubmitting(false);
  }

  async function handleAcceptReply(inquiry: Inquiry, reply: InquiryReply) {
    try {
      await inquiryService.acceptReply(inquiry._id, reply._id);
      setSuccessMessage('تم قبول العرض بنجاح');
      setSelectedInquiry(null);
      setActiveTab('list');
      setActiveStatus('accepted');
      fetchInquiries();
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error, 'فشل في قبول العرض'));
      console.error('Error accepting reply:', error);
    }
  }

  async function handleRejectReply(inquiry: Inquiry) {
    try {
      await inquiryService.rejectReply(inquiry._id);
      setSuccessMessage('تم رفض العرض');
      setSelectedInquiry(null);
      setActiveTab('list');
      setActiveStatus('active');
      fetchInquiries();
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error, 'فشل في رفض العرض'));
      console.error('Error rejecting reply:', error);
    }
  }

  async function handleEndInquiry(inquiry: Inquiry) {
    try {
      await inquiryService.endInquiry(inquiry._id);
      setSuccessMessage('تم إغلاق الطلب بنجاح');
      fetchInquiries();
      setSelectedInquiry(null);
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error, 'فشل في إغلاق الطلب'));
      console.error('Error ending inquiry:', error);
    }
  }

  async function handleDeleteInquiry(inquiryId: string) {
    if (confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
      try {
        await inquiryService.deleteInquiry(inquiryId);
        setSuccessMessage('تم حذف الطلب بنجاح');
        fetchInquiries();
        setSelectedInquiry(null);
      } catch (error: unknown) {
        setErrorMessage(getErrorMessage(error, 'فشل في حذف الطلب'));
        console.error('Error deleting inquiry:', error);
      }
    }
  }

  const filteredInquiries = activeStatus === 'all' 
    ? inquiries 
    : inquiries.filter(i => i.status === activeStatus);

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
          title="طلبيتك الخاصه"
          subtitle="اكتب طلبك وسيقوم الموردون بإرسال عروض أسعار — اختر العرض المناسب وابدأ التنفيذ بسهولة."
        />

        {/* شرح الرحلة للعميل قبل عرض الطلبات */}
        <HowItWorksSteps />

        <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => setActiveTab('create')}
              className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              طلب جديد
            </button>
            <span className="text-sm text-slate-500">ابدأ طلبك في أقل من دقيقة</span>
          </div>
          <InquiryFilters
            activeStatus={activeStatus}
            onChange={setActiveStatus}
            count={filteredInquiries.length}
          />
        </div>

        {/* List Tab */}
        {activeTab === 'list' && (
          <div className="space-y-5">
            {isLoading ? (
              <div className="rounded-2xl border border-slate-200 bg-white py-12 text-center shadow-sm">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
                <p className="mt-4 text-slate-600">جاري التحميل...</p>
              </div>
            ) : filteredInquiries.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <p className="text-lg text-slate-600">لا توجد طلبات حالياً</p>
                <p className="mt-2 text-sm text-slate-500">ابدأ بطلب جديد ليصلك أفضل العروض.</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="mt-4 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                  إنشاء طلب جديد
                </button>
              </div>
            ) : (
              filteredInquiries.map((inquiry) => (
                <InquiryCard
                  key={inquiry._id}
                  inquiry={inquiry}
                  onViewDetails={() => setSelectedInquiry(inquiry)}
                  onViewOffers={() => setSelectedInquiry(inquiry)}
                />
              ))
            )}
          </div>
        )}

        {/* Create Tab */}
        {activeTab === 'create' && (
          <form onSubmit={handleCreateInquiry} className="max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">إنشاء طلب جديد</h2>
              {/* العودة تساعد المستخدم على استكمال المتابعة بعد إنشاء الطلب. */}
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-700"
              >
                عودة للطلبات
              </button>
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-slate-800 font-semibold mb-2">وصف الطلب *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="اكتب وصف تفصيلي لما تحتاج..."
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 resize-none bg-slate-50 text-slate-900"
                rows={5}
              />
              <div className="flex justify-between items-center mt-2 text-sm">
                <span className={`${description.length < 10 ? 'text-rose-500' : 'text-slate-400'}`}>
                  الحد الأدنى: 10 أحرف
                </span>
                <span className={`${description.length > 1000 ? 'text-rose-500' : 'text-slate-400'}`}>
                  {description.length} / 1000 حرف
                </span>
              </div>
            </div>

            {/* Images */}
            <div className="mb-6">
              <label className="block text-slate-800 font-semibold mb-2">صور (اختياري - حتى 5 صور)</label>
              <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer bg-slate-50">
                <input
                  type="file"
                  multiple
                  accept="image/*,.heic,.heif,.webp"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []).slice(0, 5);
                    setImages(files);
                  }}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <p className="text-slate-700">اسحب الصور أو اضغط للاختيار</p>
                  <p className="text-sm text-slate-500 mt-1">دعم HEIC, HEIF, WebP, JPEG, PNG</p>
                </label>
              </div>

              {/* Selected Images Preview */}
              {images.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-4">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <div className="w-full aspect-square bg-slate-100 rounded-lg overflow-hidden">
                        <Image
                          src={URL.createObjectURL(img)}
                          alt="preview"
                          width={160}
                          height={160}
                          sizes="(max-width: 768px) 30vw, 160px"
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setImages(images.filter((_, i) => i !== idx))}
                        className="absolute top-2 right-2 bg-rose-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                      <p className="text-xs text-slate-600 mt-1 truncate">{img.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !description.trim() || description.length < 10 || description.length > 1000}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none disabled:shadow-none"
            >
              {isSubmitting ? 'جاري الإرسال...' : 'إنشاء الطلب'}
            </button>
          </form>
        )}
      </div>

      {activeTab === 'list' && (
        <div className="fixed bottom-4 left-4 right-4 z-40 md:hidden">
          {/* زر ثابت على الموبايل لتقليل التشتت وزيادة التحويل. */}
          <button
            onClick={() => setActiveTab('create')}
            className="w-full rounded-2xl bg-blue-600 py-3 text-base font-semibold text-white shadow-lg shadow-blue-200/50 transition hover:bg-blue-700"
          >
            طلب جديد
          </button>
        </div>
      )}

      {/* Inquiry Details Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-blue-600 text-white p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">تفاصيل الطلب</h2>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="text-2xl font-bold hover:text-slate-100"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Inquiry Info */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4">{selectedInquiry.name}</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-slate-600 text-sm">الحالة</p>
                    <InquiryStatusBadge status={selectedInquiry.status} />
                  </div>
                  <div>
                    <p className="text-slate-600 text-sm">التاريخ</p>
                    <p className="text-slate-900 font-medium">
                      {new Date(selectedInquiry.createdAt).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-slate-600 text-sm mb-2">الوصف</p>
                  <p className="text-slate-900 bg-slate-100 p-4 rounded-lg border border-slate-200">{selectedInquiry.description}</p>
                </div>

                {selectedInquiry.imageList && selectedInquiry.imageList.length > 0 && (
                  <div className="mb-4">
                    <p className="text-slate-600 text-sm mb-2">الصور</p>
                    <div className="grid grid-cols-4 gap-2">
                      {selectedInquiry.imageList.map((img, idx) => (
                        <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-slate-100">
                          <Image
                            src={img}
                            alt="inquiry"
                            width={160}
                            height={160}
                            sizes="(max-width: 768px) 25vw, 160px"
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Replies Section */}
              {selectedInquiry.reply && selectedInquiry.reply.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-slate-900 mb-4">العروض ({selectedInquiry.reply.length})</h4>
                  <div className="space-y-4">
                    {selectedInquiry.reply.map((reply, idx) => (
                      <div
                        key={idx}
                        className={`border-2 rounded-lg p-4 ${
                          reply.status === 'accepted'
                            ? 'border-emerald-400 bg-emerald-50'
                            : reply.status === 'rejected'
                            ? 'border-rose-400 bg-rose-50'
                            : 'border-slate-200'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-bold text-slate-900">الشركة</p>
                            <p className="text-slate-600 text-sm">{reply.organizationId}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            reply.status === 'accepted'
                              ? 'bg-emerald-100 text-emerald-800'
                              : reply.status === 'rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {reply.status === 'accepted' ? 'مقبول' : reply.status === 'rejected' ? 'مرفوض' : 'قيد الانتظار'}
                          </span>
                        </div>

                        <p className="text-slate-900 mb-4">{reply.text}</p>

                        <p className="text-slate-600 text-sm mb-4">
                          {new Date(reply.createdAt).toLocaleDateString('ar-EG')}
                        </p>

                        {/* Reply Actions */}
                        {selectedInquiry.status === 'active' && reply.status === 'pending' && (
                          <button
                            onClick={() => handleAcceptReply(selectedInquiry, reply)}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-semibold transition-colors shadow-sm"
                          >
                            ✓ قبول هذا العرض
                          </button>
                        )}

                        {selectedInquiry.status === 'accepted' && selectedInquiry.acceptedReplyId === reply._id && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleRejectReply(selectedInquiry)}
                              className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2 rounded-lg font-semibold transition-colors shadow-sm"
                            >
                              ✕ رفض العرض
                            </button>
                            <button
                              onClick={() => handleEndInquiry(selectedInquiry)}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition-colors shadow-sm"
                            >
                              ✓ إغلاق الطلب
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedInquiry.reply.length === 0 && (
                <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-4 mb-6 text-center">
                  <p className="text-slate-800">لا توجد عروض حتى الآن</p>
                  <p className="text-slate-600 text-sm mt-1">ستتلقى عروض من الشركات المختلفة قريباً</p>
                </div>
              )}

              {/* Delete Button */}
              {selectedInquiry.status !== 'accepted' && selectedInquiry.status !== 'ended' && (
                <button
                  onClick={() => handleDeleteInquiry(selectedInquiry._id)}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white py-2 rounded-lg font-semibold transition-colors shadow-sm"
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
