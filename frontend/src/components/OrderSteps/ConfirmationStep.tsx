import React, { useMemo } from 'react';
import styled from 'styled-components';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import ProgressBar from '../common/ProgressBar';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
`;

const Title = styled.h2`
  color: var(--cyan);
  font-size: 2rem;
  text-align: center;
  margin-bottom: 2rem;
`;

const SummaryCard = styled.div`
  background-color: var(--dark-gray);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
`;

const SummarySection = styled.div`
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h3`
  color: var(--cyan);
  font-size: 1.2rem;
  margin-bottom: 1rem;
`;

const ItemList = styled.ul`
  list-style: none;
  padding: 0;
`;

const ItemRow = styled.li`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const AddressInfo = styled.div`
  background-color: rgba(255, 255, 255, 0.05);
  padding: 1rem;
  border-radius: 8px;
  margin: 0.5rem 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
`;

const Button = styled.button<{ primary?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  background-color: ${(props) => (props.primary ? 'var(--cyan)' : '#666')};
  color: white;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

interface OrderItem {
  name: string;
  quantity: number;
}

interface ConfirmationStepProps {
  userId: string;
  items: OrderItem[];
  fromAddress: string;
  toAddress: string;
  handleSubmit: () => void;
  prevStep: () => void;
}

const ConfirmationStep: React.FC<ConfirmationStepProps> = React.memo(
  ({ userId, items, fromAddress, toAddress, handleSubmit, prevStep }) => {
    const itemList = useMemo(
      () =>
        items.map((item, index) => (
          <ItemRow key={`item-${index}`}>
            <span>{item.name}</span>
            <span>{item.quantity}개</span>
          </ItemRow>
        )),
      [items]
    );

    return (
      <Container>
        <ProgressBar currentStep={8} totalSteps={9} />
        <Title>주문 확인</Title>

        <SummaryCard>
          <SummarySection>
            <SectionTitle>주문자 정보</SectionTitle>
            <AddressInfo>사용자 ID: {userId}</AddressInfo>
          </SummarySection>

          <SummarySection>
            <SectionTitle>주문 항목</SectionTitle>
            <ItemList>{itemList}</ItemList>
          </SummarySection>

          <SummarySection>
            <SectionTitle>배송 정보</SectionTitle>
            <AddressInfo>출발 주소: {fromAddress}</AddressInfo>
            <AddressInfo>도착 주소: {toAddress}</AddressInfo>
          </SummarySection>
        </SummaryCard>

        <ButtonGroup>
          <Button onClick={prevStep}>
            <FaArrowLeft />
            이전 단계
          </Button>
          <Button primary onClick={handleSubmit}>
            최종 가격 보러가기
            <FaArrowRight />
          </Button>
        </ButtonGroup>
      </Container>
    );
  }
);

ConfirmationStep.displayName = 'ConfirmationStep';

export default ConfirmationStep;
