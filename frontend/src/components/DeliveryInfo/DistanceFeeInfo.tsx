import React from 'react';
import styled from 'styled-components';

const InfoContainer = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: var(--darker-gray);
  border: 1px solid var(--cyan);
  border-radius: 4px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--gray);
  
  &:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
`;

const Label = styled.span`
  color: var(--light-gray);
`;

const Value = styled.span`
  color: var(--cyan);
  font-weight: bold;
`;

const TotalRow = styled(InfoRow)`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--cyan);
  font-size: 1.1rem;
`;

interface DistanceFeeInfoProps {
  distance: number;
  baseDistance: number;
  extraDistance: number;
  extraFee: number;
}

export const DistanceFeeInfo: React.FC<DistanceFeeInfoProps> = ({
  distance,
  baseDistance,
  extraDistance,
  extraFee
}) => {
  return (
    <InfoContainer>
      <InfoRow>
        <Label>총 이동거리</Label>
        <Value>{distance.toFixed(1)}km</Value>
      </InfoRow>
      
      <InfoRow>
        <Label>기본 거리</Label>
        <Value>{baseDistance}km</Value>
      </InfoRow>
      
      {extraDistance > 0 && (
        <>
          <InfoRow>
            <Label>추가 거리</Label>
            <Value>{extraDistance.toFixed(1)}km</Value>
          </InfoRow>
          
          <InfoRow>
            <Label>거리 추가 요금</Label>
            <Value>+ {extraFee.toLocaleString()}원</Value>
          </InfoRow>
        </>
      )}
      
      <TotalRow>
        <Label>총 추가 요금</Label>
        <Value>{extraFee.toLocaleString()}원</Value>
      </TotalRow>
    </InfoContainer>
  );
}; 