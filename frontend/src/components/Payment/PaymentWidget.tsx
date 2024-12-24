import { useEffect, useRef, useState } from 'react';
import { loadPaymentWidget, PaymentWidgetInstance } from '@tosspayments/payment-widget-sdk';
import styled from 'styled-components';

const PaymentContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
`;

const PaymentButton = styled.button`
  width: 100%;
  padding: 1rem;
  margin-top: 2rem;
  background-color: var(--cyan);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--cyan-dark);
  }

  &:disabled {
    background-color: var(--gray);
    cursor: not-allowed;
  }
`;

interface PaymentWidgetProps {
  amount: number;
  orderId: string;
  orderName: string;
  customerName: string;
  onSuccess: (paymentKey: string) => void;
}

const PaymentWidget = ({ amount, orderId, orderName, customerName, onSuccess }: PaymentWidgetProps) => {
  const paymentWidgetRef = useRef<PaymentWidgetInstance | null>(null);
  const [isWidgetReady, setIsWidgetReady] = useState(false);
  console.log('TOSS KEY:', process.env.REACT_APP_TOSS_WIDGET_CLIENT_KEY);
  const clientKey = process.env.REACT_APP_TOSS_WIDGET_CLIENT_KEY;
  const customerKey = `CUSTOMER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  useEffect(() => {
    const initializeWidget = async () => {
      if (!clientKey) {
        console.error('토스페이먼츠 클라이언트 키가 설정되지 않았습니다.');
        return;
      }

      try {
        if (!(window as any).PaymentWidget) {
          await new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://js.tosspayments.com/v1/payment-widget';
            script.onload = resolve;
            document.body.appendChild(script);
          });
        }

        const paymentWidget = await loadPaymentWidget(clientKey, customerKey);
        await paymentWidget.renderPaymentMethods('#payment-widget', { 
          value: amount,
        });
        
        paymentWidgetRef.current = paymentWidget;
        setIsWidgetReady(true);
      } catch (error) {
        console.error('결제 위젯 초기화 실패:', error);
        alert('결제 위젯 로드에 실패했습니다. 페이지를 새로고침 해주세요.');
      }
    };

    initializeWidget();
  }, [amount, clientKey]);

  const handlePayment = async () => {
    try {
      const paymentWidget = paymentWidgetRef.current;
      
      if (!paymentWidget) {
        throw new Error('결제 위젯이 로드되지 않았습니다.');
      }

      // 모바일 환경 체크
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      await paymentWidget.requestPayment({
        orderId,
        orderName,
        customerName,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
        // 모바일 환경을 위한 추가 설정
        ...(isMobile && {
          windowTarget: 'self',
          useInternalPaymentModule: true
        })
      });

      // 토스페이먼츠는 successUrl로 리다이렉트되므로
      // 여기서는 별도의 처리가 필요 없습니다.

    } catch (error: any) {
      console.error('결제 요청 실패:', error);
      if (error.message === '결제가 취소되었습니다.') {
        return;
      }
      alert('결제 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  if (!isWidgetReady) {
    return <div>결제 위젯을 불러오는 중...</div>;
  }

  return (
    <PaymentContainer>
      <div id="payment-widget" />
      <PaymentButton onClick={handlePayment}>
        {amount.toLocaleString()}원 결제하기
      </PaymentButton>
    </PaymentContainer>
  );
};

export default PaymentWidget; 