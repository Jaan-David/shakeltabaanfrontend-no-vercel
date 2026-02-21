'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, Upload, Image as ImageIcon } from 'lucide-react';

interface UploadProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (file: File) => Promise<void>;
  isLoading?: boolean;
}

export const UploadProofModal: React.FC<UploadProofModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    if (!file.type.startsWith('image/')) {
      setError('يجب أن تكون الملف صورة');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('حجم الصورة يجب أن لا يتجاوز 2MB');
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('يرجى اختيار صورة');
      return;
    }

    try {
      setError(null);
      await onSubmit(selectedFile);
      resetModal();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل تحميل الصورة');
    }
  };

  const resetModal = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">رفع إثبات الدفع</h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {preview ? (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">معاينة الصورة</p>
              <Image
                src={preview}
                alt="Preview"
                width={400}
                height={300}
                className="w-full h-48 object-cover rounded-lg border border-gray-200"
              />
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setPreview(null);
                  setError(null);
                }}
                disabled={isLoading}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 transition-colors"
              >
                اختر صورة أخرى
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
              <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm font-medium text-gray-700">اختر صورة</span>
              <span className="text-xs text-gray-500 mt-1">JPG, PNG (حتى 2MB)</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={isLoading}
                className="hidden"
              />
            </label>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <p className="text-xs text-gray-500 text-center">
            تأكد من وضوح الصورة وتضمنها لكافة البيانات المطلوبة
          </p>
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t border-gray-200">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedFile || isLoading}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                جاري الرفع...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                رفع
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadProofModal;
