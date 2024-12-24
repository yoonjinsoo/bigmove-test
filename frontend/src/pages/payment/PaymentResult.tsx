import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import api from '../../services/api';

const Container = styled.div`
  max-width: 800px;
  margin: 3rem auto;
  padding: 2rem;
  text-align: center;
`;

interface ResultMessageProps {
  $status: 'success' | 'fail';
}

const ResultMessage = styled.h2<ResultMessageProps>`
  margin-bottom: 2rem;
  color: ${props => props.$status === 'success' ? 'var(--cyan)' : 'var(--red)'};
`;

const Button = styled.button`
  padding: 1rem 2rem;
  background-color: var(--cyan);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;

  &:hover {
    background-color: var(--cyan-dark);
  }
`;

const PaymentDetails = styled.div`
  margin-bottom: 2rem;
`;

const InfoItem = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.span`
  font-weight: bold;
`;

const Value = styled.span`
  margin-left: 1rem;
`;

const PaymentResult = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const paymentKey = searchParams.get('paymentKey');
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');

    console.log('Payment callback params:', { paymentKey, orderId, amount });

    const confirmPayment = async () => {
      try {
        if (!paymentKey || !orderId || !amount) {
          throw new Error('필수 결제 정보가 누락되었습니다.');
        }

        console.log('Sending payment confirmation request:', {
          paymentKey,
          orderId,
          amount: Number(amount)
        });

        const response = await api.post('/payments/confirm', {
          paymentKey,
          orderId,
          amount: Number(amount)
        });

        console.log('Payment confirmation response:', response.data);
        setPaymentDetails(response.data);
        setIsLoading(false);
      } catch (error: any) {
        console.error('Payment confirmation error details:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        setError(error.response?.data?.message || '결제 승인 중 오류가 발생했습니다.');
        setIsLoading(false);
      }
    };

    if (location.search) {
      confirmPayment();
    } else {
      setError('결제 정보가 올바르지 않습니다.');
      setIsLoading(false);
    }
  }, [location.search]);

  if (isLoading) {
    return (
      <Container>
        <ResultMessage $status="success">결제 승인 중...</ResultMessage>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ResultMessage $status="fail">결제 오류</ResultMessage>
        <p>{error}</p>
        <Button onClick={() => navigate('/')}>홈으로 돌아가기</Button>
      </Container>
    );
  }

  const handleHomeClick = () => {
    navigate('/orders/history');
  };

  return (
    <Container>
      <ResultMessage $status="success">결제 완료</ResultMessage>
      <p>결제가 성공적으로 완료되었습니다.</p>
      <PaymentDetails>
        <InfoItem>
          <Label>주문번호</Label>
          <Value>{paymentDetails?.orderId}</Value>
        </InfoItem>
        <InfoItem>
          <Label>결제금액</Label>
          <Value>{Number(paymentDetails?.amount).toLocaleString()}원</Value>
        </InfoItem>
      </PaymentDetails>
      <Button onClick={handleHomeClick}>주문 내역 확인하기</Button>
    </Container>
  );
};

export default PaymentResult; 