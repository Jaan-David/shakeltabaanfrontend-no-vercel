'use client';

import { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  inquiryService,
  type Inquiry,
  type InquiryReply
} from '@/services/api/inquiry';
import { Api } from '@/services/api/endpoints';
import { isUserAuthenticated } from '@/services/auth/login';
import AlertHandler from '@/services/Utils/alertHandler';
import Alert from '@/components/UI/Alert/alert';
import HowItWorksSteps from './components/HowItWorksSteps';
import InquiriesHeader from './components/InquiriesHeader';
import InquiryCard from './components/InquiryCard';
import InquiryFilters from './components/InquiryFilters';
import InquiryStatusBadge from './components/InquiryStatusBadge';

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
  const pageFromQuery = Number(searchParams?.get('page') || 1);
  const limitFromQuery = Number(searchParams?.get('limit') || 20);
  const page = Number.isFinite(pageFromQuery) && pageFromQuery > 0 ? pageFromQuery : 1;
  const limit =
    Number.isFinite(limitFromQuery) && limitFromQuery > 0 && limitFromQuery <= 100
      ? limitFromQuery
      : 20;
  
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'create'>(marbleType ? 'create' : 'list');
  const [activeStatus, setActiveStatus] = useState<'all' | 'active' | 'accepted' | 'ended'>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [imageViewer, setImageViewer] = useState<{ src: string; alt: string } | null>(null);
  
  // Create Inquiry Form
  const [description, setDescription] = useState('');
  const [materialType, setMaterialType] = useState(marbleType);
  const [quantity, setQuantity] = useState('');
  const [installationRequired, setInstallationRequired] = useState(false);
  const [address, setAddress] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitTimestampsRef] = useState(() => ({ current: [] as number[] }));
  const [formErrors, setFormErrors] = useState<InquiryFormErrors>({});
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
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

  useEffect(() => {
    const objectUrls = images.map((file) => URL.createObjectURL(file));
    setPreviewUrls(objectUrls);
    setActiveImageIndex((current) => (objectUrls.length === 0 ? 0 : Math.min(current, objectUrls.length - 1)));

    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images]);

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

  const updateInquiryLocally = useCallback((updatedInquiry: Inquiry) => {
    setInquiries((current) => current.map((item) => (item._id === updatedInquiry._id ? updatedInquiry : item)));
    setSelectedInquiry((current) => (current?._id === updatedInquiry._id ? updatedInquiry : current));
  }, []);

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

  const fetchInquiries = useCallback(async () => {
    setIsLoading(true);
    try {
      const statusParam = activeStatus === 'all' ? undefined : activeStatus;
      const result = await inquiryService.getInquiries({ 
        page,
        limit,
        type: 'normal',
        status: statusParam
      });
      setInquiries(result.inquiries || []);
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error, 'فشل في تحميل الطلبات'));
      console.error('Error fetching inquiries:', error);
    }
    setIsLoading(false);
  }, [activeStatus, limit, page]);

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

    const now = Date.now();
    const windowMs = 60_000;
    const maxAttemptsPerWindow = 3;

    submitTimestampsRef.current = submitTimestampsRef.current.filter(
      (timestamp) => now - timestamp < windowMs
    );

    if (submitTimestampsRef.current.length >= maxAttemptsPerWindow) {
      setErrorMessage('تم إرسال محاولات كثيرة خلال دقيقة. يرجى الانتظار قليلاً ثم المحاولة مرة أخرى.');
      return;
    }

    submitTimestampsRef.current.push(now);

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
        description: validation.payload.description,
        materialType: validation.payload.materialType,
        quantity: validation.payload.quantity,
        installationRequired,
        address: validation.payload.address,
        images,
      });
      
      setSuccessMessage('تم إنشاء الطلب بنجاح! سنرسل لك العروض قريباً');
      setDescription('');
      setMaterialType(marbleType);
      setQuantity('');
      setInstallationRequired(false);
      setAddress('');
      setImages([]);
      setFormErrors({});
      
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
      const response = await inquiryService.acceptReply(inquiry._id, reply._id);
      setSuccessMessage('تم قبول العرض بنجاح');
      if (response.inquiry) {
        updateInquiryLocally(response.inquiry);
      }
      setActiveTab('list');
      fetchInquiries();
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error, 'فشل في قبول العرض'));
      console.error('Error accepting reply:', error);
    }
  }

  async function handleRejectReply(inquiry: Inquiry) {
    try {
      const response = await inquiryService.rejectReply(inquiry._id);
      setSuccessMessage('تم رفض العرض');
      if (response.inquiry) {
        updateInquiryLocally(response.inquiry);
      }
      setActiveTab('list');
      fetchInquiries();
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error, 'فشل في رفض العرض'));
      console.error('Error rejecting reply:', error);
    }
  }

  async function handleEndInquiry(inquiry: Inquiry) {
    try {
      const response = await inquiryService.endInquiry(inquiry._id);
      setSuccessMessage('تم إغلاق الطلب بنجاح');
      if (response.inquiry) {
        updateInquiryLocally(response.inquiry);
      }
      fetchInquiries();
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

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files || []).filter((file) =>
      file.type.startsWith('image/')
    );

    if (droppedFiles.length === 0) {
      setErrorMessage('يرجى إرسال ملفات صور فقط');
      return;
    }

    setImages((current) => {
      const merged = [...current, ...droppedFiles].slice(0, 5);
      if (current.length + droppedFiles.length > 5) {
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
  };

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
          title="طلبيتك الخاصه(للطلبات فوق ٥٠ متر )"
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
          <form onSubmit={handleCreateInquiry} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">أضف طلبك</h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-700"
              >
                عودة للطلبات
              </button>
            </div>

            <div className="space-y-5">
              <section className={getSectionClasses('basic')}>
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-900"> معلومات أساسية (لو في اكتر من نوع خامه يرجي كتابه التفاصيل كامله بالكميات )</h3>
                  <p className="mt-1 text-sm text-slate-500">الوصف مطلوب، ويمكنك إضافة باقي البيانات لتحسين دقة الطلب.</p>
                </div>
                <div className="space-y-2">
                  <label className="block font-semibold text-slate-800">وصف الطلب *</label>
                  <textarea
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      setFormErrors((current) => ({ ...current, description: undefined }));
                    }}
                    onFocus={() => setSectionEngaged((prev) => ({ ...prev, basic: true }))}
                    onBlur={() => {
                      // Engage material section if description has input
                      if (description.trim().length > 0) {
                        setSectionEngaged((prev) => ({ ...prev, material: true }));
                      }
                    }}
                    placeholder="مثال: احتاج إلى رخام للأرضيات في الفيلا، بيج فاتح، مقاس كبير...&#10;أو: جرانيت أسود للمطبخ مع تركيب"
                    className="w-full rounded-2xl border-2 border-blue-200 bg-blue-50/40 px-5 py-4 text-base text-slate-900 transition placeholder:text-slate-500 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                    rows={8}
                    maxLength={1000}
                  />
                  <div className="flex items-center justify-between text-xs">
                    <span className={formErrors.description ? 'text-rose-600' : 'text-slate-500'}>
                      {formErrors.description || 'من 10 إلى 1000 حرف'}
                    </span>
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
                      placeholder="مثال: رخام كرارة، جرانيت..."
                      maxLength={200}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                    />
                    <p className={`text-xs ${formErrors.materialType ? 'text-rose-600' : 'text-slate-500'}`}>
                      {formErrors.materialType || 'حتى 200 حرف'}
                    </p>
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
                      placeholder="رقم موجب مع الكسور"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                    />
                    <p className={`text-xs ${formErrors.quantity ? 'text-rose-600' : 'text-slate-500'}`}>
                      {formErrors.quantity || 'أكبر من 0 ويسمح بالكسور'}
                    </p>
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
                      placeholder="اكتب العنوان أو الموقع التقريبي"
                      rows={3}
                      maxLength={500}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                    />
                    <p className={`text-xs ${formErrors.address ? 'text-rose-600' : 'text-slate-500'}`}>
                      {formErrors.address || 'حتى 500 حرف'}
                    </p>
                  </div>
                </div>
              </section>

              <section className={getSectionClasses('attachments')}>
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-900">المرفقات</h3>
                  <p className="mt-1 text-sm text-slate-500">يمكن رفع حتى 5 صور، وسيظهر لك معاينة واضحة قبل الإرسال.</p>
                </div>
                <div className="space-y-3">
                  <input
                    type="file"
                    multiple
                    accept="image/*,.heic,.heif,.webp"
                    onChange={handleImageSelect}
                    onFocus={() => setSectionEngaged((prev) => ({ ...prev, attachments: true }))}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition ${
                      isDragOver
                        ? 'border-blue-500 bg-blue-100/50 shadow-md'
                        : 'border-slate-300 bg-white hover:border-blue-500 hover:bg-blue-50'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <span className="text-sm font-semibold text-slate-700">اختر الصور أو اسحبها هنا</span>
                    <span className="text-xs text-slate-500">HEIC, HEIF, WebP, JPEG, PNG</span>
                  </label>
                  <p className={`text-xs ${formErrors.images ? 'text-rose-600' : 'text-slate-500'}`}>
                    {formErrors.images || `${images.length} / 5 صور`}
                  </p>

                  {images.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                      {images.map((image, index) => (
                        <div key={`${image.name}-${index}`} className="group space-y-2">
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
                              className="object-cover transition duration-300 group-hover:scale-105"
                              unoptimized
                            />
                          </button>
                          <div className="flex items-start justify-between gap-2">
                            <p className="min-w-0 flex-1 truncate text-xs text-slate-600">{image.name}</p>
                            <button
                              type="button"
                              onClick={() => setImages((current) => current.filter((_, i) => i !== index))}
                              className="rounded-full bg-rose-500 px-2 py-1 text-[10px] font-semibold text-white transition hover:bg-rose-600"
                            >
                              حذف
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
          <div className="bg-slate-50 border border-slate-200 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-blue-600 text-white p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold">تفاصيل الطلب</h2>
                <p className="mt-1 text-sm text-blue-100">راجع البيانات، الردود، والصور من مكان واحد.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => router.push(`/inquiries/${selectedInquiry._id}`)}
                  className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  تعديل الاستفسار
                </button>
                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="text-2xl font-bold hover:text-slate-100"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="space-y-6 p-6">
              {/* Inquiry Info */}
              <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 md:grid-cols-2">
                <div className="space-y-4 md:col-span-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl font-bold text-slate-900">{formatOptionalText(selectedInquiry.name, 'طلب خاص')}</h3>
                    <InquiryStatusBadge status={selectedInquiry.status} />
                  </div>
                  <p className="whitespace-pre-wrap rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-700">{selectedInquiry.description}</p>
                </div>

                <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">نوع المادة</p>
                  <p className="text-sm font-medium text-slate-900">{formatOptionalText(selectedInquiry.materialType)}</p>
                </div>
                <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">الكمية</p>
                  <p className="text-sm font-medium text-slate-900">{formatOptionalQuantity(selectedInquiry.quantity)}</p>
                </div>
                <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">التركيب مطلوب</p>
                  <p className="text-sm font-medium text-slate-900">{formatBooleanValue(selectedInquiry.installationRequired)}</p>
                </div>
                <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">العنوان</p>
                  <p className="text-sm font-medium text-slate-900">{formatOptionalText(selectedInquiry.address)}</p>
                </div>

                <div className="space-y-2 md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">الحالة والتاريخ</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-700">{new Date(selectedInquiry.createdAt).toLocaleDateString('ar-EG')}</span>
                  </div>
                </div>

                <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="mb-3 text-sm font-semibold text-slate-700">الصور</p>
                  {selectedInquiry.imageList && selectedInquiry.imageList.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                      {selectedInquiry.imageList.map((img, idx) => {
                        const resolved = resolveInquiryImage(img) || '/acessts/NoImage.jpg';
                        return (
                          <button
                            key={`${img}-${idx}`}
                            type="button"
                            onClick={() => setImageViewer({ src: resolved, alt: `صورة الاستفسار ${idx + 1}` })}
                            className="relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-white"
                          >
                            <Image
                              src={resolved}
                              alt={`صورة ${idx + 1}`}
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
                    <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-center text-sm text-slate-500">لا توجد صور</p>
                  )}
                </div>
              </div>

              {/* Replies Section */}
              {emptyInquiryReplies(selectedInquiry).length > 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h4 className="text-lg font-bold text-slate-900 mb-4">العروض ({emptyInquiryReplies(selectedInquiry).length})</h4>
                  <div className="space-y-4">
                    {emptyInquiryReplies(selectedInquiry).map((reply, idx) => (
                      <div
                        key={idx}
                        className={`rounded-2xl border p-4 shadow-sm ${
                          reply.status === 'accepted'
                            ? 'border-emerald-200 bg-emerald-50/70'
                            : reply.status === 'rejected'
                            ? 'border-rose-200 bg-rose-50/70'
                            : 'border-slate-200 bg-slate-50'
                        }`}
                      >
                        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="font-bold text-slate-900">الرد</p>
                            <p className="text-sm text-slate-600">{formatOptionalText(reply.organizationId, 'مقدم الخدمة')}</p>
                          </div>
                          <span className={`rounded-full px-3 py-1 text-sm font-medium ${
                            reply.status === 'accepted'
                              ? 'bg-emerald-100 text-emerald-800'
                              : reply.status === 'rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {reply.status === 'accepted' ? 'مقبول' : reply.status === 'rejected' ? 'مرفوض' : 'قيد الانتظار'}
                          </span>
                        </div>

                        <p className="mb-4 whitespace-pre-wrap text-slate-900">{reply.text}</p>

                        {Array.isArray(reply.imageList) && reply.imageList.length > 0 ? (
                          <div className="mb-4 space-y-3">
                            <p className="text-sm font-semibold text-slate-700">صور الرد</p>
                            <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
                              {reply.imageList.map((img, imageIndex) => {
                                const resolved = resolveInquiryImage(img) || '/acessts/NoImage.jpg';
                                return (
                                  <button
                                    key={`${img}-${imageIndex}`}
                                    type="button"
                                    onClick={() => setImageViewer({ src: resolved, alt: `صورة الرد ${imageIndex + 1}` })}
                                    className="relative h-28 w-28 flex-none snap-start overflow-hidden rounded-2xl border border-slate-200 bg-white"
                                  >
                                    <Image
                                      src={resolved}
                                      alt={`صورة الرد ${imageIndex + 1}`}
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

                        <p className="text-sm text-slate-500 mb-4">{new Date(reply.createdAt).toLocaleDateString('ar-EG')}</p>

                        {/* Reply Actions */}
                        {selectedInquiry.status === 'active' && reply.status === 'pending' && (
                          <button
                            onClick={() => handleAcceptReply(selectedInquiry, reply)}
                            className="w-full rounded-xl bg-emerald-600 py-2 font-semibold text-white transition-colors shadow-sm hover:bg-emerald-700"
                          >
                            ✓ قبول هذا العرض
                          </button>
                        )}

                        {selectedInquiry.status === 'accepted' && selectedInquiry.acceptedReplyId === reply._id && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleRejectReply(selectedInquiry)}
                              className="flex-1 rounded-xl bg-rose-600 py-2 font-semibold text-white transition-colors shadow-sm hover:bg-rose-700"
                            >
                              ✕ رفض العرض
                            </button>
                            <button
                              onClick={() => handleEndInquiry(selectedInquiry)}
                              className="flex-1 rounded-xl bg-blue-600 py-2 font-semibold text-white transition-colors shadow-sm hover:bg-blue-700"
                            >
                              ✓ إغلاق الطلب
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-slate-500">
                  لا يوجد ردود حتى الآن
                </div>
              )}

              {/* Delete Button */}
              {selectedInquiry.status !== 'accepted' && selectedInquiry.status !== 'ended' && (
                <button
                  onClick={() => handleDeleteInquiry(selectedInquiry._id)}
                  className="w-full rounded-xl border border-rose-300 bg-rose-50 py-3 font-semibold text-rose-700 transition hover:bg-rose-100"
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
