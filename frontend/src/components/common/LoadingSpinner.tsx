import React from 'react';
import styled, { keyframes } from 'styled-components';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
}

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinnerWrapper = styled.div<{ size: 'small' | 'medium' | 'large' }>`
  width: ${({ size }) =>
    ({
      small: '24px',
      medium: '40px',
      large: '56px',
    })[size]};
  height: ${({ size }) =>
    ({
      small: '24px',
      medium: '40px',
      large: '56px',
    })[size]};
  border: 3px solid var(--gray-200);
  border-top: 3px solid var(--cyan);
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'medium' }) => {
  return <SpinnerWrapper size={size} />;
};

export default LoadingSpinner;
