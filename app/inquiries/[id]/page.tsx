"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { inquiryService, type Inquiry, type UpdateInquiryData } from '@/services/api/inquiry';
import { Button } from '@/components/UI/Buttons/Button';
import { ArrowLeft, Edit, Save, X, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { isAuthenticated } from '@/utils/auth';

type InquiryFormErrors = Partial<{
  description: string;
  materialType: string;
  quantity: string;
  address: string;
  images: string;
}>;

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

const normalizeInquiryFormFields = (
  values: { description: string; materialType: string; quantity: string; address: string; images: File[] }
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
  if (quantityText && (!Number.isFinite(parsedQuantity) || parsedQuantity === undefined || parsedQuantity <= 0)) {
    errors.quantity = 'الكمية يجب أن تكون رقمًا أكبر من 0';
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

export default function InquiryDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const inquiryId = params?.id as string;

  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [imageViewer, setImageViewer] = useState<{ src: string; alt: string } | null>(null);
  const [editData, setEditData] = useState<UpdateInquiryData>({ description: '' });
  const [editMaterialType, setEditMaterialType] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editInstallationRequired, setEditInstallationRequired] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedImagePreviews, setSelectedImagePreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<InquiryFormErrors>({});

  const getErrorMessage = (value: unknown, fallback: string) => {
    if (value && typeof value === 'object' && 'message' in value) {
      const message = (value as { message?: unknown }).message;
      if (typeof message === 'string') return message;
    }
    return fallback;
  };

  const fetchInquiry = useCallback(async () => {
    try {
      setLoading(true);
      const response = await inquiryService.getInquiryById(inquiryId);
      setInquiry(response.inquiry);
      setEditData({
        description: response.inquiry.description,
        materialType: response.inquiry.materialType,
        quantity: response.inquiry.quantity,
        installationRequired: response.inquiry.installationRequired,
        address: response.inquiry.address,
      });
      setEditMaterialType(response.inquiry.materialType || '');
      setEditQuantity(typeof response.inquiry.quantity === 'number' ? String(response.inquiry.quantity) : '');
      setEditAddress(response.inquiry.address || '');
      setEditInstallationRequired(Boolean(response.inquiry.installationRequired));
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'فشل تحميل الطلب'));
      console.error('Error fetching inquiry:', err);
    } finally {
      setLoading(false);
    }
  }, [inquiryId]);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    if (inquiryId) {
      fetchInquiry();
    }
  }, [inquiryId, router, fetchInquiry]);

  useEffect(() => {
    const objectUrls = selectedImages.map((file) => URL.createObjectURL(file));
    setSelectedImagePreviews(objectUrls);

    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [selectedImages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setSelectedImages((prev) => [...prev, ...files].slice(0, 5));
    e.target.value = '';
  };

  const handleUpdate = async () => {
    const validation = normalizeInquiryFormFields({
      description: editData.description || '',
      materialType: editMaterialType,
      quantity: editQuantity,
      address: editAddress,
      images: selectedImages,
    });

    setFormErrors(validation.errors);

    if (Object.keys(validation.errors).length > 0) {
      setError('يرجى مراجعة الحقول المحددة في النموذج');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await inquiryService.updateInquiry(inquiryId, {
        description: validation.payload.description,
        materialType: validation.payload.materialType,
        quantity: validation.payload.quantity,
        installationRequired: editInstallationRequired,
        address: validation.payload.address,
        images: selectedImages.length > 0 ? selectedImages : undefined,
      });

      if (response.data?.inquiry) {
        setInquiry(response.data.inquiry);
      }
      setEditing(false);
      setSelectedImages([]);
      setSelectedImagePreviews([]);
      setFormErrors({});
      fetchInquiry();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'فشل تحديث الطلب'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptReply = async (replyId: string) => {
    if (!confirm('هل أنت متأكد من قبول هذا العرض؟')) return;

    try {
      const response = await inquiryService.acceptReply(inquiryId, replyId);
      if (response.inquiry) {
        setInquiry(response.inquiry);
      }
      fetchInquiry();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'فشل قبول الرد'));
    }
  };

  const handleRejectReply = async () => {
    if (!confirm('هل أنت متأكد من رفض العرض المقبول؟')) return;

    try {
      const response = await inquiryService.rejectReply(inquiryId);
      if (response.inquiry) {
        setInquiry(response.inquiry);
      }
      fetchInquiry();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'فشل رفض الرد'));
    }
  };

  const handleEndInquiry = async () => {
    if (!confirm('هل أنت متأكد من إنهاء هذا الطلب؟')) return;

    try {
      const response = await inquiryService.endInquiry(inquiryId);
      if (response.inquiry) {
        setInquiry(response.inquiry);
      }
      fetchInquiry();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'فشل إنهاء الطلب'));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/20 px-4 py-2 text-blue-400"><Clock className="h-4 w-4" />نشط</span>;
      case 'accepted':
        return <span className="flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/20 px-4 py-2 text-green-400"><CheckCircle className="h-4 w-4" />مقبول</span>;
      case 'ended':
        return <span className="flex items-center gap-2 rounded-full border border-gray-500/30 bg-gray-500/20 px-4 py-2 text-gray-400"><XCircle className="h-4 w-4" />منتهي</span>;
      default:
        return null;
    }
  };

  const getReplyStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="rounded-full border border-yellow-500/30 bg-yellow-500/20 px-2 py-1 text-xs text-yellow-400">معلق</span>;
      case 'accepted':
        return <span className="rounded-full border border-green-500/30 bg-green-500/20 px-2 py-1 text-xs text-green-400">مقبول</span>;
      case 'rejected':
        return <span className="rounded-full border border-red-500/30 bg-red-500/20 px-2 py-1 text-xs text-red-400">مرفوض</span>;
      default:
        return null;
    }
  };

  const replies = Array.isArray(inquiry?.reply) ? inquiry.reply : [];
  const currentImages = Array.isArray(inquiry?.imageList) ? inquiry.imageList : [];

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900"><div className="text-xl text-white">جاري التحميل...</div></div>;
  }

  if (!inquiry) {
    return <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900"><div className="text-xl text-red-400">لم يتم العثور على الطلب</div></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 px-4 pb-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between gap-4 pt-4">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-purple-400 transition hover:text-purple-300">
            <ArrowLeft className="h-5 w-5" />
            رجوع
          </button>
          {getStatusBadge(inquiry.status)}
        </div>

        <div className="mb-6 rounded-3xl border border-slate-700 bg-slate-800/50 p-6 backdrop-blur-sm md:p-8">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm text-slate-400">Customer Inquiry Form (Update)</p>
              <h1 className="mt-2 text-3xl font-bold text-white">تفاصيل الطلب وتعديله</h1>
            </div>
            {inquiry.status !== 'ended' && (
              <button
                onClick={() => setEditing((current) => !current)}
                className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-300 transition hover:bg-blue-500/20"
              >
                {editing ? <X className="h-5 w-5" /> : <Edit className="h-5 w-5" />}
                {editing ? 'إلغاء' : 'تعديل'}
              </button>
            )}
          </div>

          {editing ? (
            <div className="space-y-5">
              <section className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4 md:p-5">
                <h2 className="mb-3 text-lg font-bold text-white">معلومات أساسية</h2>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-200">الوصف *</label>
                  <textarea
                    value={editData.description || ''}
                    onChange={(e) => {
                      setEditData({ ...editData, description: e.target.value });
                      setFormErrors((current) => ({ ...current, description: undefined }));
                    }}
                    className="min-h-[160px] w-full rounded-2xl border border-slate-700 bg-slate-950/60 p-4 text-white outline-none transition focus:border-blue-500"
                    placeholder="الوصف"
                  />
                  <p className={`text-xs ${formErrors.description ? 'text-rose-400' : 'text-slate-400'}`}>{formErrors.description || 'من 10 إلى 1000 حرف'}</p>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4 md:p-5">
                <h2 className="mb-3 text-lg font-bold text-white">تفاصيل المادة والكمية</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-200">نوع المادة</label>
                    <input
                      value={editMaterialType}
                      onChange={(e) => {
                        setEditMaterialType(e.target.value);
                        setFormErrors((current) => ({ ...current, materialType: undefined }));
                      }}
                      maxLength={200}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                      placeholder="مثال: رخام كرارة"
                    />
                    <p className={`text-xs ${formErrors.materialType ? 'text-rose-400' : 'text-slate-400'}`}>{formErrors.materialType || 'حتى 200 حرف'}</p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-200">الكمية</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      inputMode="decimal"
                      value={editQuantity}
                      onChange={(e) => {
                        setEditQuantity(e.target.value);
                        setFormErrors((current) => ({ ...current, quantity: undefined }));
                      }}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                      placeholder="اختياري"
                    />
                    <p className={`text-xs ${formErrors.quantity ? 'text-rose-400' : 'text-slate-400'}`}>{formErrors.quantity || 'أكبر من 0 ويسمح بالكسور'}</p>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4 md:p-5">
                <h2 className="mb-3 text-lg font-bold text-white">متطلبات التركيب والعنوان</h2>
                <div className="grid gap-4 md:grid-cols-[auto,1fr] md:items-start">
                  <label className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-slate-200">
                    <input
                      type="checkbox"
                      checked={editInstallationRequired}
                      onChange={(e) => setEditInstallationRequired(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium">هل تحتاج تركيبًا؟</span>
                  </label>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-200">العنوان</label>
                    <textarea
                      value={editAddress}
                      onChange={(e) => {
                        setEditAddress(e.target.value);
                        setFormErrors((current) => ({ ...current, address: undefined }));
                      }}
                      rows={3}
                      maxLength={500}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                      placeholder="العنوان"
                    />
                    <p className={`text-xs ${formErrors.address ? 'text-rose-400' : 'text-slate-400'}`}>{formErrors.address || 'حتى 500 حرف'}</p>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4 md:p-5">
                <h2 className="mb-3 text-lg font-bold text-white">الصور الحالية والجديدة</h2>
                <div className="space-y-5">
                  <div>
                    <p className="mb-3 text-sm font-semibold text-slate-300">الصور الحالية</p>
                    {currentImages.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        {currentImages.map((img, index) => (
                          <button
                            key={`${img}-${index}`}
                            type="button"
                            onClick={() => setImageViewer({ src: img, alt: `صورة حالية ${index + 1}` })}
                            className="relative aspect-square overflow-hidden rounded-2xl border border-slate-700 bg-slate-950/60"
                          >
                            <Image src={img} alt={`صورة حالية ${index + 1}`} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" unoptimized />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 p-4 text-center text-sm text-slate-400">لا توجد صور</p>
                    )}
                  </div>

                  <div>
                    <input type="file" accept="image/*,.heic,.heif,.webp" multiple onChange={handleImageSelect} className="hidden" id="edit-image-upload" />
                    <label htmlFor="edit-image-upload" className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-700 bg-slate-950/50 px-4 py-8 text-center transition hover:border-blue-500 hover:bg-blue-500/10">
                      <span className="text-sm font-semibold text-slate-200">إضافة صور جديدة</span>
                      <span className="text-xs text-slate-400">حتى 5 صور إجمالًا للملفات الجديدة</span>
                    </label>
                    <p className={`mt-3 text-xs ${formErrors.images ? 'text-rose-400' : 'text-slate-400'}`}>{formErrors.images || `${selectedImages.length} صور جديدة`}</p>

                    {selectedImages.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
                        {selectedImages.map((file, index) => (
                          <div key={`${file.name}-${index}`} className="space-y-2">
                            <button
                              type="button"
                              onClick={() => setImageViewer({ src: selectedImagePreviews[index] || '', alt: file.name })}
                              className="relative block aspect-square w-full overflow-hidden rounded-2xl border border-slate-700 bg-slate-950/60"
                            >
                              <Image src={selectedImagePreviews[index] || '/acessts/NoImage.jpg'} alt={file.name} fill sizes="(max-width: 768px) 50vw, 20vw" className="object-cover" unoptimized />
                            </button>
                            <p className="truncate text-xs text-slate-300">{file.name}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {error && <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-300">{error}</div>}

              <Button onClick={handleUpdate} disabled={submitting} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <Save className="ml-2 h-5 w-5" />
                {submitting ? 'جاري الحفظ...' : 'حفظ التعديلات'}
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-5">
                <h2 className="mb-4 text-xl font-semibold text-white">معلومات الطلب</h2>
                <p className="whitespace-pre-wrap rounded-2xl border border-slate-700 bg-slate-950/50 p-4 text-slate-200">{inquiry.description}</p>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-700 bg-slate-950/50 p-4"><p className="text-xs text-slate-400">نوع المادة</p><p className="mt-1 text-white">{formatOptionalText(inquiry.materialType)}</p></div>
                  <div className="rounded-2xl border border-slate-700 bg-slate-950/50 p-4"><p className="text-xs text-slate-400">الكمية</p><p className="mt-1 text-white">{formatOptionalQuantity(inquiry.quantity)}</p></div>
                  <div className="rounded-2xl border border-slate-700 bg-slate-950/50 p-4"><p className="text-xs text-slate-400">التركيب مطلوب</p><p className="mt-1 text-white">{formatBooleanValue(inquiry.installationRequired)}</p></div>
                  <div className="rounded-2xl border border-slate-700 bg-slate-950/50 p-4"><p className="text-xs text-slate-400">العنوان</p><p className="mt-1 text-white">{formatOptionalText(inquiry.address)}</p></div>
                </div>

                <p className="mt-4 text-sm text-slate-400">تاريخ الإنشاء: {new Date(inquiry.createdAt).toLocaleString('ar-EG')}</p>
              </div>

              <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-5">
                <h2 className="mb-3 text-lg font-semibold text-white">الصور الحالية</h2>
                {currentImages.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {currentImages.map((img, index) => (
                      <button key={`${img}-${index}`} type="button" onClick={() => setImageViewer({ src: img, alt: `صورة ${index + 1}` })} className="relative aspect-square overflow-hidden rounded-2xl border border-slate-700 bg-slate-950/50">
                        <Image src={img} alt={`صورة ${index + 1}`} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" unoptimized />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 p-4 text-center text-sm text-slate-400">لا توجد صور</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mb-6 rounded-3xl border border-slate-700 bg-slate-800/50 p-6 backdrop-blur-sm">
          <h2 className="mb-4 text-xl font-semibold text-white">الردود ({replies.length})</h2>

          {replies.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 py-8 text-center text-slate-400">لا توجد ردود حتى الآن</p>
          ) : (
            <div className="space-y-4">
              {replies.map((reply) => (
                <div key={reply._id} className={`rounded-2xl border p-5 ${reply.status === 'accepted' ? 'border-green-500/40 bg-green-500/10' : reply.status === 'rejected' ? 'border-red-500/40 bg-red-500/10' : 'border-slate-700 bg-slate-950/40'}`}>
                  <div className="mb-3 flex items-start justify-between gap-3">
                    {getReplyStatusBadge(reply.status)}
                    <span className="text-xs text-slate-400">{new Date(reply.createdAt).toLocaleString('ar-EG')}</span>
                  </div>

                  <p className="mb-4 whitespace-pre-wrap text-slate-200">{reply.text}</p>

                  {Array.isArray(reply.imageList) && reply.imageList.length > 0 ? (
                    <div className="mb-4">
                      <p className="mb-2 text-sm font-semibold text-slate-300">صور الرد</p>
                      <div className="flex gap-3 overflow-x-auto pb-2">
                        {reply.imageList.map((img, index) => (
                          <button key={`${img}-${index}`} type="button" onClick={() => setImageViewer({ src: img, alt: `صورة الرد ${index + 1}` })} className="relative h-28 w-28 flex-none overflow-hidden rounded-2xl border border-slate-700 bg-slate-950/60">
                            <Image src={img} alt={`صورة الرد ${index + 1}`} fill sizes="112px" className="object-cover" unoptimized />
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="mb-4 text-sm text-slate-400">لا توجد صور</p>
                  )}

                  {inquiry.status === 'active' && reply.status === 'pending' && (
                    <Button onClick={() => handleAcceptReply(reply._id)} size="sm" className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="ml-2 h-4 w-4" />
                      قبول العرض
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {inquiry.status === 'accepted' && (
          <div className="space-y-3 rounded-3xl border border-slate-700 bg-slate-800/50 p-6 backdrop-blur-sm">
            <h3 className="mb-3 text-lg font-semibold text-white">إجراءات</h3>
            <Button onClick={handleRejectReply} className="w-full bg-yellow-600 hover:bg-yellow-700">
              <AlertTriangle className="ml-2 h-5 w-5" />
              رفض العرض المقبول
            </Button>
            <Button onClick={handleEndInquiry} className="w-full bg-gray-600 hover:bg-gray-700">
              <XCircle className="ml-2 h-5 w-5" />
              إنهاء الطلب
            </Button>
          </div>
        )}
      </div>

      {imageViewer && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4" onClick={() => setImageViewer(null)}>
          <div className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-3xl bg-white p-3 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <button type="button" onClick={() => setImageViewer(null)} className="absolute right-4 top-4 z-10 rounded-full bg-black/60 px-3 py-2 text-sm font-semibold text-white">إغلاق</button>
            <Image src={imageViewer.src} alt={imageViewer.alt} width={1200} height={900} className="h-auto max-h-[85vh] w-auto max-w-full rounded-2xl object-contain" unoptimized />
          </div>
        </div>
      )}
    </div>
  );
}
