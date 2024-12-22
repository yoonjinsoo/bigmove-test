import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import SocialLogin from './SocialLogin';
import { Title } from './styles/SignUpStyles';

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

const LoginContainer = styled.div`
  max-width: 500px;
  margin: 80px auto 0;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StyledTitle = styled(Title)`
  text-align: center;
  width: 100%;
  margin-bottom: 1.5rem;
  font-size: 2rem;
`;

const LoginForm: React.FC<LoginFormProps> = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loginMutation = useAuth().login;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginMutation.mutateAsync({ 
        email: formData.email, 
        password: formData.password 
      });
    } catch (err) {
      setError('로그인에 실패했습니다.');
    }
  };

  useEffect(() => {
    return () => {
      login.reset();
    };
  }, [login]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    requestAnimationFrame(() => {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      if (error) {
        setError(null);
      }
    });
  }, [error]);

  return (
    <LoginContainer>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <StyledTitle>BigMove 로그인하기</StyledTitle>
      <StyledSignUpSection>
        <p>아직 회원이 아니신가요? <Link to="/signup">회원가입하기</Link></p>
      </StyledSignUpSection>
      <FormWrapper onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="email">
            <FaEnvelope />
            이메일
          </Label>
          <Input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            placeholder="이메일을 입력해주세요"
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
            value={formData.password}
            onChange={handleChange}
            autoComplete="current-password"
            placeholder="비밀번호를 입력해주세요"
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
      <SocialLogin />
    </LoginContainer>
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

const FormWrapper = styled.form`
  width: 80%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
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

export default LoginForm;