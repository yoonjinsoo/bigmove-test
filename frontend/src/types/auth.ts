export enum SignUpStep {
  INITIAL = 'INITIAL',
  BASIC_INFO = 'BASIC_INFO',
  USER_INFO = 'USER_INFO',
  COMPLETE = 'COMPLETE',
}

export interface SignUpState {
  step: SignUpStep;
  basicInfo: {
    email: string;
    password: string;
    business_number?: string;
  };
  userInfo: {
    username: string;
    phone_number: string;
  };
  isLoading: boolean;
  error: string | null;
  signUpComplete: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
  provider?: string;
  provider_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  token: string;
  access_token: string;
  user: User;
}

export interface SignUpData {
  email: string;
  name: string;
  password?: string;
  passwordConfirm?: string;
  provider?: string;
  provider_id?: string;
  temp_token?: string;
  agreements: {
    terms: boolean;
    privacy: boolean;
    privacyThirdParty: boolean;
    marketing: boolean;
  };
}

export interface TempUserInfo {
  email: string;
  name: string;
  provider: string;
  provider_id: string;
}

export interface SocialSignupData {
  temp_user_info: TempUserInfo;
  is_new_user: boolean;
}

export interface SocialSignupRequest {
  email: string;
  name: string;
  provider: string;
  provider_id: string;
  agreements: {
    terms: boolean;
    privacy: boolean;
    privacyThirdParty: boolean;
    marketing: boolean;
  };
}

export interface AuthError {
  [key: string]: string;
}

export interface SignupAgreements {
  terms: boolean;
  privacy: boolean;
  privacyThirdParty: boolean;
  marketing: boolean;
}

export type SocialProvider = 'google' | 'kakao' | 'naver';

export interface SocialAuthResponse {
  status: 'SUCCESS' | 'TERMS_REQUIRED';
  email: string;
  name: string;
  provider: SocialProvider;
  provider_id: string;
  temp_token?: string;
  access_token?: string;
  token_type?: string;
  user?: {
    id: number;
    email: string;
    name: string;
  };
}

export interface SocialSignupState {
  email: string;
  name: string;
  provider: SocialProvider;
  provider_id: string;
  temp_token: string;
}

export interface SocialLoginParams {
  provider: SocialProvider;
  redirect_uri: string;
}

export interface SocialAuthParams {
  provider: string;
  redirect_uri: string;
  source: 'login' | 'signup';
}
