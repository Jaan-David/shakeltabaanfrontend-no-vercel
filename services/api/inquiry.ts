import apiClient from './client';
import { Api } from './endpoints';

const BASE_URL = Api;

export interface Inquiry {
  _id: string;
  userId: string | {
    _id: string;
    firstName: string;
    lastName: string;
  };
  name: string;
  description: string;
  phoneNumber: string;
  email: string;
  imageList?: string[];
  status: 'active' | 'accepted' | 'ended';
  reply: InquiryReply[];
  acceptedReplyId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InquiryReply {
  _id: string;
  organizationId: string;
  createdBy: string;
  text: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface CreateInquiryData {
  name?: string;
  description: string;
  phoneNumber?: string;
  email?: string;
  images?: File[];
}

export interface UpdateInquiryData {
  description?: string;
  images?: File[];
}

export interface InquiryFilters {
  page?: number;
  limit?: number;
  status?: 'active' | 'accepted' | 'ended';
}

const convertImageToJpeg = async (file: File): Promise<File> => {
  if (typeof window === 'undefined') {
    throw new Error('Unsupported file type');
  }

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Unsupported file type'));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Unsupported file type'));
    image.src = dataUrl;
  });

  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Unsupported file type');
  }
  ctx.drawImage(img, 0, 0);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', 0.9);
  });

  if (!blob) {
    throw new Error('Unsupported file type');
  }

  const baseName = file.name.replace(/\.[^/.]+$/, '');
  return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' });
};

export const inquiryService = {
  // Allowed image MIME types accepted by the backend
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'],
  allowedVideoTypes: ['video/mp4', 'video/webm', 'video/quicktime', 'video/ogg', 'video/x-m4v'],
  /**
   * Create a new inquiry
   */
  async createInquiry(data: CreateInquiryData): Promise<{ status: string; message: string; inquiry: Inquiry }> {
    try {
      const formData = new FormData();
      
      if (data.name) formData.append('name', data.name);
      formData.append('description', data.description);
      if (data.phoneNumber) formData.append('phoneNumber', data.phoneNumber);
      if (data.email) formData.append('email', data.email);
      
      if (data.images && data.images.length > 0) {
        for (const image of data.images) {
          let uploadFile = image;
          if (image.type.startsWith('video/')) {
            if (!this.allowedVideoTypes.includes(image.type)) {
              throw new Error('Unsupported file type');
            }
          } else if (image.type.startsWith('image/')) {
            if (!this.allowedImageTypes.includes(image.type)) {
              uploadFile = await convertImageToJpeg(image);
            }
          } else {
            throw new Error('Unsupported file type');
          }
          formData.append('image', uploadFile, uploadFile.name);
        }
      }

      const response = await apiClient.post(`${BASE_URL}/inquiries`, formData);
      return response.data;
    } catch (error: any) {
      const status = error?.response?.status;
      if (status !== 403) {
        console.error('Failed to submit custom order:', error);
      }
      throw new Error(error.response?.data?.message || 'Failed to submit custom order');
    }
  },

  /**
   * Get all inquiries
   */
  async getInquiries(filters?: InquiryFilters): Promise<{ status: string; message: string; length: number; inquiries: Inquiry[] }> {
    const params = new URLSearchParams();
    
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.status) params.append('status', filters.status);

    const response = await apiClient.get(`${BASE_URL}/inquiries?${params.toString()}`);
    return response.data;
  },

  /**
   * Get single inquiry by ID
   */
  async getInquiryById(id: string): Promise<{ status: string; inquiry: Inquiry }> {
    const response = await apiClient.get(`${BASE_URL}/inquiries/${id}`);
    return response.data;
  },

  /**
   * Update inquiry
   */
  async updateInquiry(id: string, data: UpdateInquiryData): Promise<{ status: string; message: string; data: { inquiry: Inquiry } }> {
    try {
      const formData = new FormData();
      
      if (data.description) formData.append('description', data.description);
      
      if (data.images && data.images.length > 0) {
        for (const image of data.images) {
          let uploadFile = image;
          if (image.type.startsWith('video/')) {
            if (!this.allowedVideoTypes.includes(image.type)) {
              throw new Error('Unsupported file type');
            }
          } else if (image.type.startsWith('image/')) {
            if (!this.allowedImageTypes.includes(image.type)) {
              uploadFile = await convertImageToJpeg(image);
            }
          } else {
            throw new Error('Unsupported file type');
          }
          formData.append('image', uploadFile, uploadFile.name);
        }
      }

      const response = await apiClient.patch(`${BASE_URL}/inquiries/${id}`, formData);
      return response.data;
    } catch (error: any) {
      console.error('Failed to update inquiry:', error);
      throw new Error(error.response?.data?.message || 'Failed to update inquiry');
    }
  },

  /**
   * Accept a reply from an organization
   */
  async acceptReply(inquiryId: string, replyId: string): Promise<{ status: string; message: string; inquiry: Inquiry }> {
    const response = await apiClient.post(`${BASE_URL}/inquiries/${inquiryId}/accept-reply`, { replyId });
    return response.data;
  },

  /**
   * Reject previously accepted reply
   */
  async rejectReply(inquiryId: string): Promise<{ status: string; message: string; inquiry: Inquiry }> {
    const response = await apiClient.post(`${BASE_URL}/inquiries/${inquiryId}/reject-reply`);
    return response.data;
  },

  /**
   * End inquiry (close it)
   */
  async endInquiry(inquiryId: string): Promise<{ status: string; message: string; inquiry: Inquiry }> {
    const response = await apiClient.post(`${BASE_URL}/inquiries/${inquiryId}/end`);
    return response.data;
  },

  /**
   * Delete inquiry
   */
  async deleteInquiry(id: string): Promise<{ status: string; message: string }> {
    const response = await apiClient.delete(`${BASE_URL}/inquiries/${id}`);
    return response.data;
  },
};

export default inquiryService;
