import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Box, Typography } from '@mui/material';
import { MdArrowBack, MdArrowForward } from 'react-icons/md';
import useOrderStore from '../../store/orderStore';
import { ButtonContainer, Button } from '../styles/SelectionSummaryStyles';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 3rem;
  color: white;
`;

const PaymentCard = styled.div`
  background: #2A2A2A;
  border: 1px solid #40E0D0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
`;

const CardTitle = styled.h2`
  color: #40E0D0;
  font-size: 18px;
  margin-bottom: 20px;
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #333;

  &:last-child {
    border-bottom: none;
  }
`;

const Label = styled.span`
  color: #999;
  font-size: 14px;
`;

const Value = styled.span`
  color: white;
  font-size: 14px;
`;

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const RadioOption = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 10px;
  border: 1px solid #333;
  border-radius: 4px;
  
  &:hover {
    border-color: #40E0D0;
  }

  input[type="radio"] {
    accent-color: #40E0D0;
  }
`;

const Input = styled.input`
  background: #333;
  border: 1px solid #444;
  border-radius: 4px;
  padding: 8px 12px;
  color: white;
  width: 100%;
  margin-top: 5px;

  &:focus {
    border-color: #40E0D0;
    outline: none;
  }
`;

const TotalPriceItem = styled(InfoItem)`
  margin-top: 10px;
  padding-top: 20px;
  border-top: 1px solid #40E0D0;
  border-bottom: none;
`;

const TotalPriceLabel = styled(Label)`
  font-size: 16px;
  font-weight: bold;
  color: white;
`;

const TotalPriceValue = styled.span`
  color: #40E0D0;
  font-size: 20px;
  font-weight: bold;
`;

const AgreementSection = styled.div`
  margin-top: 20px;
`;

const AgreementItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  color: #999;
  font-size: 14px;

  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
  }
