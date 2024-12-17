import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '../components/common/ProgressBar';
import ServiceOptionsStep from '../components/OrderSteps/ServiceOptionsStep';
import { ButtonContainer, Button } from './styles/SelectionSummaryStyles';
import { MdArrowBack, MdArrowForward } from 'react-icons/md';

const ServiceOptionsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="step-container">
      <div className="step-progress-bar">
        <ProgressBar currentStep={6} totalSteps={8} />
      </div>
      <h1 className="step-title">서비스 옵션 선택</h1>
      <ServiceOptionsStep />
      <ButtonContainer>
        <Button onClick={() => navigate(-1)}>
          <MdArrowBack size={16} /> 이전으로
        </Button>
        <Button onClick={() => navigate('/order/summary')}>
          다음으로 <MdArrowForward size={16} />
        </Button>
      </ButtonContainer>
    </div>
  );
};

export default ServiceOptionsPage;