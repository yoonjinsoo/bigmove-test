// src/stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthResponse, User, TempUserInfo } from '../types/auth';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

interface SocialSignupResponse {
  temp_user_info: TempUserInfo;
  is_new_user: boolean;
}

interface UserInfo {
  email: string;
  name: string;
  provider: string;
  id: string;
}

interface SocialLoginResponse {
  access_token: string;
  token_type: string;
  user_info: UserInfo;
}

type SocialCallbackResponse = SocialSignupResponse | SocialLoginResponse;

interface SocialAuthState {
  provider: string | null;
  provider_id: string | null;
  status: string | null;
  source: string | null;
  email: string | null;
  name: string | null;
}

interface TempSocialUser {
  provider: string;
  provider_id: string;
  email: string;
  name: string;
  is_temp: boolean;
}

interface SocialSignupData {
  email: string;
  name: string;
  provider: string;
  provider_id: string;
  temp_token: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  error: string | null;
  isLoading: boolean;
  tempUserInfo: TempUserInfo | null;
  isNewUser: boolean;
  loginRedirectInfo: {
    provider: string;
    message: string;
  } | null;
  socialAuth: SocialAuthState;
  tempSocialUser: TempSocialUser | null;
  socialSignupData: SocialSignupResponse | null;
  socialAuthSource: string | null;
}

interface AuthStoreMethods {
  handleAuthSuccessWithCache: (queryClient: any, data: AuthResponse) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  setSocialSignupData: (data: SocialSignupResponse) => void;
  clearSocialSignupData: () => void;
  reset: () => void;
  startSocialAuth: (provider: string, source: string) => void;
  updateSocialAuthStatus: (status: string) => void;
  setTempUserInfo: (data: TempUserInfo) => void;
  clearTempUserInfo: () => void;
  setLoginRedirectInfo: (info: {
    provider: string;
    message: string;
  } | null) => void;
  setUser: (user: User) => void;
  setToken: (token: string | null) => void;
  setIsAuthenticated: (value: boolean) => void;
  clearSocialAuth: () => void;
  setSocialAuthSource: (source: string | null) => void;
}

type AuthStore = AuthState & AuthStoreMethods;

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  token: null,
  error: null,
  isLoading: false,
  tempUserInfo: null,
  isNewUser: false,
  loginRedirectInfo: null,
  socialAuth: {
    provider: null,
    provider_id: null,
    status: null,
    source: null,
    email: null,
    name: null,
  },
  tempSocialUser: null,
  socialSignupData: null,
  socialAuthSource: null
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      setTempUserInfo: (data: TempUserInfo) => 
        set((state) => ({ 
          ...state,
          tempUserInfo: data,
          socialAuth: {
            ...state.socialAuth,
            status: 'completed',
            email: data.email,
            name: data.name
          },
          tempSocialUser: {
            provider: data.provider,
            provider_id: '',
            email: data.email,
            name: data.name || '',
            is_temp: true
          }
        })),
      clearTempUserInfo: () => 
        set((state) => ({ 
          ...state,
          tempUserInfo: null,
          isNewUser: false
        })),
      handleAuthSuccessWithCache: (queryClient: any, data: AuthResponse) => {
        if (!data) return;
        
        const user: User = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role || 'USER',
          provider: data.user.provider || 'email',
          created_at: data.user.created_at,
          updated_at: data.user.updated_at
        };

        // 먼저 캐시를 설정
        queryClient.setQueryData(['user'], user);

        // 그 다음 상태 업데이트
        set({
          user,
          token: data.access_token,
          isAuthenticated: true,
          error: null
        });
      },
      setError: (error: string | null) => set({ error }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      logout: () => {
        set({
          user: {
            id: '',
            email: '',
            name: '',
            role: 'USER',
            provider: 'email',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          isAuthenticated: false,
          token: null,
          error: null,
          isLoading: false,
          tempUserInfo: null,
          isNewUser: false,
          loginRedirectInfo: null,
          socialAuth: {
            provider: null,
            provider_id: null,
            status: null,
            source: null,
            email: null,
            name: null
          },
          tempSocialUser: null,
          socialSignupData: null,
          socialAuthSource: null
        });
      },
      setSocialSignupData: (data: SocialSignupResponse) => set({ socialSignupData: data }),
      clearSocialSignupData: () => set({ socialSignupData: null, socialAuthSource: null }),
      reset: () => set(initialState),
      startSocialAuth: (provider: string, source: string) => set(state => ({
        socialAuth: { ...state.socialAuth, provider, source, status: 'pending' }
      })),
      updateSocialAuthStatus: (status: string) => set(state => ({
        socialAuth: { ...state.socialAuth, status }
      })),
      setLoginRedirectInfo: (info) => set({ loginRedirectInfo: info }),
      setUser: (user: User) => set({ user, isAuthenticated: true }),
      setToken: (token: string | null) => set({ token }),
      setIsAuthenticated: (value: boolean) => set({ isAuthenticated: value }),
      clearSocialAuth: () => set(state => ({
        socialAuth: initialState.socialAuth
      })),
      setSocialAuthSource: (source: string | null) => set({ socialAuthSource: source })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        tempUserInfo: state.tempUserInfo,
        isNewUser: state.isNewUser,
        loginRedirectInfo: state.loginRedirectInfo,
        tempSocialUser: state.tempSocialUser,
        socialAuth: state.socialAuth,
        socialSignupData: state.socialSignupData,
        socialAuthSource: state.socialAuthSource,
      })
    }
  )
);

export const useUser = () => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  
  return useQuery(
    ['user'],
    async () => {
      try {
        if (!token) return null;
        const response = await api.get('/auth/me');
        return response.data;
      } catch (error) {
        console.error('Failed to fetch user:', error);
        return null;
      }
    },
    {
      enabled: !!token,
      onSuccess: (data) => {
        if (data) {
          useAuthStore.getState().setUser(data);
        }
      },
      onError: (error) => {
        console.error('Query error:', error);
      },
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      initialData: null
    }
  );
};