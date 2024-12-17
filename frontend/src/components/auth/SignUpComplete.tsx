import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useSignUp } from '../../contexts/SignUpContext';
import { useAuth } from '../../hooks/useAuth';
import { SignUpStep } from '../../types/auth';
import { FaCheckCircle, FaGift } from 'react-icons/fa';

const CompleteContainer = styled.div`
  max-width: 480px;
  margin: 8rem auto;
  padding: 2rem;
  text-align: center;
  background-color: var(--dark-gray);
  border-radius: 10px;
`;

const SuccessIcon = styled(FaCheckCircle)`
  font-size: 4rem;
  color: var(--cyan);
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: var(--cyan);
  margin-bottom: 1rem;
`;

const Message = styled.p`
  color: #f5f5f1;
  font-size: 1.1rem;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const Button = styled.button`
  width: 90%;
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

const CouponBox = styled.div`
  background: linear-gradient(135deg, #45b7a0 0%, #3498db 100%);
  border-radius: 12px;
  padding: 1.5rem;
  margin: 2rem 0;
  color: white;
  text-align: left;
`;

const CouponAmount = styled.div`
  font-size: 2rem;
  font-weight: bold;
  margin: 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CouponInfo = styled.div`
  font-size: 0.9rem;
  opacity: 0.9;
`;

const SignUpComplete: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useSignUp();
  const auth = useAuth();

  const handleContinue = () => {
    navigate('/item-selection');
  };

  return (
    <CompleteContainer>
      <SuccessIcon />
      <Title>회원가입 완료!</Title>
      <Message>
        BigMove의 회원이 되신 것을 환영합니다.
        <br />
        {auth.user?.name}님을 위한 특별한 혜택이 준비되어 있습니다.
      </Message>

      <CouponBox>
        <FaGift size={24} />
        <CouponAmount>
          ₩10,000
        </CouponAmount>
        <CouponInfo>
          • 모든 배송 서비스에서 사용 가능
          <br />
          • 결제 시 자동으로 적용됩니다
          <br />
          • 30일 동안 유효
        </CouponInfo>
      </CouponBox>

      <Button onClick={handleContinue}>
        BigMove 서비스 이용하러 가기
      </Button>
    </CompleteContainer>
  );
};

export default SignUpComplete;
