"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { inquiryService, type Inquiry, type UpdateInquiryData } from '@/services/api/inquiry';
import { Button } from '@/components/UI/Buttons/Button';
import { ArrowLeft, Edit, Save, X, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { isAuthenticated } from '@/utils/auth';

export default function InquiryDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const inquiryId = params?.id as string;

  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<UpdateInquiryData>({ description: '' });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setEditData({ description: response.inquiry.description });
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedImages(prev => [...prev, ...files].slice(0, 5));
    }
  };

  const handleUpdate = async () => {
    if (!editData.description?.trim()) {
      setError('الوصف مطلوب');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      await inquiryService.updateInquiry(inquiryId, {
        ...editData,
        images: selectedImages.length > 0 ? selectedImages : undefined,
      });

      setEditing(false);
      setSelectedImages([]);
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
      await inquiryService.acceptReply(inquiryId, replyId);
      fetchInquiry();
    } catch (err: unknown) {
      alert(getErrorMessage(err, 'فشل قبول الرد'));
    }
  };

  const handleRejectReply = async () => {
    if (!confirm('هل أنت متأكد من رفض العرض المقبول؟')) return;

    try {
      await inquiryService.rejectReply(inquiryId);
      fetchInquiry();
    } catch (err: unknown) {
      alert(getErrorMessage(err, 'فشل رفض الرد'));
    }
  };

  const handleEndInquiry = async () => {
    if (!confirm('هل أنت متأكد من إنهاء هذا الطلب؟')) return;

    try {
      await inquiryService.endInquiry(inquiryId);
      fetchInquiry();
    } catch (err: unknown) {
      alert(getErrorMessage(err, 'فشل إنهاء الطلب'));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-400">
            <Clock className="w-4 h-4" />
            نشط
          </span>
        );
      case 'accepted':
        return (
          <span className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full text-green-400">
            <CheckCircle className="w-4 h-4" />
            مقبول
          </span>
        );
      case 'ended':
        return (
          <span className="flex items-center gap-2 px-4 py-2 bg-gray-500/20 border border-gray-500/30 rounded-full text-gray-400">
            <XCircle className="w-4 h-4" />
            منتهي
          </span>
        );
      default:
        return null;
    }
  };

  const getReplyStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="text-xs px-2 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded text-yellow-400">معلق</span>;
      case 'accepted':
        return <span className="text-xs px-2 py-1 bg-green-500/20 border border-green-500/30 rounded text-green-400">مقبول</span>;
      case 'rejected':
        return <span className="text-xs px-2 py-1 bg-red-500/20 border border-red-500/30 rounded text-red-400">مرفوض</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">جاري التحميل...</div>
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">لم يتم العثور على الطلب</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            رجوع
          </button>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">تفاصيل الطلب</h1>
            {getStatusBadge(inquiry.status)}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold text-white">الوصف</h2>
            {inquiry.status !== 'accepted' && inquiry.status !== 'ended' && (
              <button
                onClick={() => setEditing(!editing)}
                className="text-blue-400 hover:text-blue-300 flex items-center gap-2"
              >
                {editing ? <X className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
                {editing ? 'إلغاء' : 'تعديل'}
              </button>
            )}
          </div>

          {editing ? (
            <div className="space-y-4">
              <textarea
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 text-white min-h-[150px]"
                placeholder="الوصف"
              />

              <div>
                <input
                  type="file"
                  accept="image/*,.heic,.heif,.webp"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                  id="edit-image-upload"
                />
                <label
                  htmlFor="edit-image-upload"
                  className="block w-full bg-slate-700/50 border-2 border-dashed border-slate-600 rounded-lg p-4 text-center cursor-pointer hover:border-purple-500 transition-colors"
                >
                  <p className="text-slate-400">إضافة صور جديدة (بحد أقصى 5 صور)</p>
                </label>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400">
                  {error}
                </div>
              )}

              <Button
                onClick={handleUpdate}
                disabled={submitting}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Save className="w-5 h-5 ml-2" />
                {submitting ? 'جاري الحفظ...' : 'حفظ التعديلات'}
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-slate-300 mb-4 whitespace-pre-wrap">{inquiry.description}</p>
              
              {inquiry.imageList && inquiry.imageList.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {inquiry.imageList.map((img, index) => (
                    <Image
                      key={index}
                      src={img}
                      alt={`صورة ${index + 1}`}
                      width={160}
                      height={128}
                      sizes="(max-width: 768px) 25vw, 160px"
                      className="w-full h-32 object-cover rounded-lg"
                      unoptimized
                    />
                  ))}
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-slate-700 text-sm text-slate-400">
                <p>تاريخ الإنشاء: {new Date(inquiry.createdAt).toLocaleString('ar-EG')}</p>
              </div>
            </div>
          )}
        </div>

        {/* Replies */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            الردود ({inquiry.reply.length})
          </h2>

          {inquiry.reply.length === 0 ? (
            <p className="text-slate-400 text-center py-8">لا توجد ردود حتى الآن</p>
          ) : (
            <div className="space-y-4">
              {inquiry.reply.map((reply) => (
                <div
                  key={reply._id}
                  className={`border rounded-lg p-4 ${
                    reply.status === 'accepted'
                      ? 'border-green-500/50 bg-green-500/10'
                      : reply.status === 'rejected'
                      ? 'border-red-500/50 bg-red-500/10'
                      : 'border-slate-600 bg-slate-700/30'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      {getReplyStatusBadge(reply.status)}
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(reply.createdAt).toLocaleString('ar-EG')}
                    </span>
                  </div>

                  <p className="text-slate-300 mb-3">{reply.text}</p>

                  {inquiry.status === 'active' && reply.status === 'pending' && (
                    <Button
                      onClick={() => handleAcceptReply(reply._id)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 ml-2" />
                      قبول العرض
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        {inquiry.status === 'accepted' && (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6 space-y-3">
            <h3 className="text-lg font-semibold text-white mb-3">إجراءات</h3>
            
            <Button
              onClick={handleRejectReply}
              className="w-full bg-yellow-600 hover:bg-yellow-700"
            >
              <AlertTriangle className="w-5 h-5 ml-2" />
              رفض العرض المقبول
            </Button>

            <Button
              onClick={handleEndInquiry}
              className="w-full bg-gray-600 hover:bg-gray-700"
            >
              <XCircle className="w-5 h-5 ml-2" />
              إنهاء الطلب
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
