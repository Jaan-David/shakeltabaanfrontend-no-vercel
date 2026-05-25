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

type InquiryFormErrors = Partial<{
  description: string;
  materialType: string;
  quantity: string;
  address: string;
  images: string;
}>;

const emptyInquiryReplies = (inquiry?: Inquiry | null) => (Array.isArray(inquiry?.reply) ? inquiry.reply : []);

const formatOptionalText = (value?: string | null, fallback = 'غير محدد') => value?.trim() || fallback;

const formatOptionalQuantity = (value?: number) => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return 'غير محدد';
  return new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 2 }).format(value);
};

const formatBooleanValue = (value?: boolean) => {
  if (value === true) return 'نعم';
  if (value === false) return 'لا';
  return 'غير محدد';
};

const getCtaButtonState = (description: string) => {
  const trimmed = description.trim();
  const isEmpty = trimmed.length === 0;
  const isValid = trimmed.length >= 10 && trimmed.length <= 1000;
  
  if (isEmpty) {
    return {
      text: 'ابدأ الطلب',
      disabled: true,
      variant: 'start' as const,
    };
  }
  
  if (!isValid) {
    return {
      text: 'كمل الطلب',
      disabled: false,
      variant: 'progress' as const,
    };
  }
  
  return {
    text: 'إرسال الطلب',
    disabled: false,
    variant: 'ready' as const,
  };
};

