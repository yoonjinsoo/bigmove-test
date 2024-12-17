import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { SignUpContainer, Title, Button, LoginSection, LoginLink } from './styles/SignUpStyles';
import styled from 'styled-components';
import AgreementSection from '../../pages/auth/AgreementSection';
import UserInfoInputs from './UserInfoInputs';
import { SignupAgreements } from '../../types/auth';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';
import { useQueryClient } from '@tanstack/react-query';

interface PasswordValidation {
  hasLength: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  hasLetter: boolean;
}

const SignUpForm: React.FC = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const queryClient = useQueryClient();
  const handleAuthSuccessWithCache = useAuthStore(state => state.handleAuthSuccessWithCache);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    name: ''
  });
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    agreements: ''
  });
  const [agreements, setAgreements] = useState<SignupAgreements>({
    terms: true,
    privacy: true,
    privacyThirdParty: true,
    marketing: true
  });
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>({
    hasLength: false,
    hasNumber: false,
    hasSpecial: false,
    hasLetter: false
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => {
      setMounted(false);
    };
  }, []);

  const validateForm = () => {
    let isValid = true;
    const newErrors = { name: '', email: '', password: '', passwordConfirm: '', agreements: '' };

    if (!formData.name) {
      newErrors.name = '이름을 입력해주세요';
      isValid = false;
    }

    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요';
      isValid = false;
    }

    if (!formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호 확인을 입력해주세요';
      isValid = false;
    } else if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const validatePassword = (password: string) => {
    setPasswordValidation({
      hasLength: password.length >= 8,
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      hasLetter: /[a-zA-Z]/.test(password)
    });
  };

  const handleCheckboxChange = (name: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    if (name === 'marketing') {
      setAgreements(prev => ({
        ...prev,
        [name]: event.target.checked
      }));
    }
  };

  const handleModalOpen = (type: 'terms' | 'privacy' | 'privacy-third-party' | 'privacy-marketing') => {
    window.open(`/policy/${type}.html`, '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!agreements.terms || !agreements.privacy || !agreements.privacyThirdParty) {
      setErrors(prev => ({
        ...prev,
        agreements: '필수 약관에 모두 동의해주세요.'
      }));
      return;
    }

    try {
      const response = await signup.mutateAsync({
        ...formData,
        agreements
      });
      
      if (response && response.access_token) {
        handleAuthSuccessWithCache(queryClient, response);
        
        if (mounted) {
          navigate('/signup/complete');
        }
      }
    } catch (error: any) {
      console.error('회원가입 실패:', error);
      if (mounted) {
        setErrors(prev => ({
          ...prev,
          email: error.message || '회원가입에 실패했습니다.'
        }));
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === 'password') {
      validatePassword(value);
    }
    
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <SignUpContainer>
      <FormWrapper>
        <StyledTitle>BigMove 회원가입</StyledTitle>
        <SubTitle>간편하게 가입하고 배송 견적을 받아보세요!</SubTitle>
        <Form onSubmit={handleSubmit}>
          <UserInfoInputs
            formData={formData}
            errors={errors}
            passwordValidation={passwordValidation}
            onChange={handleChange}
            showPasswordFields={true}
          />
          <AgreementSection
            agreements={agreements}
            handleCheckboxChange={handleCheckboxChange}
            handleModalOpen={handleModalOpen}
          />
          <SubmitButton type="submit">회원가입 완료</SubmitButton>
          <StyledLoginSection>
            <span>이미 회원이신가요?</span>
            <LoginLink to="/login">로그인하기</LoginLink>
          </StyledLoginSection>
        </Form>
      </FormWrapper>
    </SignUpContainer>
  );
};

const FormWrapper = styled.div`
  width: 100%;
  max-width: 500px;  /* 원하는 크기로 조절 가능 */
  margin: 0 auto;    /* 가운데 정렬을 위해 추가 */
  background: var(--dark-gray);
  padding: 2rem;
`;

const StyledTitle = styled(Title)`
  color: #4ECDC4;
  text-align: center;
  width: 100%;
  margin-bottom: 1.5rem;
  font-size: 2rem;  /* 타이틀 크기 조절 */
`;

const SubTitle = styled.p`
  color: #999;
  font-size: 1rem;
  margin-bottom: 2rem;  
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const StyledLoginSection = styled(LoginSection)`
  border-top: none;
  padding-top: 0rem;
  margin-top: 0rem;
`;

const SubmitButton = styled(Button)`
  width: 200px;
  background: #3498db;
  color: white;
  padding: 0.8rem;
  font-size: 1.05rem;
  font-weight: 600;
  margin-top: 0rem;  
  border-radius: 8px;
  border: none;
  transition: all 0.2s ease-in-out;

  &:hover {
    background: #2980b9;
    transform: scale(1.02);
  }
`;

export default SignUpForm;
