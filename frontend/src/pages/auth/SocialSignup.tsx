import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../../components/common/Toast';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';
import { SignupAgreements, AuthResponse, SocialSignupRequest, TempUserInfo, SocialSignupData } from '../../types/auth';
import { SignUpContainer, FormWrapper, Button } from '../../components/auth/styles/SignUpStyles';
import AgreementSection from './AgreementSection';
import UserInfoInputs from '../../components/auth/UserInfoInputs';
import { useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

interface LocationState {
  socialData: {
    email: string;
    name: string;
    provider: string;
    social_id: string;
  };
  temp_token: string;
}

const DisabledInput = styled.input`
  background-color: #f5f5f5;
  cursor: not-allowed;
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #4ECDC4;
  }
`;

const ModalContent = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
`;

const AgreementText = styled.p`
  white-space: pre-line;
  margin-bottom: 0.5rem;
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

const StyledTitle = styled.h1`
  color: #4ECDC4;
  text-align: center;
  width: 100%;
  margin-bottom: 1.5rem;
  font-size: 2rem;
`;

const StyledSubTitle = styled.p`
  color: #999;
  font-size: 1rem;
  margin-bottom: 2rem;
  text-align: center;
`;

const ErrorMessage = styled.span`
  color: #ff4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
`;

const StyledMessage = styled.div<{ $isNewUser: boolean }>`
  text-align: center;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  font-weight: 500;
  background-color: ${props => props.$isNewUser ? '#e8f5e9' : '#ffebee'};
  color: ${props => props.$isNewUser ? '#2e7d32' : '#c62828'};
`;

const AlertBox = styled.div`
  margin: 1rem 0;
  padding: 1rem;
  background-color: rgba(79, 209, 197, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(79, 209, 197, 0.2);
  animation: cardPulseIn 0.5s ease-out;

  @keyframes cardPulseIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

const AlertText = styled.p<{ isError?: boolean }>`
  text-align: center;
  margin: 0 0 12px 0;
  font-size: clamp(14px, 3.5vw, 16px);
  color: ${props => props.isError ? '#e85c5c' : '#4ECDC4'};
`;

const LoginLink = styled(Link)`
  display: block;
  text-align: center;
  color: #2980b9;
  font-size: clamp(14px, 3.5vw, 16px);
  font-weight: 500;
  text-decoration: underline;
  padding: 8px;
  margin-top: 4px;
  
  &:hover {
    opacity: 0.8;
  }

  @media (max-width: 768px) {
    padding: 12px 8px;
  }
`;

const SocialSignup: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { completeSocialSignup, setAuthToken } = useAuth();
  const socialSignupData = useAuthStore((state) => state.socialSignupData);
  const isNewUser = socialSignupData?.is_new_user;
  const tempUserInfo = useAuthStore((state) => state.tempUserInfo);
  const location = useLocation();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: ''
  });

  useEffect(() => {
    if (tempUserInfo?.email && tempUserInfo?.name) {
        setFormData(prev => ({
            ...prev,
            name: tempUserInfo.name,
            email: tempUserInfo.email
        }));
    }
  }, [tempUserInfo]);

  // 1. 약관동의 초기값을 true로 설정
  const [agreements, setAgreements] = useState({
    terms: true,
    privacy: true,
    privacyThirdParty: true,
    marketing: true
  });

  const [errors, setErrors] = useState({
    name: '',
    email: ''
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAgreement, setSelectedAgreement] = useState({
    title: '',
    content: ''
  });

  useEffect(() => {
    if (socialSignupData?.temp_user_info) {
        console.log('소셜 회원가입 데이터:', socialSignupData); // 디버깅용
        setFormData(prev => ({
            ...prev,
            name: socialSignupData.temp_user_info.name || '',
            email: socialSignupData.temp_user_info.email
        }));
    }
  }, [socialSignupData]);

  useEffect(() => {
    // URL의 쿼리 파라미터에서 temp_user_info 가져오기
    const searchParams = new URLSearchParams(location.search);
    const userInfoStr = searchParams.get('user_info');
    
    if (userInfoStr) {
      try {
        const userInfo = JSON.parse(decodeURIComponent(userInfoStr));
        // 폼 데이터 자동 설정
        setFormData(prev => ({
          ...prev,
          name: userInfo.name,
          email: userInfo.email
        }));
      } catch (error) {
        console.error('사용자 정보 파싱 오류:', error);
      }
    }
  }, [location.search]);

  useEffect(() => {
    console.log('SocialSignup 마운트:', {
      전체데이터: socialSignupData,
      신규회원여부: socialSignupData?.is_new_user,
      임시정보: socialSignupData?.temp_user_info
    });
  }, [socialSignupData]);

  useEffect(() => {
    console.log('AlertBox 상태:', {
      조건: !isNewUser,
      isNewUser값: isNewUser
    });
  }, [isNewUser]);

  if (!socialSignupData) {
    return <div>Loading...</div>;
  }

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'name':
        if (!value) return '이름을 입력해주세요';
        if (value.length < 2) return '이름은 2자 이상이어야 합니다';
        break;
    }
    return '';
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!socialSignupData || !tempUserInfo) {
        showToast('회원가입 정보가 없습니다.', 'error');
        return;
      }

      const requestData: SocialSignupRequest = {
        email: tempUserInfo.email,
        name: tempUserInfo.name,
        provider: tempUserInfo.provider,
        provider_id: tempUserInfo.provider_id,
        agreements,
      };

      const response = await completeSocialSignup(requestData);
      
      if (response.access_token) {
        setAuthToken(response.access_token);
        navigate('/signup/complete');
      }
    } catch (error) {
      console.error('회원가입 제출 중 오류:', error);
      showToast('회원가입 처리 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleCheckboxChange = (name: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    if (name === 'marketing') {
      setAgreements(prev => ({ ...prev, [name]: event.target.checked }));
    }
  };

  const getModalTitle = (type: string): string => {
    const titles = {
      'terms': '서비스 이용약관',
      'privacy': '개인정보 수집 및 이용 동의',
      'privacy-third-party': '개인정보 제3자 제공 동의',
      'privacy-marketing': '마케팅 정보 수신 동의'
    };
    return titles[type as keyof typeof titles] || '';
  };

  const handleModalOpen = (type: 'terms' | 'privacy' | 'privacy-third-party' | 'privacy-marketing') => {
    window.open(`/policy/${type}.html`, '_blank');
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  return (
    <SignUpContainer>
      <FormWrapper>
        <StyledTitle>BigMove 회원가입</StyledTitle>
        <StyledSubTitle>간편하게 가입하고 배송 견적을 받아보세요!</StyledSubTitle>
        <AlertBox>
          {!isNewUser ? (
            <>
              <AlertText isError>
                이미 가입된 회원입니다. 로그인을 해주세요!
              </AlertText>
              <LoginLink to="/login">
                로그인 하러가기
              </LoginLink>
            </>
          ) : (
            <AlertText>
              회원가입이 가능합니다! 회원가입을 진행해주세요!
            </AlertText>
          )}
        </AlertBox>
        <form onSubmit={handleSubmit}>
          <UserInfoInputs
            formData={formData}
            errors={errors}
            onChange={onChange}
            showPasswordFields={false}
            disabled={{
              email: true,
              name: false
            }}
            helperText={{
              email: '소셜 계정의 이메일은 수정할 수 없습니다.'
            }}
          />
          <AgreementSection
            agreements={agreements}
            handleCheckboxChange={handleCheckboxChange}
            handleModalOpen={handleModalOpen}
          />
          <SubmitButton type="submit">회원가입 완료</SubmitButton>
        </form>
      </FormWrapper>
    </SignUpContainer>
  );
};

export default SocialSignup;