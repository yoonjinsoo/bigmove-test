import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NaverIcon, KakaoIcon, GoogleIcon } from '../components/auth/icons/SocialIcons';
import { useAuth } from '../hooks/useAuth';
import {
  SignUpContainer,
  Button,
  SocialButton,
  Divider,
  LoginSection,
  LoginLink,
  SkipLoginButton,
} from '../components/auth/styles/SignUpStyles';
import { useOrderContext } from '../context/OrderContext';
import { useToast } from '../components/common/Toast';
import { useAuthStore } from '../store/authStore';
import { SocialProvider } from '../types/auth';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import { LoadingProgress } from '../components/common/LoadingProgress';

interface SocialAuthState {
  status: 'idle' | 'pending';
  provider?: string;
}

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { setTempOrderData } = useOrderContext();
  const { socialLogin } = useAuth();
  const [socialAuth, setSocialAuth] = useState<SocialAuthState>({ status: 'idle' });
  const queryClient = useQueryClient();
  const { setToken, setIsAuthenticated } = useAuthStore();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleSocialSignup = async (provider: string) => {
    try {
      if (socialAuth.status === 'pending') {
        toast.info('이미 처리 중입니다. 잠시만 기다려주세요.');
        return;
      }

      setSocialAuth({ status: 'pending', provider });
      
      const response = await socialLogin.mutateAsync({ 
        provider,
        source: 'signup'
      });

      if (response.authUrl) {
        window.location.href = response.authUrl;
      } else {
        toast.error('인증 URL을 받아오지 못했습니다.');
        setSocialAuth({ status: 'idle' });
      }

    } catch (error) {
      toast.error('소셜 회원가입 처리 중 오류가 발생했습니다.');
      setSocialAuth({ status: 'idle' });
    }
  };

  const handleClick = (provider: SocialProvider) => (e: React.MouseEvent) => {
    e.preventDefault();
    handleSocialSignup(provider);
  };

  const getSocialButtonProps = (provider: SocialProvider) => {
    const isLoading = socialAuth.status === 'pending' && socialAuth.provider === provider;
    
    return {
      disabled: isLoading,
      className: `${provider} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`,
      children: isLoading ? '처리중...' : `${provider === 'naver' ? '네이버' : provider === 'kakao' ? '카카오' : '구글'} 회원가입`
    };
  };

  const handleSimpleSignUp = () => {
    setIsNavigating(true);
    setTimeout(() => {
      navigate('/signup/form');
    }, 500);
  };

  return (
    <SignUpContainer>
      <div className="coupon-banner">
        <div className="coupon">
          <div className="coupon-left">
            <span className="text-top">쿠</span>
            <span className="text-bottom">폰</span>
          </div>
          <div className="coupon-right">
            <div className="amount">
              <span className="won">￦</span>
              <span className="value">10,000</span>
            </div>
            <div className="description">회원가입 시 즉시 지급</div>
          </div>
        </div>
      </div>
      
      <Button className="primary" onClick={handleSimpleSignUp}>
        BigMove 간편회원가입
      </Button>

      <Divider>
        <span>또는</span>
      </Divider>

      <SocialButton 
        onClick={handleClick('naver')} 
        {...getSocialButtonProps('naver')}
      >
        <NaverIcon />
        <span>{getSocialButtonProps('naver').children}</span>
      </SocialButton>

      <SocialButton 
        onClick={handleClick('kakao')} 
        {...getSocialButtonProps('kakao')}
      >
        <KakaoIcon />
        <span>{getSocialButtonProps('kakao').children}</span>
      </SocialButton>

      <SocialButton 
        onClick={handleClick('google')} 
        {...getSocialButtonProps('google')}
      >
        <GoogleIcon />
        <span>{getSocialButtonProps('google').children}</span>
      </SocialButton>

      <LoginSection>
        <span>이미 회원이신가요?</span>
        <LoginLink to="/login">로그인하기</LoginLink>
      </LoginSection>

      <SkipLoginButton to="/items">
        로그인 없이 진행하기
      </SkipLoginButton>

      {socialAuth.status === 'pending' && (
        <LoadingProgress 
          message={`${socialAuth.provider === 'naver' ? '네이버' : 
            socialAuth.provider === 'kakao' ? '카카오' : '구글'} 로그인 페이지로 이동 중입니다...`} 
        />
      )}

      {isNavigating && (
        <LoadingProgress 
          message="회원가입 페이지로 이동하고 있습니다..." 
        />
      )}
    </SignUpContainer>
  );
};

export default SignUpPage;