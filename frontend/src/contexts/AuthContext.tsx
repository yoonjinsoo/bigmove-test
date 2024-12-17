import React, { createContext, useContext, useReducer, useEffect, useState, useCallback } from 'react';
import { useSessionStorage } from '../hooks/useSessionStorage';
import { api } from '../utils/api';

interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  token: string | null;
  loading: boolean;
}

type AuthAction =
  | { type: 'LOGIN_SUCCESS'; payload: { user: any; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true
};

interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (email: string, password: string, name: string) => Promise<any>;
  setAuthState: (user: any, token: string) => void;
  socialLogin: (provider: 'google' | 'naver' | 'kakao') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer((state: AuthState, action: AuthAction) => {
    switch (action.type) {
      case 'LOGIN_SUCCESS':
        return { ...state, isAuthenticated: true, user: action.payload.user, token: action.payload.token, loading: false };
      case 'LOGOUT':
        return { ...state, isAuthenticated: false, user: null, token: null, loading: false };
      case 'SET_LOADING':
        return { ...state, loading: action.payload };
      default:
        return state;
    }
  }, initialState);

  // 자동 로그인 처리
  useEffect(() => {
    const autoLogin = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // 저장된 토큰 확인
        const token = localStorage.getItem('token');
        if (!token) {
          dispatch({ type: 'SET_LOADING', payload: false });
          return;
        }
        
        // 토큰으로 사용자 정보 가져오기
        const response = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setAuthState(response.data.user, token);
      } catch (error) {
        console.error('자동 로그인 실패:', error);
        localStorage.removeItem('token');
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    
    autoLogin();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password
      });
      
      const { access_token, user } = response.data;
      if (access_token) {
        localStorage.setItem('token', access_token);
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user: user || { email }, token: access_token }
        });
      }
    } catch (error) {
      console.error('로그인 실패:', error);
      throw error;
    }
  };

  const socialLogin = async (provider: 'google' | 'naver' | 'kakao') => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await api.get(`/auth/login/${provider}`);
      console.log('소셜 로그인 응답:', response.data);  // 디버깅용 로그 추가
      
      if (!response.data?.url) {
        throw new Error('인증 URL을 받지 못했습니다');
      }

      // 리다이렉트 실행
      window.location.href = response.data.url;
      
    } catch (error) {
      console.error('소셜 로그인 실패:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      console.log('회원가입 시도:', { email, name }); // 디버깅용 로그
      const response = await api.post('/auth/signup', {
        email,
        password,
        name
      });
      
      console.log('회원가입 응답:', response.data); // 디버깅용 로그
      const { access_token, user } = response.data;
      
      if (access_token && user) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token: access_token }
        });
        localStorage.setItem('token', access_token);
      }
      
      return response.data;
    } catch (error) {
      console.error('회원가입 실패:', error);
      throw error;
    }
  };

  // 로그인 성공 시 토큰 저장
  const setAuthState = useCallback((user: any, token: string) => {
    localStorage.setItem('token', token);
    dispatch({
      type: 'LOGIN_SUCCESS',
      payload: { user, token }
    });
  }, []);

  return (
    <AuthContext.Provider value={{ 
      state, 
      login, 
      logout, 
      signup,
      setAuthState,
      socialLogin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 