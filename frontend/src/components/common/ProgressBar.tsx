import React from 'react';
import styled from 'styled-components';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(({
  currentStep,
  totalSteps
}, ref) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <ProgressBarContainer ref={ref}>
      <Progress width={progress} />
    </ProgressBarContainer>
  );
});

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 8px;
  background-color: #666;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 80px;
`;

const Progress = styled.div<{ width: number }>`
  width: ${props => props.width}%;
  height: 100%;
  background: linear-gradient(90deg, var(--cyan) 0%, var(--cyan) 100%);
  transition: width 0.3s ease-in-out;
`;

ProgressBar.displayName = 'ProgressBar';

export default ProgressBar;
