'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  inquiryService,
  type Inquiry,
  type InquiryReply
} from '@/services/api/inquiry';
import { isUserAuthenticated } from '@/services/auth/login';
import Alert from '@/components/UI/Alert/alert';

export default function InquiriesPage() {
  const router = useRouter();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [activeStatus, setActiveStatus] = useState<'all' | 'active' | 'accepted' | 'ended'>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  
  // Create Inquiry Form
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Alerts
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch inquiries on mount
  useEffect(() => {
    if (!isUserAuthenticated()) {
      router.push(`/login?redirect=${encodeURIComponent('/inquiries')}`);
      return;
    }
    fetchInquiries();
  }, []);

  async function fetchInquiries() {
    setIsLoading(true);
    try {
      const statusParam = activeStatus === 'all' ? undefined : activeStatus;
      const result = await inquiryService.getInquiries({ 
        page: 1, 
        limit: 100,
        status: statusParam as any
      });
      setInquiries(result.inquiries || []);
    } catch (error: any) {
      setErrorMessage(error.message || 'فشل في تحميل الطلبات');
      console.error('Error fetching inquiries:', error);
    }
    setIsLoading(false);
  }

  async function handleCreateInquiry(e: React.FormEvent) {
    e.preventDefault();
    
    if (!description.trim() || description.length < 10 || description.length > 1000) {
      setErrorMessage('الوصف يجب أن يكون بين 10 و 1000 حرف');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await inquiryService.createInquiry({
        description,
        images,
      });
      
      setSuccessMessage('تم إنشاء الطلب بنجاح! سنرسل لك العروض قريباً');
      setDescription('');
      setImages([]);
      
      // Refresh inquiries list
      setTimeout(() => {
        fetchInquiries();
        setActiveTab('list');
      }, 1500);
    } catch (error: any) {
      setErrorMessage(error.message || 'فشل في إنشاء الطلب');
      console.error('Error creating inquiry:', error);
    }
    
    setIsSubmitting(false);
  }

  async function handleAcceptReply(inquiry: Inquiry, reply: InquiryReply) {
    try {
      const result = await inquiryService.acceptReply(inquiry._id, reply._id);
      setSuccessMessage('تم قبول العرض بنجاح');
      fetchInquiries();
    } catch (error: any) {
      setErrorMessage(error.message || 'فشل في قبول العرض');
      console.error('Error accepting reply:', error);
    }
  }

  async function handleRejectReply(inquiry: Inquiry) {
    try {
      const result = await inquiryService.rejectReply(inquiry._id);
      setSuccessMessage('تم رفض العرض');
      fetchInquiries();
    } catch (error: any) {
      setErrorMessage(error.message || 'فشل في رفض العرض');
      console.error('Error rejecting reply:', error);
    }
  }

  async function handleEndInquiry(inquiry: Inquiry) {
    try {
      const result = await inquiryService.endInquiry(inquiry._id);
      setSuccessMessage('تم إغلاق الطلب بنجاح');
      fetchInquiries();
      setSelectedInquiry(null);
    } catch (error: any) {
      setErrorMessage(error.message || 'فشل في إغلاق الطلب');
      console.error('Error ending inquiry:', error);
    }
  }

  async function handleDeleteInquiry(inquiryId: string) {
    if (confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
      try {
        const result = await inquiryService.deleteInquiry(inquiryId);
        setSuccessMessage('تم حذف الطلب بنجاح');
        fetchInquiries();
        setSelectedInquiry(null);
      } catch (error: any) {
        setErrorMessage(error.message || 'فشل في حذف الطلب');
        console.error('Error deleting inquiry:', error);
      }
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'accepted':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'ended':
        return 'bg-slate-50 text-slate-700 border border-slate-200';
      default:
        return 'bg-slate-50 text-slate-700 border border-slate-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'نشط';
      case 'accepted':
        return 'مقبول';
      case 'ended':
        return 'منتهي';
      default:
        return status;
    }
  };

  const filteredInquiries = activeStatus === 'all' 
    ? inquiries 
    : inquiries.filter(i => i.status === activeStatus);

  return (
    <div className="min-h-screen bg-white py-12 px-4 rtl">
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
          setClose={() => setErrorMessage('')}
          type="error"
        />
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">طلباتي</h1>
          <p className="text-slate-600">عرض وإدارة الطلبات الخاصة بك والعروض من الشركات</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 border ${
              activeTab === 'list'
                ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:text-blue-600'
            }`}
          >
            قائمة الطلبات ({filteredInquiries.length})
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 border ${
              activeTab === 'create'
                ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:text-blue-600'
            }`}
          >
            طلب جديد
          </button>
        </div>

        {/* List Tab */}
        {activeTab === 'list' && (
          <div className="space-y-6">
            {/* Status Filter */}
            <div className="flex gap-2 flex-wrap">
              {(['all', 'active', 'accepted', 'ended'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setActiveStatus(status)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                    activeStatus === status
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:text-blue-600'
                  }`}
                >
                  {status === 'all' ? 'الكل' : getStatusLabel(status)}
                </button>
              ))}
            </div>

            {/* Inquiries List */}
            {isLoading ? (
              <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-slate-600 mt-4">جاري التحميل...</p>
              </div>
            ) : filteredInquiries.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
                <p className="text-slate-600 text-lg mb-4">لا توجد طلبات</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-sm"
                >
                  إنشاء طلب جديد
                </button>
              </div>
            ) : (
              filteredInquiries.map((inquiry) => (
                <div
                  key={inquiry._id}
                  className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer"
                  onClick={() => setSelectedInquiry(inquiry)}
                >
                  <div className="p-6 border-r-4 border-blue-500">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">{inquiry.name}</h3>
                        <p className="text-slate-600 text-sm">
                          {new Date(inquiry.createdAt).toLocaleDateString('ar-EG')}
                        </p>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusBadgeColor(inquiry.status)}`}>
                        {getStatusLabel(inquiry.status)}
                      </span>
                    </div>

                    <p className="text-slate-700 mb-4 line-clamp-2">{inquiry.description}</p>

                    <div className="flex gap-4 text-sm text-slate-600 mb-4">
                      <span>📊 {inquiry.reply.length} عرض</span>
                      {inquiry.acceptedReplyId && (
                        <span className="text-emerald-600 font-semibold">✓ عرض مقبول</span>
                      )}
                    </div>

                    {inquiry.imageList && inquiry.imageList.length > 0 && (
                      <div className="flex gap-2">
                        {inquiry.imageList.slice(0, 3).map((img, idx) => (
                          <div key={idx} className="w-12 h-12 rounded overflow-hidden bg-slate-100">
                            <img src={img} alt="inquiry" className="w-full h-full object-cover" />
                          </div>
                        ))}
                        {inquiry.imageList.length > 3 && (
                          <div className="w-12 h-12 rounded bg-slate-200 flex items-center justify-center text-slate-600">
                            +{inquiry.imageList.length - 3}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Create Tab */}
        {activeTab === 'create' && (
          <form onSubmit={handleCreateInquiry} className="bg-slate-50 border border-slate-200 rounded-2xl shadow-sm p-8 max-w-2xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">إنشاء طلب جديد</h2>

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
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []).slice(0, 5);
                    setImages(files);
                  }}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <p className="text-slate-700">اسحب الصور أو اضغط للاختيار</p>
                  <p className="text-sm text-slate-500 mt-1">دعم JPEG, PNG</p>
                </label>
              </div>

              {/* Selected Images Preview */}
              {images.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-4">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <div className="w-full aspect-square bg-slate-100 rounded-lg overflow-hidden">
                        <img
                          src={URL.createObjectURL(img)}
                          alt="preview"
                          className="w-full h-full object-cover"
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
                    <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getStatusBadgeColor(selectedInquiry.status)}`}>
                      {getStatusLabel(selectedInquiry.status)}
                    </span>
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
                          <img src={img} alt="inquiry" className="w-full h-full object-cover" />
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
