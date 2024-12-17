import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Box, Typography } from '@mui/material';
import ProgressBar from '../../components/common/ProgressBar';
import { MdArrowBack, MdArrowForward } from 'react-icons/md';
import useOrderStore from '../../store/orderStore';
import { ButtonContainer, Button } from '../../pages/styles/SelectionSummaryStyles';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  color: white;
`;

const SummaryCard = styled.div`
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
  display: flex;
  align-items: center;
  gap: 10px;
`;

const PriceValue = styled.span`
  color: #40E0D0;
  font-weight: bold;
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

export const Summary: React.FC = () => {
  const navigate = useNavigate();
  const orderData = useOrderStore((state) => state.orderData);

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

  const { items, delivery_info, addresses, service_options, price_details } = orderData;

  return (
    <div className="step-container">
      <div className="step-progress-bar">
        <ProgressBar currentStep={8} totalSteps={8} />
      </div>
      <Container>
        <h1 className="step-title">주문 내역 확인</h1>
        
        {/* 선택한 물품 정보 */}
        <SummaryCard>
          <CardTitle>선택한 물품</CardTitle>
          <CardContent>
            {items.map((item, index) => (
              <InfoItem key={index}>
                <Label>상품명</Label>
                <Value>{item.name}</Value>
              </InfoItem>
            ))}
          </CardContent>
        </SummaryCard>

        {/* 배송 일정 */}
        <SummaryCard>
          <CardTitle>배송 일정</CardTitle>
          <CardContent>
            <InfoItem>
              <Label>배송 날짜</Label>
              <Value>{delivery_info.date}</Value>
            </InfoItem>
            <InfoItem>
              <Label>상차 시간</Label>
              <Value>{delivery_info.loading_time}</Value>
            </InfoItem>
            <InfoItem>
              <Label>하차 시간</Label>
              <Value>{delivery_info.unloading_time}</Value>
            </InfoItem>
            <InfoItem>
              <Label>배송 옵션</Label>
              <Value>{delivery_info.delivery_option}</Value>
            </InfoItem>
          </CardContent>
        </SummaryCard>

        {/* 주소 정보 */}
        <SummaryCard>
          <CardTitle>주소 정보</CardTitle>
          <CardContent>
            <InfoItem>
              <Label>출발지</Label>
              <Value>{addresses.from_address} {addresses.from_detail_address}</Value>
            </InfoItem>
            <InfoItem>
              <Label>도착지</Label>
              <Value>{addresses.to_address} {addresses.to_detail_address}</Value>
            </InfoItem>
            <InfoItem>
              <Label>총 이동거리</Label>
              <Value>{addresses.distance}km</Value>
            </InfoItem>
            {addresses.additional_distance > 0 && (
              <InfoItem>
                <Label>추가 거리</Label>
                <Value>{addresses.additional_distance}km</Value>
              </InfoItem>
            )}
          </CardContent>
        </SummaryCard>

        {/* 서비스 옵션 */}
        <SummaryCard>
          <CardTitle>서비스 옵션</CardTitle>
          <CardContent>
            {service_options.floor_option_id && (
              <InfoItem>
                <Label>층수 옵션</Label>
                <Value>
                  {service_options.floor_option_name}
                  <PriceValue>+{service_options.floor_option_fee.toLocaleString()}원</PriceValue>
                </Value>
              </InfoItem>
            )}
            {service_options.ladder_option_id && (
              <InfoItem>
                <Label>사다리차</Label>
                <Value>
                  {service_options.ladder_option_name}
                  <PriceValue>+{service_options.ladder_option_fee.toLocaleString()}원</PriceValue>
                </Value>
              </InfoItem>
            )}
            {service_options.special_vehicle_id && (
              <InfoItem>
                <Label>특수 차량</Label>
                <Value>
                  {service_options.special_vehicle_name}
                  <PriceValue>+{service_options.special_vehicle_fee.toLocaleString()}원</PriceValue>
                </Value>
              </InfoItem>
            )}
          </CardContent>
        </SummaryCard>

        {/* 가격 정보 */}
        <SummaryCard>
          <CardTitle>가격 정보</CardTitle>
          <CardContent>
            <InfoItem>
              <Label>기본 요금</Label>
              <Value>{price_details.basePrice.toLocaleString()}원</Value>
            </InfoItem>
            {price_details.additionalFees.distanceFee > 0 && (
              <InfoItem>
                <Label>거리 추가 요금</Label>
                <Value>{price_details.additionalFees.distanceFee.toLocaleString()}원</Value>
              </InfoItem>
            )}
            {service_options.total_option_fee > 0 && (
              <InfoItem>
                <Label>서비스 옵션 요금</Label>
                <Value>{service_options.total_option_fee.toLocaleString()}원</Value>
              </InfoItem>
            )}
            <TotalPriceItem>
              <TotalPriceLabel>총 금액</TotalPriceLabel>
              <TotalPriceValue>
                {(
                  price_details.basePrice +
                  (price_details.additionalFees.distanceFee || 0) +
                  (service_options.total_option_fee || 0)
                ).toLocaleString()}원
              </TotalPriceValue>
            </TotalPriceItem>
          </CardContent>
        </SummaryCard>

        <ButtonContainer>
          <Button onClick={() => navigate(-1)}>
            <MdArrowBack size={16} /> 이전으로
          </Button>
          <Button onClick={() => navigate('/payment/test')}>
            결제하기 <MdArrowForward size={16} />
          </Button>
        </ButtonContainer>
      </Container>
    </div>
  );
};