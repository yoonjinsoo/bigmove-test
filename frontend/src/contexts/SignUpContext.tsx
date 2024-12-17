import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { SignUpStep, SignUpState, SignUpData } from '../types/auth';
import { authService } from '../services/auth';

const initialState: SignUpState = {
  step: SignUpStep.INITIAL,
  basicInfo: {
    email: '',
    password: '',
    business_number: '',
  },
  userInfo: {
    username: '',
    phone_number: '',
  },
  isLoading: false,
  error: null,
  signUpComplete: false
};

type Action =
  | { type: 'SET_STEP'; payload: SignUpStep }
  | { type: 'SET_BASIC_INFO'; payload: Partial<SignUpState['basicInfo']> }
  | { type: 'SET_USER_INFO'; payload: Partial<SignUpState['userInfo']> }
  | { type: 'SET_SIGNUP_DATA'; payload: { user: any; coupon: any } }
  | { type: 'RESET' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SIGNUP_SUCCESS' }
  | { type: 'SIGNUP_FAILURE'; payload: string }
  | { type: 'RESET_STATE' };

const signUpReducer = (state: SignUpState, action: Action): SignUpState => {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.payload };
    case 'SET_BASIC_INFO':
      return { ...state, basicInfo: { ...state.basicInfo, ...action.payload } };
    case 'SET_USER_INFO':
      return { ...state, userInfo: { ...state.userInfo, ...action.payload } };
    case 'SET_SIGNUP_DATA':
      return { ...state, userInfo: { ...state.userInfo, ...action.payload.user }, basicInfo: { ...state.basicInfo, ...action.payload.coupon } };
    case 'RESET':
      return initialState;
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SIGNUP_SUCCESS':
      return { 
        ...state, 
        signUpComplete: true,
        error: null,
        isLoading: false 
      };
    case 'SIGNUP_FAILURE':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
};

const SignUpContext = createContext<
  | {
      state: SignUpState;
      dispatch: React.Dispatch<Action>;
    }
  | undefined
>(undefined);

export const SignUpProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(signUpReducer, initialState);

  return <SignUpContext.Provider value={{ state, dispatch }}>{children}</SignUpContext.Provider>;
};

export const useSignUp = () => {
  const context = useContext(SignUpContext);
  if (!context) {
    throw new Error('useSignUp must be used within SignUpProvider');
  }
  return context;
};

export const useSignUpActions = () => {
  const { state, dispatch } = useSignUp();

  const handleSignUp = useCallback(async (userData: SignUpData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await authService.signUp(userData);
      
      dispatch({ type: 'SIGNUP_SUCCESS' });
      if (response.access_token) {
        localStorage.setItem('token', response.access_token);
      }
      
      const couponData = response.coupon as { [key: string]: any } | undefined;
      if (couponData) {
        localStorage.setItem('signupCoupon', JSON.stringify(couponData));
      }

      return response;
    } catch (error) {
      dispatch({ 
        type: 'SIGNUP_FAILURE', 
        payload: error instanceof Error ? error.message : '회원가입에 실패했습니다'
      });
      throw error;
    }
  }, [dispatch]);

  const resetSignUpState = useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
  }, [dispatch]);

  return {
    handleSignUp,
    resetSignUpState,
    isLoading: state.isLoading,
    error: state.error,
    signUpComplete: state.signUpComplete
  };
};
