import React from 'react';
import styled from 'styled-components';

interface LoadingProgressProps {
  message: string;
  progress?: number;
}

const LoadingContainer = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.7);
  padding: 20px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  z-index: 1000;
`;

const Spinner = styled.div`
  border: 3px solid rgba(79, 209, 197, 0.1);
  border-left-color: var(--cyan);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Message = styled.div`
  color: var(--cyan);
  font-size: 0.9rem;
`;

export const LoadingProgress: React.FC<LoadingProgressProps> = ({ message, progress }) => (
  <LoadingContainer>
    <Spinner />
    <Message>
      {message}
      {progress && ` (${progress}%)`}
    </Message>
  </LoadingContainer>
); 