import apiClient from './client';

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
    const response = await apiClient.post('https://shk2t-t3ban.fly.dev/app/v1/users/login', credentials);
    if (typeof window !== 'undefined' && response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  },

  async register(userData: RegisterData) {
    const response = await apiClient.post('https://shk2t-t3ban.fly.dev/app/v1/users/signup', userData);
    return response.data;
  },

  async logout() {
    try {
      await apiClient.post('https://shk2t-t3ban.fly.dev/app/v1/users/logout');
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
      }
    }
  },

  async getCurrentUser() {
    const response = await apiClient.get('https://shk2t-t3ban.fly.dev/app/v1/users/me');
    return response.data;
  },

  async forgotPassword(email: string) {
    const response = await apiClient.post('https://shk2t-t3ban.fly.dev/app/v1/users/forgetPassword', { email });
    return response.data;
  },

  async verifyCode(code: string, email: string) {
    const response = await apiClient.post('https://shk2t-t3ban.fly.dev/app/v1/users/OTPVerification', { code, email });
    return response.data;
  },

  async resetPassword(passwordData: ResetPasswordData) {
    const response = await apiClient.patch('https://shk2t-t3ban.fly.dev/app/v1/users/ResetPassword', passwordData);
    return response.data;
  },

  async socialLogin(socialData: SocialLoginData) {
    const response = await apiClient.post('https://shk2t-t3ban.fly.dev/app/v1/users/signWithSocial', socialData);
    if (typeof window !== 'undefined' && response.data.data?.token) {
      localStorage.setItem('authToken', response.data.data.token);
    }
    return response.data;
  }
};

export default authService;