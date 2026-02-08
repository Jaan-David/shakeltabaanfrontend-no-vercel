import apiClient from './client';
import { API_ENDPOINTS, Api } from './endpoints';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface ResetPasswordData {
  email: string;
  Newpassword: string;
}

export interface SocialLoginData {
  provider: 'google' | 'facebook';
  idToken: string;
}

export const authService = {
  async login(credentials: LoginCredentials) {
    const response = await apiClient.post(`${Api}${API_ENDPOINTS.AUTH.LOGIN}`, credentials);
    if (typeof window !== 'undefined' && response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  },

  async register(userData: RegisterData) {
    const response = await apiClient.post(`${Api}${API_ENDPOINTS.AUTH.REGISTER}`, userData);
    return response.data;
  },

  async logout() {
    try {
      await apiClient.post(`${Api}/users/logout`);
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
      }
    }
  },

  async getCurrentUser() {
    const response = await apiClient.get(`${Api}/users/me`);
    return response.data;
  },

  async forgotPassword(email: string) {
    const response = await apiClient.post(`${Api}${API_ENDPOINTS.AUTH.FORGOT_PASSWORD}`, { email });
    return response.data;
  },

  async verifyCode(code: string, email: string) {
    const response = await apiClient.post(`${Api}${API_ENDPOINTS.AUTH.VERIFY_EMAIL}`, { code, email });
    return response.data;
  },

  async resetPassword(passwordData: ResetPasswordData) {
    const response = await apiClient.patch(`${Api}${API_ENDPOINTS.AUTH.RESET_PASSWORD}`, passwordData);
    return response.data;
  },

  async socialLogin(socialData: SocialLoginData) {
    const response = await apiClient.post(`${Api}${API_ENDPOINTS.AUTH.LOGIN_SOCIAL}`, socialData);
    if (typeof window !== 'undefined' && response.data.data?.token) {
      localStorage.setItem('authToken', response.data.data.token);
    }
    return response.data;
  }
};

export default authService;