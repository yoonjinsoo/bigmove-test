import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdArrowForward } from 'react-icons/md';
import ProgressBar from '../components/common/ProgressBar';
import { LoadingProgress } from '../components/common/LoadingProgress';
import { useSelectionValidation } from '../hooks/useSelectionValidation';
import { useSelectionNavigation } from '../hooks/useSelectionNavigation';
import { calculateBasePrice, formatPrice } from '../utils/priceCalculator';
import {
  Container,
  Title,
  SummaryCard,
  SummaryItem,
  Label,
  Value,
  TotalPrice,
  ButtonContainer,
  Button
} from '../pages/styles/SelectionSummaryStyles';

const SelectionSummaryPage: React.FC = () => {
  const navigate = useNavigate();
  const progressBarRef = React.useRef<HTMLDivElement>(null);
  const { selectedCategory, selectedItem, selectedDetail } = useSelectionValidation();
  const { handleBack, handleDeliveryDateClick } = useSelectionNavigation();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    if (!selectedCategory || !selectedItem || !selectedDetail) {
      navigate(-1);
    }
  }, [selectedCategory, selectedItem, selectedDetail, navigate]);

  if (!selectedCategory || !selectedItem || !selectedDetail) {
    return null;
  }

  const basePrice = calculateBasePrice(selectedItem, selectedDetail);

  const handleNext = () => {
    setIsNavigating(true);
    
    setTimeout(() => {
      handleDeliveryDateClick(selectedCategory, selectedItem, selectedDetail);
    }, 500);
  };

  return (
    <div className="step-container">
      <div className="step-progress-bar">
        <ProgressBar ref={progressBarRef} currentStep={4} totalSteps={8} />
      </div>
      <h1 className="step-title">선택 내역 확인</h1>

      <SummaryCard>
        <SummaryItem>
          <Label>카테고리</Label>
          <Value>{selectedCategory.name}</Value>
        </SummaryItem>
        <SummaryItem>
          <Label>선택 상품</Label>
          <Value>{selectedItem.name}</Value>
        </SummaryItem>
        <SummaryItem>
          <Label>상세 옵션</Label>
          <Value>{selectedDetail.name}</Value>
        </SummaryItem>
        <SummaryItem>
          <Label>상품 설명</Label>
          <Value>{selectedDetail.description}</Value>
        </SummaryItem>
        <TotalPrice>기본 가격: {formatPrice(basePrice)}</TotalPrice>
      </SummaryCard>

      <ButtonContainer>
        <Button onClick={handleBack}>
          <MdArrowBack size={16} aria-hidden="true" /> 이전으로
        </Button>
        <Button primary onClick={handleNext}>
          배송 날짜 선택 <MdArrowForward size={16} aria-hidden="true" />
        </Button>
      </ButtonContainer>
      {isNavigating && (
        <LoadingProgress 
          message="배송 날짜 선택 페이지로 이동하고 있습니다..." 
        />
      )}
    </div>
  );
};

export default SelectionSummaryPage;