`;

const PaymentTest: React.FC = () => {
  const navigate = useNavigate();
  const orderData = useOrderStore((state) => state.orderData);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [agreements, setAgreements] = useState({
    allAgree: false,
    termsAgree: false,
    privacyAgree: false,
    paymentAgree: false,
  });

  const handleAllAgreement = (checked: boolean) => {
    setAgreements({
      allAgree: checked,
      termsAgree: checked,
      privacyAgree: checked,
      paymentAgree: checked,
    });
  };

  const handleSingleAgreement = (name: keyof typeof agreements, checked: boolean) => {
    const newAgreements = {
      ...agreements,
      [name]: checked,
    };
    
    // 모든 필수 약관에 동의했는지 확인
    const allChecked = ['termsAgree', 'privacyAgree', 'paymentAgree']
      .every(key => newAgreements[key as keyof typeof agreements]);
    
    setAgreements({
      ...newAgreements,
      allAgree: allChecked,
    });
  };

  if (!orderData) {
    return (
      <Container>
        <Typography color="error" gutterBottom>
          주문 정보가 없습니다. 물품 선택부터 다시 진행해주세요.
        </Typography>
        <Button onClick={() => navigate('/')}>
          물품 선택하기
        </Button>
      </Container>
    );
  }

  const handlePayment = () => {
    // 필수 약관 동의 확인
    if (!agreements.termsAgree || !agreements.privacyAgree || !agreements.paymentAgree) {
      alert('필수 약관에 모두 동의해주세요.');
      return;
    }

    // 여기서 실제로는 PG사 결제 모듈이 호출되어야 합니다
    alert('테스트 결제가 완료되었습니다!');
    navigate('/'); // 메인 페이지로 이동
  };

  return (
    <div className="step-container">
      <Container>
        <h1 className="step-title" style={{ marginBottom: '1.5rem' }}>결제 정보 입력</h1>
        
        {/* 결제 금액 정보 */}
        <PaymentCard>
          <CardTitle>결제 금액</CardTitle>
          <CardContent>
            <InfoItem>
              <Label>기본 요금</Label>
              <Value>{orderData.price_details.basePrice.toLocaleString()}원</Value>
            </InfoItem>
            {orderData.price_details.additionalFees.distanceFee > 0 && (
              <InfoItem>
                <Label>거리 추가 요금</Label>
                <Value>{orderData.price_details.additionalFees.distanceFee.toLocaleString()}원</Value>
              </InfoItem>
            )}
            {orderData.service_options.total_option_fee > 0 && (
              <InfoItem>
                <Label>서비스 옵션 요금</Label>
                <Value>{orderData.service_options.total_option_fee.toLocaleString()}원</Value>
              </InfoItem>
            )}
            <TotalPriceItem>
              <TotalPriceLabel>총 결제 금액</TotalPriceLabel>
              <TotalPriceValue>
                {(
                  orderData.price_details.basePrice +
                  (orderData.price_details.additionalFees.distanceFee || 0) +
                  (orderData.service_options.total_option_fee || 0)
                ).toLocaleString()}원
              </TotalPriceValue>
            </TotalPriceItem>
          </CardContent>
        </PaymentCard>

        {/* 결제 수단 선택 */}
        <PaymentCard>
          <CardTitle>결제 수단 선택</CardTitle>
          <CardContent>
            <RadioGroup>
              <RadioOption>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>신용/체크카드</span>
              </RadioOption>
              <RadioOption>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="transfer"
                  checked={paymentMethod === 'transfer'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>계좌이체</span>
              </RadioOption>
              <RadioOption>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="virtual"
                  checked={paymentMethod === 'virtual'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>가상계좌</span>
              </RadioOption>
            </RadioGroup>
          </CardContent>
        </PaymentCard>

        {/* 카드 정보 입력 */}
        {paymentMethod === 'card' && (
          <PaymentCard>
            <CardTitle>카드 정보 입력</CardTitle>
            <CardContent>
              <InfoItem>
                <Label>카드번호</Label>
                <Input
                  type="text"
                  placeholder="0000-0000-0000-0000"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  maxLength={19}
                />
              </InfoItem>
              <InfoItem>
                <Label>유효기간</Label>
                <Input
                  type="text"
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  maxLength={5}
                />
              </InfoItem>
              <InfoItem>
                <Label>보안코드(CVV)</Label>
                <Input
                  type="password"
                  placeholder="***"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  maxLength={3}
                />
              </InfoItem>
            </CardContent>
          </PaymentCard>
        )}

        {/* 약관 동의 섹션 */}
        <PaymentCard>
          <CardTitle>약관 동의</CardTitle>
          <AgreementSection>
            <AgreementItem>
              <input
                type="checkbox"
                checked={agreements.allAgree}
                onChange={(e) => handleAllAgreement(e.target.checked)}
              />
              <span>전체 동의</span>
            </AgreementItem>
            <AgreementItem>
              <input
                type="checkbox"
                checked={agreements.termsAgree}
                onChange={(e) => handleSingleAgreement('termsAgree', e.target.checked)}
              />
              <span>이용약관 동의 (필수)</span>
            </AgreementItem>
            <AgreementItem>
              <input
                type="checkbox"
                checked={agreements.privacyAgree}
                onChange={(e) => handleSingleAgreement('privacyAgree', e.target.checked)}
              />
              <span>개인정보 수집 및 이용 동의 (필수)</span>
            </AgreementItem>
            <AgreementItem>
              <input
                type="checkbox"
                checked={agreements.paymentAgree}
                onChange={(e) => handleSingleAgreement('paymentAgree', e.target.checked)}
              />
              <span>결제 진행 동의 (필수)</span>
            </AgreementItem>
          </AgreementSection>
        </PaymentCard>

        <ButtonContainer>
          <Button onClick={() => navigate('/order/summary')}>
            <MdArrowBack size={16} /> 이전으로
          </Button>
          <Button onClick={handlePayment}>
            결제하기 <MdArrowForward size={16} />
          </Button>
        </ButtonContainer>
      </Container>
    </div>
  );
};

export default PaymentTest;