const normalizeInquiryFormFields = (
  values: {
    description: string;
    materialType: string;
    quantity: string;
    address: string;
    images: File[];
  }
) => {
  const errors: InquiryFormErrors = {};
  const description = values.description.trim();
  const materialType = values.materialType.trim();
  const address = values.address.trim();
  const quantityText = values.quantity.trim();
  const parsedQuantity = quantityText ? Number(quantityText) : undefined;

  if (description.length < 10 || description.length > 1000) {
    errors.description = 'الوصف يجب أن يكون بين 10 و 1000 حرف';
  }

  if (materialType.length > 200) {
    errors.materialType = 'نوع المادة يجب ألا يتجاوز 200 حرف';
  }

  if (quantityText) {
    if (!Number.isFinite(parsedQuantity) || parsedQuantity === undefined || parsedQuantity <= 0) {
      errors.quantity = 'الكمية يجب أن تكون رقمًا أكبر من 0';
    }
  }

  if (address.length > 500) {
    errors.address = 'العنوان يجب ألا يتجاوز 500 حرف';
  }

  if (values.images.length > 5) {
    errors.images = 'يمكن رفع 5 صور كحد أقصى';
  }

  return {
    errors,
    payload: {
      description,
      materialType: materialType || undefined,
      quantity: typeof parsedQuantity === 'number' && Number.isFinite(parsedQuantity) ? parsedQuantity : undefined,
      address: address || undefined,
    },
  };
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
  const [imageViewer, setImageViewer] = useState<{ src: string; alt: string } | null>(null);
  
  // Create Service Request Form
  const [description, setDescription] = useState('');
  const [materialType, setMaterialType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [installationRequired, setInstallationRequired] = useState(false);
  const [address, setAddress] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<InquiryFormErrors>({});
  
  // Progressive Section Activation
  const [sectionEngaged, setSectionEngaged] = useState({
    basic: true, // Section 1 always starts engaged
    material: false,
    installation: false,
    attachments: false,
  });
  const [isDragOver, setIsDragOver] = useState(false);
  
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

  // Determine which sections are currently active
  const isSectionActive = (section: keyof typeof sectionEngaged) => {
    const order = ['basic', 'material', 'installation', 'attachments'];
    const currentIndex = order.indexOf(section);
    
    // A section is active if it's been engaged, or if all previous sections have been engaged
    if (sectionEngaged[section]) return true;
    
    // Check if all previous sections are engaged
    for (let i = 0; i < currentIndex; i++) {
      if (!sectionEngaged[order[i] as keyof typeof sectionEngaged]) {
        return false;
      }
    }
    
    return true;
  };

  const getSectionClasses = (section: keyof typeof sectionEngaged) => {
    const isActive = isSectionActive(section);
    const baseClasses = 'rounded-2xl border border-slate-200 bg-slate-50/80 p-4 md:p-5 transition-all duration-300';
    
    if (isActive) {
      return `${baseClasses} opacity-100 pointer-events-auto`;
    }
    
    return `${baseClasses} opacity-50 pointer-events-none`;
  };

  const updateRequestLocally = useCallback((updatedRequest: Inquiry) => {
    setRequests((current) => current.map((item) => (item._id === updatedRequest._id ? updatedRequest : item)));
    setSelectedRequest((current) => (current?._id === updatedRequest._id ? updatedRequest : current));
  }, []);

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
      setFormErrors((current) => ({ ...current, description: 'الوصف يجب أن يكون بين 10 و 1000 حرف' }));
      setErrorMessage('يرجى مراجعة الحقول المحددة في النموذج');
      return;
    }

    const validation = normalizeInquiryFormFields({
      description,
      materialType,
      quantity,
      address,
      images,
    });

    setFormErrors(validation.errors);

    if (Object.keys(validation.errors).length > 0) {
      setErrorMessage('يرجى مراجعة الحقول المحددة في النموذج');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await inquiryService.createInquiry({
        type: 'service_request',
        description: validation.payload.description,
        materialType: validation.payload.materialType,
        quantity: validation.payload.quantity,
        installationRequired,
        address: validation.payload.address,
        images,
      });
      
      setSuccessMessage('تم إنشاء طلب الخدمة بنجاح! سنرسل لك العروض قريباً');
      setDescription('');
      setMaterialType('');
      setQuantity('');
      setInstallationRequired(false);
      setAddress('');
      setImages([]);
      setFormErrors({});
      
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
      const response = await inquiryService.acceptReply(request._id, reply._id);
      setSuccessMessage('تم قبول العرض بنجاح');
      if (response.inquiry) {
        updateRequestLocally(response.inquiry);
      }
      setActiveTab('list');
      fetchRequests();
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error, 'فشل في قبول العرض'));
      console.error('Error accepting reply:', error);
    }
  }

  async function handleRejectReply(request: Inquiry) {
    try {
      const response = await inquiryService.rejectReply(request._id);
      setSuccessMessage('تم رفض العرض');
      if (response.inquiry) {
        updateRequestLocally(response.inquiry);
      }
      setActiveTab('list');
      fetchRequests();
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error, 'فشل في رفض العرض'));
      console.error('Error rejecting reply:', error);
    }
  }

  async function handleEndRequest(request: Inquiry) {
    try {
      const response = await inquiryService.endInquiry(request._id);
      setSuccessMessage('تم إغلاق الطلب بنجاح');
      if (response.inquiry) {
        updateRequestLocally(response.inquiry);
      }
      fetchRequests();
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error, 'فشل في إغلاق الطلب'));
      console.error('Error ending request:', error);
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const incomingFiles = Array.from(e.target.files);
    setImages((current) => {
      const merged = [...current, ...incomingFiles].slice(0, 5);
      if (current.length + incomingFiles.length > 5) {
        setFormErrors((currentErrors) => ({
          ...currentErrors,
          images: 'يمكن رفع 5 صور كحد أقصى',
        }));
      } else {
        setFormErrors((currentErrors) => {
          const nextErrors = { ...currentErrors };
          delete nextErrors.images;
          return nextErrors;
        });
      }
      return merged;
    });

    e.target.value = '';
  };

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
          <form onSubmit={handleCreateRequest} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">أضف طلب خدمة</h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-700"
              >
                عودة للقائمة
              </button>
            </div>

            <div className="space-y-5">
              <section className={getSectionClasses('basic')}>
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-900">معلومات أساسية</h3>
                  <p className="mt-1 text-sm text-slate-500">الوصف مطلوب لبدء الطلب والرد عليه بشكل صحيح.</p>
                </div>
                <div className="space-y-2">
                  <label className="block font-semibold text-slate-800">وصف الخدمة *</label>
                  <textarea
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      setFormErrors((current) => ({ ...current, description: undefined }));
                    }}
                    onFocus={() => setSectionEngaged((prev) => ({ ...prev, basic: true }))}
                    onBlur={() => {
                      if (description.trim().length > 0) {
                        setSectionEngaged((prev) => ({ ...prev, material: true }));
                      }
                    }}
                    rows={8}
                    maxLength={1000}
                    placeholder="مثال: احتاج لصيانة الرخام والتلميع، المساحة حوالي 200 متر...&#10;أو: تركيب جديد مع الإزالة والتنظيف"
                    className="w-full rounded-2xl border-2 border-blue-200 bg-blue-50/40 px-5 py-4 text-base text-slate-900 transition placeholder:text-slate-500 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                  />
                  <div className="flex items-center justify-between text-xs">
                    <span className={formErrors.description ? 'text-rose-600' : 'text-slate-500'}>{formErrors.description || 'من 10 إلى 1000 حرف'}</span>
                    <span className={description.length > 1000 ? 'text-rose-600' : 'text-slate-500'}>{description.length} / 1000</span>
                  </div>
                </div>
              </section>

              <section className={getSectionClasses('material')}>
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-900">تفاصيل المادة والكمية</h3>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block font-semibold text-slate-800">نوع المادة</label>
                    <input
                      value={materialType}
                      onChange={(e) => {
                        setMaterialType(e.target.value);
                        setFormErrors((current) => ({ ...current, materialType: undefined }));
                      }}
                      onFocus={() => setSectionEngaged((prev) => ({ ...prev, material: true }))}
                      onBlur={() => {
                        if (materialType.trim().length > 0 || quantity.trim().length > 0) {
                          setSectionEngaged((prev) => ({ ...prev, installation: true }));
                        }
                      }}
                      placeholder="مثال: رخام، جرانيت..."
                      maxLength={200}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                    />
                    <p className={`text-xs ${formErrors.materialType ? 'text-rose-600' : 'text-slate-500'}`}>{formErrors.materialType || 'حتى 200 حرف'}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="block font-semibold text-slate-800">الكمية</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      inputMode="decimal"
                      value={quantity}
                      onChange={(e) => {
                        setQuantity(e.target.value);
                        setFormErrors((current) => ({ ...current, quantity: undefined }));
                      }}
                      onFocus={() => setSectionEngaged((prev) => ({ ...prev, material: true }))}
                      onBlur={() => {
                        if (materialType.trim().length > 0 || quantity.trim().length > 0) {
                          setSectionEngaged((prev) => ({ ...prev, installation: true }));
                        }
                      }}
                      placeholder="رقم موجب يقبل الكسور"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                    />
                    <p className={`text-xs ${formErrors.quantity ? 'text-rose-600' : 'text-slate-500'}`}>{formErrors.quantity || 'أكبر من 0 ويسمح بالكسور'}</p>
                  </div>
                </div>
              </section>

              <section className={getSectionClasses('installation')}>
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-900">متطلبات التركيب والعنوان</h3>
                </div>
                <div className="grid gap-4 md:grid-cols-[auto,1fr] md:items-start">
                  <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800">
                    <input
                      type="checkbox"
                      checked={installationRequired}
                      onChange={(e) => setInstallationRequired(e.target.checked)}
                      onFocus={() => setSectionEngaged((prev) => ({ ...prev, installation: true }))}
                      onBlur={() => {
                        if (installationRequired || address.trim().length > 0) {
                          setSectionEngaged((prev) => ({ ...prev, attachments: true }));
                        }
                      }}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium">هل تحتاج تركيبًا؟</span>
                  </label>

                  <div className="space-y-2">
                    <label className="block font-semibold text-slate-800">العنوان</label>
                    <textarea
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        setFormErrors((current) => ({ ...current, address: undefined }));
                      }}
                      onFocus={() => setSectionEngaged((prev) => ({ ...prev, installation: true }))}
                      onBlur={() => {
                        if (address.trim().length > 0 || installationRequired) {
                          setSectionEngaged((prev) => ({ ...prev, attachments: true }));
                        }
                      }}
                      rows={3}
                      maxLength={500}
                      placeholder="اكتب العنوان أو موقع التنفيذ"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                    />
                    <p className={`text-xs ${formErrors.address ? 'text-rose-600' : 'text-slate-500'}`}>{formErrors.address || 'حتى 500 حرف'}</p>
                  </div>
                </div>
              </section>

              <section className={getSectionClasses('attachments')}>
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-900">المرفقات</h3>
                  <p className="mt-1 text-sm text-slate-500">يمكن رفع حتى 5 صور، مع معاينة واضحة قبل الإرسال.</p>
                </div>
                <input
                  type="file"
                  accept="image/*,.heic,.heif,.webp"
                  multiple
                  onChange={handleImageSelect}
                  onFocus={() => setSectionEngaged((prev) => ({ ...prev, attachments: true }))}
                  className="hidden"
                  id="service-image-upload"
                />
                <label
                  htmlFor="service-image-upload"
                  className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition ${
                    isDragOver
                      ? 'border-blue-500 bg-blue-100/50 shadow-md'
                      : 'border-slate-300 bg-white hover:border-blue-500 hover:bg-blue-50'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDragOver(false); }}
                >
                  <Upload className="h-5 w-5 text-slate-500" />
                  <span className="text-sm font-semibold text-slate-700">اختر الصور أو اسحبها هنا</span>
                  <span className="text-xs text-slate-500">HEIC, HEIF, WebP, JPEG, PNG</span>
                </label>
                <p className={`mt-3 text-xs ${formErrors.images ? 'text-rose-600' : 'text-slate-500'}`}>
                  {formErrors.images || `${images.length} / 5 صور`}
                </p>

                {images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
                    {images.map((image, index) => (
                      <div key={`${image.name}-${index}`} className="space-y-2">
                        <button
                          type="button"
                          onClick={() => setImageViewer({ src: previewUrls[index] || '/acessts/NoImage.jpg', alt: image.name })}
                          className="relative block aspect-square w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"
                        >
                          <Image
                            src={previewUrls[index] || '/acessts/NoImage.jpg'}
                            alt={image.name}
                            fill
                            sizes="(max-width: 768px) 50vw, 20vw"
                            className="object-cover transition duration-300 hover:scale-105"
                            unoptimized
                          />
                        </button>
                        <div className="flex items-start justify-between gap-2">
                          <p className="min-w-0 flex-1 truncate text-xs text-slate-600">{image.name}</p>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="rounded-full bg-rose-500 px-2 py-1 text-[10px] font-semibold text-white transition hover:bg-rose-600"
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <button
                type="submit"
                disabled={isSubmitting || getCtaButtonState(description).disabled}
                className={`inline-flex w-full items-center justify-center rounded-2xl px-8 py-4 text-base font-bold text-white shadow-lg transition ${
                  getCtaButtonState(description).disabled
                    ? 'cursor-not-allowed bg-slate-300 shadow-slate-200/50'
                    : 'bg-gradient-to-r from-blue-600 to-cyan-600 shadow-blue-200/50 hover:from-blue-700 hover:to-cyan-700'
                }`}
              >
                {isSubmitting ? 'جاري الإرسال...' : getCtaButtonState(description).text}
              </button>
            </div>
          </form>
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
          <div className="bg-slate-50 border border-slate-200 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
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
              <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 md:grid-cols-2">
                <div className="space-y-4 md:col-span-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h4 className="text-xl font-bold text-slate-900">{formatOptionalText(selectedRequest.name, 'طلب خدمة')}</h4>
                    <InquiryStatusBadge status={selectedRequest.status} />
                  </div>
                  <p className="whitespace-pre-wrap rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-700">{selectedRequest.description}</p>
                </div>

                <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">نوع المادة</p>
                  <p className="text-sm font-medium text-slate-900">{formatOptionalText(selectedRequest.materialType)}</p>
                </div>
                <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">الكمية</p>
                  <p className="text-sm font-medium text-slate-900">{formatOptionalQuantity(selectedRequest.quantity)}</p>
                </div>
                <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">التركيب مطلوب</p>
                  <p className="text-sm font-medium text-slate-900">{formatBooleanValue(selectedRequest.installationRequired)}</p>
                </div>
                <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">العنوان</p>
                  <p className="text-sm font-medium text-slate-900">{formatOptionalText(selectedRequest.address)}</p>
                </div>

                <div className="md:col-span-2 space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">التاريخ</p>
                  <p className="text-sm font-medium text-slate-900">
                    {new Date(selectedRequest.createdAt).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Images */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <h4 className="mb-3 text-sm font-semibold text-slate-700">الصور المرفقة</h4>
                {selectedRequest.imageList && selectedRequest.imageList.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {selectedRequest.imageList.map((img, index) => {
                      const resolved = resolveInquiryImage(img) || '/acessts/NoImage.jpg';
                      return (
                        <button
                          key={`${img}-${index}`}
                          type="button"
                          onClick={() => setImageViewer({ src: resolved, alt: `صورة ${index + 1}` })}
                          className="relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"
                        >
                          <Image
                            src={resolved}
                            alt={`صورة ${index + 1}`}
                            fill
                            sizes="(max-width: 768px) 50vw, 25vw"
                            className="object-cover transition duration-300 hover:scale-105"
                            unoptimized
                          />
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm text-slate-500">لا توجد صور</p>
                )}
              </div>

              {/* Replies/Offers */}
              <div className="rounded-2xl bg-white border border-slate-200 p-4">
                <h4 className="mb-3 text-sm font-semibold text-slate-700">
                  العروض المستلمة ({emptyInquiryReplies(selectedRequest).length})
                </h4>
                
                {emptyInquiryReplies(selectedRequest).length === 0 ? (
                  <p className="text-center py-6 text-sm text-slate-500">
                    لا توجد عروض حتى الآن. سنخطرك عند استلام عروض جديدة.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {emptyInquiryReplies(selectedRequest).map((reply) => (
                      <div
                        key={reply._id}
                        className={`rounded-2xl border p-4 ${
                          reply.status === 'accepted'
                            ? 'border-emerald-200 bg-emerald-50/70'
                            : reply.status === 'rejected'
                            ? 'border-rose-200 bg-rose-50/70'
                            : 'border-slate-200 bg-slate-50'
                        }`}
                      >
                        <div className="mb-3 flex items-start justify-between gap-3">
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
                        <p className="text-sm leading-6 text-slate-700 mb-3 whitespace-pre-wrap">{reply.text}</p>

                        {Array.isArray(reply.imageList) && reply.imageList.length > 0 ? (
                          <div className="mb-4 space-y-3">
                            <p className="text-sm font-semibold text-slate-700">صور الرد</p>
                            <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
                              {reply.imageList.map((img, index) => {
                                const resolved = resolveInquiryImage(img) || '/acessts/NoImage.jpg';
                                return (
                                  <button
                                    key={`${img}-${index}`}
                                    type="button"
                                    onClick={() => setImageViewer({ src: resolved, alt: `صورة الرد ${index + 1}` })}
                                    className="relative h-28 w-28 flex-none snap-start overflow-hidden rounded-2xl border border-slate-200 bg-white"
                                  >
                                    <Image
                                      src={resolved}
                                      alt={`صورة الرد ${index + 1}`}
                                      fill
                                      sizes="112px"
                                      className="object-cover transition duration-300 hover:scale-105"
                                      unoptimized
                                    />
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <p className="mb-4 text-sm text-slate-500">لا توجد صور</p>
                        )}
                        
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

      {imageViewer && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4" onClick={() => setImageViewer(null)}>
          <div className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-3xl bg-white p-3 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              onClick={() => setImageViewer(null)}
              className="absolute right-4 top-4 z-10 rounded-full bg-black/60 px-3 py-2 text-sm font-semibold text-white"
            >
              إغلاق
            </button>
            <Image
              src={imageViewer.src}
              alt={imageViewer.alt}
              width={1200}
              height={900}
              className="h-auto max-h-[85vh] w-auto max-w-full rounded-2xl object-contain"
              unoptimized
            />
          </div>
        </div>
      )}
    </div>
  );
}
