import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { SignUpData, AuthResponse, SocialSignupData, SocialLoginParams, SocialProvider, SocialAuthParams, SocialSignupRequest } from '../types/auth';
import { setToken, getToken, removeToken } from '../utils/api';
import { useNavigate, useLocation } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL;

// API 함수들
const authApi = {
  login: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
    const response = await axios.post(`${API_URL}/api/auth/login`, credentials);
    return response.data;
  },

  signup: async (data: SignUpData): Promise<AuthResponse> => {
    const response = await axios.post(`${API_URL}/api/auth/register`, data);
    return response.data;
  },

  socialLogin: async (provider: string, source: string) => {
    try {
      console.log(`Attempting ${provider} ${source}`);
      
      const response = await axios.get(`${API_URL}/api/auth/login/${provider}`, {
        params: { source }
      });
      
      console.log(`${provider} auth response:`, response.data);
      return response.data;
      
    } catch (error) {
      console.error(`${provider} auth error:`, error);
      throw error;
    }
  },

  completeSocialSignup: async (data: SocialSignupRequest): Promise<AuthResponse> => {
    const response = await axios.post(`${API_URL}/api/auth/register`, {
      email: data.email,
      name: data.name,
      provider: data.provider,
      provider_id: data.provider_id,
      agreements: data.agreements,
    });
    return response.data;
  },

  getCurrentUser: async (token: string) => {
    const response = await axios.get(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  adminLogin: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
    console.log('1. 로그인 시도');  // 디버깅
    const response = await axios.post(`${API_URL}/api/auth/login`, credentials);
    console.log('2. 서버 응답:', response.data);  // 디버깅
    
    if (response.data?.user?.role === 'ADMIN') {
      console.log('3. 어드민 확인됨');  // 디버깅
      return response.data;
    }
    
    throw new Error('관리자 권한이 없습니다.');
  },
};

