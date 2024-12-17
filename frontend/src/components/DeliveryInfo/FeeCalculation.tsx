import React from 'react';
import styled from 'styled-components';

const FeeContainer = styled.div`
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  margin-top: 1rem;
`;

const FeeItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  
  &.total {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border-color);
    font-weight: bold;
  }
`;

interface FeeCalculationProps {
  totalDistance: number;
  baseDistance: number;
  extraDistance: number;
  extraFee: number;
  totalFee: number;
}

export const FeeCalculation: React.FC<FeeCalculationProps> = ({
  totalDistance,
  baseDistance,
  extraDistance,
  extraFee,
  totalFee
}) => {
  return (
    <FeeContainer>
      <h3>배송 요금 정보</h3>
      
      <FeeItem>
        <span>총 이동거리:</span>
        <span>{totalDistance.toFixed(1)}km</span>
      </FeeItem>
      
      <FeeItem>
        <span>기본 거리:</span>
        <span>{baseDistance}km</span>
      </FeeItem>
      
      {extraDistance > 0 && (
        <>
          <FeeItem>
            <span>추가 거리:</span>
            <span>{extraDistance.toFixed(1)}km</span>
          </FeeItem>
          
          <FeeItem>
            <span>거리 추가 요금:</span>
            <span>{extraFee.toLocaleString()}원</span>
          </FeeItem>
        </>
      )}
      
      <FeeItem className="total">
        <span>총 요금:</span>
        <span>{totalFee.toLocaleString()}원</span>
      </FeeItem>
    </FeeContainer>
  );
}; 