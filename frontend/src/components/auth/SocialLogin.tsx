import React from 'react';
import styled from 'styled-components';
import { NaverIcon, KakaoIcon, GoogleIcon } from './icons/SocialIcons';
import { useAuth } from '../../hooks/useAuth';

const SocialLogin = () => {
  const { socialLogin } = useAuth();

  const handleSocialLogin = async (provider: string) => {
    try {
      const result = await socialLogin.mutateAsync({ 
        provider,
        source: 'login'
      });
      
      if (result.authUrl) {
        window.location.href = result.authUrl;
      }
    } catch (error) {
      console.error('소셜 로그인 중 오류가 발생했습니다.');
    }
  };

  return (
    <>
      <StyledDivider>
        <span>또는</span>
      </StyledDivider>
      <SocialLoginButton 
        className="naver" 
        onClick={() => handleSocialLogin('naver')}
        data-provider="naver"
      >
        <NaverIcon />
        네이버로 계속하기
      </SocialLoginButton>
      <SocialLoginButton 
        className="kakao"
        onClick={() => handleSocialLogin('kakao')}
        data-provider="kakao"
      >
        <KakaoIcon />
        카카오로 계속하기
      </SocialLoginButton>
      <SocialLoginButton 
        className="google"
        onClick={() => handleSocialLogin('google')}
        data-provider="google"
      >
        <GoogleIcon />
        구글로 계속하기
      </SocialLoginButton>
    </>
  );
};

const StyledDivider = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1rem auto;
  width: 80%;

  span {
    padding: 0 0.6rem;
    color: #f5f5f5;
    font-size: 1rem;
  }

  &::before,
  &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid var(--light-gray);
  }

  &::before {
    margin-right: 0rem;
  }

  &::after {
    margin-left: 0rem;
  }
`;

const SocialLoginButton = styled.button`
  width: 80%;
  margin: 0.5rem auto;
  padding: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: scale(1.02);
  }

  &.naver {
    background: #03C75A;
    color: white;
    border: none;

    &:hover {
      background: #02b351;
    }
  }

  &.kakao {
    background: #FEE500;
    color: #000000;
    border: none;

    &:hover {
      background: #fdd835;
    }
  }

  &.google {
    color: #495057;
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

export default SocialLogin; 