const authService = {
  validateToken: async (token: string) => {
    const response = await axios.get(`${API_URL}/api/auth/validate-token`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.isValid;
  },

  completeSocialSignup: async (data: SocialSignupRequest): Promise<AuthResponse> => {
    try {
      const response = await axios.post<AuthResponse>(`${API_URL}/api/auth/register`, {
        email: data.email,
        name: data.name,
        provider: data.provider,
        agreements: data.agreements,
      });
      return response.data;
    } catch (error) {
      console.error('소셜 회원가입 API 에러:', error);
      throw error;
    }
  }
};

interface AdminLoginCredentials {
  email: string;
  password: string;
}

// 1. 정확한 타입 정의
interface SocialLoginResponse {
  authUrl?: string;  // url -> authUrl로 수정
  redirecting?: boolean;
  continueAuth?: boolean;
}

export const useAuth = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { 
    handleAuthSuccessWithCache, 
    setError, 
    setLoading,
    setSocialSignupData,
    clearSocialSignupData,
    startSocialAuth,
    updateSocialAuthStatus
  } = useAuthStore();

  const { token } = useAuthStore();
  const [lastValidated, setLastValidated] = useState<number | null>(null);
  const location = useLocation();

  useEffect(() => {
    const validateToken = async () => {
      const token = useAuthStore.getState().token;
      if (!token) return;
      
      if (lastValidated && Date.now() - lastValidated < 30 * 60 * 1000) {
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/api/auth/validate-token`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.valid) {
          setLastValidated(Date.now());
        } else {
          handleLogout();
        }
      } catch (error) {
        handleLogout();
      }
    };

    validateToken();
    const interval = setInterval(validateToken, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [token, lastValidated]);

  const handleLogout = () => {
    // React Query 캐시 초기화
    queryClient.clear();
    
    // Zustand 상태 초기화
    useAuthStore.getState().logout();
  };

  // 현재 사용자 정보 조회
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.user;
    },
    enabled: !!token && !location.pathname.includes('/login'),
    retry: 1,
    staleTime: 60000,
    cacheTime: 3600000,
    onError: () => {
      handleLogout();
    }
  });

  // 로그인
  const login = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await authApi.login(credentials);
      return response;
    },
    onSuccess: (data) => {
      if (data?.access_token) {
        // 1. 토큰 저장
        setToken(data.access_token);
        
        // 2. 상태 업데이트
        handleAuthSuccessWithCache(queryClient, data);
        queryClient.setQueryData(['user'], data.user);
        
        // 3. 페이지 이동 (React Router 사용)
        navigate('/items');
      }
    },
    onError: (error: any) => {
      handleLogout();
      const message = error.response?.data?.message || '로그인에 실패했습니다.';
      setError(message);
    }
  });

  // 회원가입
  const signup = useMutation({
    mutationFn: async (data: SignUpData) => {
      console.log('[회원가입] 요청 데이터:', data);
      try {
        console.log('회원가입 시도:', data.email);
        const response = await authApi.signup(data);
        console.log('[회원가입] 응답:', response);
        return response;
      } catch (error) {
        console.error('[회원가입] API 오류:', error);
        if (axios.isAxiosError(error)) {
          const errorMessage = error.response?.data?.detail || '회원가입에 실패했습니다.';
          console.error('[회원가입] 상세 에러:', errorMessage);
          throw new Error(errorMessage);
        }
        throw new Error('회원가입에 실패했습니다.');
      }
    },
    onSuccess: (data) => {
      if (data.access_token) {
        setToken(data.access_token);
      }
      handleAuthSuccessWithCache(queryClient, data);
    },
    onError: (error: any) => {
      console.error('회원가입 mutation 에러:', error);
      throw error;
    }
  });

  // 소셜 로그인
  const socialLogin = useMutation<SocialLoginResponse, Error, { provider: string; source: string }>({
    mutationFn: async ({ provider, source }) => {
      try {
        const redirectUri = encodeURIComponent(
          `${window.location.origin}${
            process.env[`REACT_APP_${provider.toUpperCase()}_CALLBACK_URL`] || 
            `/auth/callback/${provider}`
          }`
        );

        const response = await axios.get<{ url: string }>(
          `${API_URL}/api/auth/login/${provider}?redirect_uri=${redirectUri}&source=${source}`,
          {
            validateStatus: function (status) {
              return (status >= 200 && status < 300) || status === 401;
            }
          }
        );

        return { authUrl: response.data.url };
      } catch (error) {
        throw new Error('소셜 로그인 처리 중 오류가 발생했습니다.');
      }
    },
    onError: (error: Error) => {
      if (!error.message.includes('401')) {
        setError(error.message);
        clearSocialSignupData();
      }
    }
  });

  // 소셜 회원가입 완료
  const completeSocialSignup = useMutation<AuthResponse, Error, SocialSignupRequest>({
    mutationFn: (data: SocialSignupRequest) => authApi.completeSocialSignup(data),
    onSuccess: (data) => {
      handleAuthSuccessWithCache(queryClient, data);
      clearSocialSignupData();
      navigate('/signup-complete');
    },
    onError: (error) => {
      setError('회원가입 중 오류가 발생했습니다.');
    }
  });

  // adminLogin mutation 추가
  const adminLogin = useMutation<AuthResponse, Error, AdminLoginCredentials>({
    mutationFn: async (credentials: AdminLoginCredentials) => {
      const response = await axios.post(`${API_URL}/api/auth/login`, credentials);
      return response.data;
    },
    onSuccess: (data) => {
      if (data?.user?.role === 'ADMIN') {
        setToken(data.access_token);
        handleAuthSuccessWithCache(queryClient, data);
        navigate('/admin/dashboard');
      } else {
        throw new Error('관리자 권한이 없습니다.');
      }
    }
  });

  const logout = () => {
    handleLogout();
  };

  const setAuthToken = (token: string) => {
    setToken(token);
  };

  return {
    login,
    logout,
    signup,
    socialLogin,
    completeSocialSignup: completeSocialSignup.mutateAsync,
    setAuthToken,
    isAuthenticated: !!token,
    user,
    error: '',
    adminLogin,
  };
};