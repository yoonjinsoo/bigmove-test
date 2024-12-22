import React from 'react';
import styled from 'styled-components';
import { COLORS } from '../constants/colors';

const HowItWorksContainer = styled.section`
  margin-top: 4rem;
  padding: 4rem 2rem;
  background-color: var(--dark-gray);
  color: var(--cyan);
  text-align: center;
`;

const HowItWorksTitle = styled.h2`
  font-size: 2.5rem;
  margin: 0 auto 2rem;
  word-break: keep-all;
  line-height: 1.3;
  width: 100%;
  max-width: 800px;
  text-align: center;
`;

const HowItWorksDescription = styled.p`
  font-size: 1.2rem;
  margin: 0 auto 3rem;
  color: ${COLORS.lightGray};
  word-break: keep-all;
  line-height: 1.5;
  width: 100%;
  max-width: 600px;
  text-align: center;
`;

const ProcessList = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
`;

const ProcessItem = styled.div`
  flex-basis: calc(25% - 2rem);
  text-align: center;
`;

const ProcessIcon = styled.i`
  font-size: 3rem;
  margin-bottom: 1rem;
  color: ${COLORS.primary};
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

const ProcessTitle = styled.h4`
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: var(--cyan);
  word-break: keep-all;
  line-height: 1.3;
  text-align: center;
`;

const ProcessDescription = styled.p`
  font-size: 1rem;
  color: ${COLORS.lightGray};
  word-break: keep-all;
  line-height: 1.5;
  text-align: center;
`;

const PROCESSES = [
  { 
    icon: 'fas fa-box', 
    title: '물품 선택', 
    description: '이동할 물품을 선택하세요' 
  },
  {
    icon: 'fas fa-calendar-alt',
    title: '날짜 선택',
    description: '원하는 이동 날짜를 선택하세요',
  },
  { 
    icon: 'fas fa-calculator', 
    title: '견적 확인', 
    description: '정확한 견적을 즉시 확인하세요' 
  },
  {
    icon: 'fas fa-check-circle',
    title: '결제 완료',
    description: '간편결제하고 서비스를 이용하세요',
  },
] as const;

const HowItWorksSection: React.FC = () => {
  return (
    <HowItWorksContainer>
      <HowItWorksTitle>가장 완벽한 선택까지 1분</HowItWorksTitle>
      <HowItWorksDescription>
        빅무브(BigMove)로 배송비와 시간을 동시에 아껴보세요.
      </HowItWorksDescription>
      <ProcessList>
        {PROCESSES.map((process, index) => (
          <ProcessItem key={index}>
            <ProcessIcon className={process.icon} />
            <ProcessTitle>{process.title}</ProcessTitle>
            <ProcessDescription>{process.description}</ProcessDescription>
          </ProcessItem>
        ))}
      </ProcessList>
    </HowItWorksContainer>
  );
};

export default HowItWorksSection;
