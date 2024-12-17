import React from 'react';
import { OrderDTO } from '../../types/order';
import { formatPrice } from '../../utils/format';
import { PriceDetailsContainer, PriceRow, Title } from './styles';

interface PriceDetailsProps {
  details: NonNullable<OrderDTO['price_details']>;
}

export const PriceDetails: React.FC<PriceDetailsProps> = ({ details }) => {
  if (!details) return null;
  
  return (
    <PriceDetailsContainer>
      <Title>요금 상세</Title>
      <PriceRow>
        <span>기본 요금</span>
        <span>{formatPrice(details.base_price)}원</span>
      </PriceRow>
      <PriceRow>
        <span>거리 추가 요금</span>
        <span>{formatPrice(details.distance_fee)}원</span>
      </PriceRow>
      <PriceRow>
        <span>층수 추가 요금</span>
        <span>{formatPrice(details.floor_fee)}원</span>
      </PriceRow>
      {details.special_fee > 0 && (
        <PriceRow>
          <span>특수 서비스 요금</span>
          <span>{formatPrice(details.special_fee)}원</span>
        </PriceRow>
      )}
      {details.discount_amount > 0 && (
        <PriceRow className="discount">
          <span>할인</span>
          <span>-{formatPrice(details.discount_amount)}원</span>
        </PriceRow>
      )}
      <PriceRow className="total">
        <span>최종 금액</span>
        <span>{formatPrice(details.final_price)}원</span>
      </PriceRow>
    </PriceDetailsContainer>
  );
}; 