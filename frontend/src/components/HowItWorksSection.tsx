import React from 'react';
import { PROCESSES } from '../constants/processes';
import {
  HowItWorksContainer,
  HowItWorksTitle,
  HowItWorksDescription,
  ProcessList,
  ProcessItem,
  ProcessIcon,
  ProcessTitle,
  ProcessDescription
} from './styles/HowItWorksStyles';

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
