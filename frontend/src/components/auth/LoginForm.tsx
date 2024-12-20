import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { SignUpContainer, Title } from './styles/SignUpStyles';
import { NaverIcon, KakaoIcon, GoogleIcon } from './icons/SocialIcons';
import axios from 'axios';
import { useToast } from '../common/Toast';
import { useAuthStore } from '../../store/authStore';

const ErrorMessage = styled.div`
  color: #1a73e8;  // 구글 파란색으로 변경
  background-color: #e8f0fe;  // 밝은 파란색 배경
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
  font-weight: 500;
  border: 1px solid #4285f4;
`;

interface LoginFormProps {
  onSubmit?: (data: { email: string; password: string }) => void;
}

const LoginForm: React.FC<LoginFormProps> = () => {
  const navigate = useNavigate();
  const { login, socialLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const location = useLocation();
  const { showToast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const { loginRedirectInfo, setLoginRedirectInfo } = useAuthStore();

  useEffect(() => {
    // 컴포넌트 마운트 시 전체 상태 확인
    const currentState = useAuthStore.getState();
    console.log('LoginForm state updated:', currentState);
    console.log('loginRedirectInfo updated:', currentState.loginRedirectInfo);
    
    if (currentState.loginRedirectInfo?.provider) {
      console.log('Found loginRedirectInfo, setting error:', currentState.loginRedirectInfo.message);
      setError(currentState.loginRedirectInfo.message);

      const buttonElement = document.querySelector(`[data-provider="${currentState.loginRedirectInfo.provider}"]`) as HTMLElement;
      if (buttonElement) {
        buttonElement.style.border = '2px solid #4285f4';
        buttonElement.style.boxShadow = '0 0 5px rgba(66, 133, 244, 0.5)';
      }
    }
  }, [loginRedirectInfo]); // loginRedirectInfo를 의존성 배열에 추가

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await login.mutateAsync({ 
        email, 
        password 
      });

      if (response && response.access_token) {
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
          localStorage.setItem('rememberedPassword', password);
        } else {
          localStorage.removeItem('rememberedEmail');
          localStorage.removeItem('rememberedPassword');
        }
      } else {
        setError('로그인 응답이 올바르지 않습니다.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('로그인에 실패했습니다.');
    }
  };

  useEffect(() => {
    return () => {
      login.reset();
    };
  }, [login]);

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
      setError('소셜 로그인 중 오류가 발생했습니다.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'email') {
      setEmail(value);
    } else if (name === 'password') {
      setPassword(value);
    }
    if (error) {
      setError('');
    }
  };

  return (
    <SignUpContainer>
      {error && (
        <ErrorMessage>
          {error}
        </ErrorMessage>
      )}
      <Title><span>BigMove</span> 로그인하기</Title>
      <StyledSignUpSection>
        <p>아직 회원이 아니신가요? <Link to="/signup">회원가입하기</Link></p>
      </StyledSignUpSection>
      <FormWrapper onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="email">
            <FaEnvelope />
            이메일(아이디로 사용됩니다)
          </Label>
          <Input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={handleChange}
            placeholder="이메일을 입력해주세요"
            required
          />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="password">
            <FaLock />
            비밀번호
          </Label>
          <Input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={handleChange}
            placeholder="비밀번호를 입력해주세요"
            required
          />
        </FormGroup>
        <RememberMeWrapper>
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <label htmlFor="rememberMe">로그인 정보 기억하기</label>
        </RememberMeWrapper>
        <Button type="submit">로그인</Button>
      </FormWrapper>
      <StyledDivider>
        <span>또는</span>
      </StyledDivider>
      <SocialLoginButton 
        data-provider="naver" 
        className="naver" 
        onClick={() => handleSocialLogin('naver')}>
        <NaverIcon />
        네이버 로그인
      </SocialLoginButton>
      <SocialLoginButton 
        data-provider="kakao" 
        className="kakao" 
        onClick={() => handleSocialLogin('kakao')}>
        <KakaoIcon />
        카카오톡 로그인
      </SocialLoginButton>
      <SocialLoginButton 
        data-provider="google" 
        className="google" 
        onClick={() => handleSocialLogin('google')}>
        <GoogleIcon />
        구글 로그인
      </SocialLoginButton>
      <LoginDivider />
      <StyledLoginSection>
        <Link to="/forgot-password">비밀번호를 잊으셨나요?</Link>
      </StyledLoginSection>
    </SignUpContainer>
  );
};

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.9rem;
  background-color: #2A2A2A;
  color: var(--text-color);

  &:focus {
    outline: none;
    border-color: #4ECDC4;
    box-shadow: 0 0 0 1px #4ECDC4;
  }

  &:disabled {
    background-color: var(--dark-gray);
    cursor: not-allowed;
  }

  &::placeholder {
    color: #999;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 0.3rem;
  width: 100%;

  &:first-of-type {
    margin-top: 1.5rem;
  }
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.4rem;
  color: #4ECDC4;
  font-size: 0.9rem;
  
  svg {
    color: #4ECDC4;
    font-size: 1.2em;
  }
`;

const Button = styled.button`
  width: 60%;
  padding: 0.8rem;
  margin: 0.3rem auto;
  border: none;
  border-radius: 8px;
  background: #3498db;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.05rem;
  transform: scale(1);
  transition: all 0.2s ease-in-out;

  &:hover {
    background: #2980b9;
    transform: scale(1.02);
  }
`;

const StyledSignUpSection = styled.div`
  text-align: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: none;

  p {
    color: var(--medium-gray);
    font-size: 0.9rem;
  }

  a {
    color: #40E0D0;
    text-decoration: none;
    margin-left: 0.5rem;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const SocialLoginButton = styled.button`
  width: 80%;
  padding: 0.8rem;
  margin: 0.5rem auto;
  border: 1px solid #ddd;
  border-radius: 50px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.9rem;
  transform: scale(1);
  transition: all 0.2s ease-in-out;
  gap: 0.8rem;

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

const LoginDivider = styled.div`
  width: 80%;
  margin: 1rem auto;
  border-bottom: 1px solid #ddd;
`;

const StyledLoginSection = styled.div`
  text-align: center;
  margin-top: 0.5rem;

  a {
    color: #3498db;
    text-decoration: none;
    font-size: 0.9rem;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const FormWrapper = styled.form`
  width: 80%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

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

const RememberMeWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
  
  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    background-color: #2A2A2A;
  }

  label {
    color: #999;
    font-size: 14px;
  }
`;

const getProviderKoreanName = (provider: string) => {
  switch (provider) {
    case 'naver':
      return '네이버';
    case 'kakao':
      return '카카오톡';
    case 'google':
      return '구글';
    default:
      return '';
  }
};

export default LoginForm;