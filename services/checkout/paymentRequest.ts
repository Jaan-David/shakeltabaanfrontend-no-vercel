import { Api } from '@/services/api/endpoints';

// Types
export type PaymentRequestStatus = 'pending' | 'submitted' | 'approved' | 'rejected' | 'cancelled';
export type PaymentMethod = 'instaPay' | 'cash';

export interface PaymentRequest {
  paymentRequestId: string;
  orderId: string;
  requestedAmount: number;
  status: PaymentRequestStatus;
  paymentMethod?: PaymentMethod;
  paymentProofImage?: string;
  rejectionReason?: string;
  submittedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface OrganizationPaymentInfo {
  instaPay?: {
    phone: string;
    accountName: string;
  };
  cash?: {
    location: string;
    accountName: string;
  };
}

export interface CreatePaymentRequestData {
  orderId: string;
  amount: number;
  paymentMethod: PaymentMethod;
}

export interface SubmitPaymentProofData {
  image: File;
}

export interface UpdatePaymentRequestStatusData {
  status: 'approved' | 'rejected';
  rejectionReason?: string;
}

// Validation helper
class PaymentRequestValidator {
  static validateAmount(amount: number): boolean {
    return amount > 0;
  }

  static validatePaymentMethod(method: string): method is PaymentMethod {
    return ['instaPay', 'cash'].includes(method);
  }

  static validateStatus(status: string): status is PaymentRequestStatus {
    return ['pending', 'submitted', 'approved', 'rejected', 'cancelled'].includes(status);
  }

  static validateImageFile(file: File): string[] {
    const errors: string[] = [];
    
    if (!file.type.startsWith('image/')) {
      errors.push('يجب أن تكون الملف صورة');
    }
    
    if (file.size > 2 * 1024 * 1024) {
      errors.push('حجم الصورة يجب أن لا يتجاوز 2MB');
    }
    
    return errors;
  }

  static validateStatusTransition(currentStatus: PaymentRequestStatus, newStatus: PaymentRequestStatus): boolean {
    const allowedTransitions: Record<PaymentRequestStatus, PaymentRequestStatus[]> = {
      pending: ['submitted', 'cancelled'],
      submitted: ['approved', 'rejected', 'cancelled'],
      approved: ['cancelled'],
      rejected: ['submitted', 'cancelled'],
      cancelled: []
    };

    return allowedTransitions[currentStatus]?.includes(newStatus) ?? false;
  }
}

// Payment Request Service - Singleton Pattern
class PaymentRequestService {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string): void {
    this.token = token;
  }

  private getHeaders(isMultipart: boolean = false): Record<string, string> {
    const headers: Record<string, string> = {};
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    if (!isMultipart) {
      headers['Content-Type'] = 'application/json';
    }
    
    return headers;
  }

  // Customer: Get payment requests for order
  async getPaymentRequestsByOrder(orderId: string): Promise<PaymentRequest[]> {
    if (!this.token) {
      throw new Error('Authentication required');
    }

    const url = `${this.baseUrl}/payment-requests/order/${orderId}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error('UNAUTHORIZED');
        if (response.status === 403) throw new Error('FORBIDDEN');
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return Array.isArray(result.data) ? result.data : [];
    } catch (error) {
      if (error instanceof Error && error.message === 'UNAUTHORIZED') {
        throw error;
      }
      throw new Error('Failed to fetch payment requests');
    }
  }

  // Customer: Get all payment requests
  async getPaymentRequests(): Promise<PaymentRequest[]> {
    if (!this.token) {
      throw new Error('Authentication required');
    }

    const url = `${this.baseUrl}/payment-requests`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error('UNAUTHORIZED');
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return Array.isArray(result.data) ? result.data : [];
    } catch (error) {
      if (error instanceof Error && error.message === 'UNAUTHORIZED') {
        throw error;
      }
      throw new Error('Failed to fetch payment requests');
    }
  }

  // Customer: Get single payment request
  async getPaymentRequest(paymentRequestId: string): Promise<PaymentRequest> {
    if (!this.token) {
      throw new Error('Authentication required');
    }

    const url = `${this.baseUrl}/payment-requests/${paymentRequestId}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error('UNAUTHORIZED');
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      if (error instanceof Error && error.message === 'UNAUTHORIZED') {
        throw error;
      }
      throw new Error('Failed to fetch payment request');
    }
  }

  // Customer: Submit payment proof
  async submitPaymentProof(paymentRequestId: string, image: File): Promise<PaymentRequest> {
    if (!this.token) {
      throw new Error('Authentication required');
    }

    const validationErrors = PaymentRequestValidator.validateImageFile(image);
    if (validationErrors.length > 0) {
      throw new Error(validationErrors[0]);
    }

    const formData = new FormData();
    formData.append('image', image);

    const url = `${this.baseUrl}/payment-requests/${paymentRequestId}/submit`;

    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers: this.getHeaders(true),
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error('UNAUTHORIZED');
        if (response.status === 403) throw new Error('FORBIDDEN');
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
          throw error;
        }
      }
      throw new Error('Failed to submit payment proof');
    }
  }

  // Operation: Create payment request
  async createPaymentRequest(data: CreatePaymentRequestData): Promise<PaymentRequest> {
    if (!this.token) {
      throw new Error('Authentication required');
    }

    if (!PaymentRequestValidator.validateAmount(data.amount)) {
      throw new Error('Amount must be greater than 0');
    }

    if (!PaymentRequestValidator.validatePaymentMethod(data.paymentMethod)) {
      throw new Error('Invalid payment method');
    }

    const url = `${this.baseUrl}/payment-requests`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error('UNAUTHORIZED');
        if (response.status === 403) throw new Error('FORBIDDEN');
        const errorData = await response.json();
        
        if (response.status === 409) {
          throw new Error('Payment request already exists for this order');
        }
        
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
          throw error;
        }
      }
      throw new Error('Failed to create payment request');
    }
  }

  // Operation: Update payment request status
  async updatePaymentRequestStatus(
    paymentRequestId: string,
    data: UpdatePaymentRequestStatusData
  ): Promise<PaymentRequest> {
    if (!this.token) {
      throw new Error('Authentication required');
    }

    if (data.status === 'rejected' && !data.rejectionReason) {
      throw new Error('Rejection reason is required');
    }

    const url = `${this.baseUrl}/payment-requests/${paymentRequestId}/status`;

    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error('UNAUTHORIZED');
        if (response.status === 403) throw new Error('FORBIDDEN');
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
          throw error;
        }
      }
      throw new Error('Failed to update payment request status');
    }
  }

  // Operation: Get all payment requests
  async getAllPaymentRequests(): Promise<PaymentRequest[]> {
    if (!this.token) {
      throw new Error('Authentication required');
    }

    const url = `${this.baseUrl}/payment-requests`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error('UNAUTHORIZED');
        if (response.status === 403) throw new Error('FORBIDDEN');
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return Array.isArray(result.data) ? result.data : [];
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
          throw error;
        }
      }
      throw new Error('Failed to fetch payment requests');
    }
  }

  // Get organization payment info (cached)
  async getOrganizationPaymentInfo(): Promise<OrganizationPaymentInfo> {
    const url = `${this.baseUrl}/payment-requests/organization/info`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        return {};
      }

      const result = await response.json();
      return result.data || {};
    } catch {
      return {};
    }
  }
}

// Export class for direct import
export { PaymentRequestService };

// Lazy singleton export
const createService = () => new PaymentRequestService(Api);
export const paymentRequestService = createService();
