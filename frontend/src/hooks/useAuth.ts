import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { SignUpData, AuthResponse, SocialSignupData, SocialLoginParams, SocialProvider, SocialAuthParams, SocialSignupRequest } from '../types/auth';
import { setToken, getToken, removeToken } from '../utils/api';
import { useNavigate } from 'react-router-dom';

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

  socialLogin: async (provider: string, redirect_uri: string) => {
    let redirectUri;
    switch(provider) {
      case 'google':
        redirectUri = process.env.REACT_APP_GOOGLE_CALLBACK_URL;
        break;
      case 'naver':
        redirectUri = process.env.REACT_APP_NAVER_CALLBACK_URL;
        break;
      case 'kakao':
        redirectUri = process.env.REACT_APP_KAKAO_CALLBACK_URL;
        break;
      default:
        redirectUri = `${window.location.origin}/auth/callback/${provider}`;
    }
    redirectUri = encodeURIComponent(redirectUri || '');
    const response = await axios.get(
      `${API_URL}/api/auth/login/${provider}?redirect_uri=${redirectUri}`
    );
    return response.data;
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

  const token = getToken();

  // 토큰 유효성 검사
  useEffect(() => {
    const validateToken = async () => {
      if (token) {
        try {
          const response = await axios.get(`${API_URL}/api/auth/validate-token`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!response.data.valid) {
            handleLogout();
          }
        } catch (error) {
          handleLogout();
        }
      }
    };

    validateToken();
    const interval = setInterval(validateToken, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [token]);

  const handleLogout = () => {
    // 토큰 제거
    removeToken();
    
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
    enabled: !!token,
    retry: 1,
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
        setToken(data.access_token);
        handleAuthSuccessWithCache(queryClient, data);
        
        setTimeout(() => {
          window.location.href = '/items';
        }, 0);
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || '로그인에 실패했습니다.';
      setError(message);
    },
    onSettled: () => {
    }
  });

  // 회원가입
  const signup = useMutation({
    mutationFn: async (data: SignUpData) => {
      try {
        console.log('회원가입 시도:', data.email);
        const response = await authApi.signup(data);
        console.log('회원가입 성공:', response);
        return response;
      } catch (error: any) {
        console.error('회원가입 프로세스 에러:', {
          error,
          status: error.response?.status,
          data: error.response?.data,
          message: error.response?.data?.message,
          detail: error.response?.data?.detail
        });
        
        // API 응답에서 에러 메시지 확인
        if (axios.isAxiosError(error)) {
          const errorData = error.response?.data;
          console.log('에러 응답 데이터:', errorData);
          
          // 이메일 중복 체크
          if (error.response?.status === 400) {
            if (errorData?.detail?.includes('이미 존재') || 
                errorData?.message?.includes('이미 존재') ||
                errorData?.detail?.includes('중복') || 
                errorData?.message?.includes('중복')) {
              throw new Error('이미 사용 중인 이메일입니다.');
            }
          }
          const message = errorData?.detail || errorData?.message || '회원가입에 실패했습니다.';
          throw new Error(message);
        }
        throw error;
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
  const socialLogin = useMutation({
    mutationFn: async ({ 
      provider, 
      source 
    }: { 
      provider: string; 
      source: 'login' | 'signup';
    }) => {
      try {
        if (!['google', 'naver', 'kakao'].includes(provider)) {
          throw new Error('지원하지 않는 소셜 로그인입니다.');
        }

        startSocialAuth(provider, source);
        updateSocialAuthStatus('pending');
        
        let redirectUri;
        switch(provider) {
          case 'google':
            redirectUri = `${window.location.origin}${process.env.REACT_APP_GOOGLE_CALLBACK_URL}`;
            break;
          case 'naver':
            redirectUri = `${window.location.origin}${process.env.REACT_APP_NAVER_CALLBACK_URL}`;
            break;
          case 'kakao':
            redirectUri = `${window.location.origin}${process.env.REACT_APP_KAKAO_CALLBACK_URL}`;
            break;
          default:
            redirectUri = `${window.location.origin}/auth/callback/${provider}`;
        }
        redirectUri = encodeURIComponent(redirectUri || '');
        const response = await axios.get(
          `${API_URL}/api/auth/login/${provider}?redirect_uri=${redirectUri}&source=${source}`
        );
        
        if (response.data.url) {  
          const sourceParam = `source=${source}`;
          const authUrl = response.data.url.includes('?') 
            ? `${response.data.url}&${sourceParam}`
            : `${response.data.url}?${sourceParam}`;
            
          window.location.href = authUrl;
        } else {
          throw new Error('인증 URL을 받지 못했습니다.');
        }
        
        return response.data;
      } catch (error) {
        updateSocialAuthStatus('error');
        throw error;
      }
    },
    onError: (error) => {
      setError('소셜 로그인 중 오류가 발생했습니다.');
      clearSocialSignupData();
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