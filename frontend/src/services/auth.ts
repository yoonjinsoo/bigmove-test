import axios, { AxiosError } from 'axios';
import type { SignUpData, SocialSignupData } from '../types/auth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

interface SocialLoginParams {
  provider: string;
  code?: string;
  state?: string;
}

interface AuthResponseType {
  access_token: string;
  user: {
    id: number;
    email: string;
    name: string;
  };
  status?: string;
  coupon?: any;
}

export const authService = {
  async signUp(data: SignUpData): Promise<AuthResponseType> {
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        name: data.name,
        email: data.email,
        password: data.password,
        agreements: data.agreements
      });
      return response.data;
    } catch (error) {
      console.error('회원가입 API 에러:', error);
      throw error;
    }
  },

  async validateBusinessNumber(number: string): Promise<boolean> {
    const response = await axios.post(`${API_URL}/api/auth/validate-business`, { number });
    return response.data.valid;
  },

  async refreshToken(): Promise<AuthResponseType> {
    const response = await axios.post(`${API_URL}/api/auth/login`, {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },

  async validateToken(token: string): Promise<boolean> {
    const response = await axios.get(`${API_URL}/api/auth/validate-token`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.valid;
  },

  async completeSocialSignup(data: SocialSignupData): Promise<AuthResponseType> {
    try {
      const response = await axios.post<AuthResponseType>(`${API_URL}/api/auth/register`, data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400 && error.response.data?.detail?.includes('중복')) {
          throw new Error('이미 가입된 이메일주소 입니다.');
        }
        throw new Error(error.response?.data?.detail || '회원가입 처리 중 오류가 발생했습니다.');
      }
      throw error;
    }
  },

  async socialLogin(provider: string, source: string) {
    const redirect_uri = `${window.location.origin}/auth/callback/${provider}`;
    console.log('Redirect URI:', redirect_uri);
    
    const response = await axios.get(`${API_URL}/api/auth/login/${provider}`, {
      params: { 
        redirect_uri,
        source 
      }
    });
    return response.data;
  },

  async handleSocialCallback(provider: string, code: string, state: string) {
    const response = await axios.get(`${API_URL}/api/auth/callback/${provider}`, {
      params: { code, state }
    });
    return response.data;
  },

  async processSocialLogin(
    provider: string,
    params: {
      code: string;
      state: string;
    }
  ) {
    try {
      const response = await axios.get(
        `${API_URL}/api/auth/callback/${provider}`,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error('Social login error:', error);
      throw error;
    }
  },

  async getCurrentUser(token: string) {
    const response = await axios.get(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};
