import React from 'react';
import { useNavigate } from 'react-router-dom';
import { deliveryService } from '../../services/deliveryService';
import { Container, Title, ButtonGroup, Button } from '../common/styles/common';
import { FaArrowRight } from 'react-icons/fa';

const SelectionConfirm: React.FC = () => {
  const navigate = useNavigate();

  const handleDateSelection = async () => {
    try {
      const timeSlotData = await deliveryService.getAllTimeSlots();
      navigate('/date-selection', {
        state: { timeSlotData },
      });
    } catch (err) {
      console.error('Failed to fetch time slots:', err);
      // 에러는 콘솔에만 기록하고 UI에는 표시하지 않음
      navigate('/date-selection');
    }
  };

  return (
    <Container>
      <Title>선택 내역 확인</Title>
      {/* 기존 선택 내역 표시 컴포넌트들 */}
      <ButtonGroup>
        <Button primary onClick={handleDateSelection}>
          배송 날짜 선택
          <FaArrowRight />
        </Button>
      </ButtonGroup>
    </Container>
  );
};

export default SelectionConfirm;
