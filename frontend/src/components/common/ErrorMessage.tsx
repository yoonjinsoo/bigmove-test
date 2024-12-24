import React from 'react';
import styled from 'styled-components';

const ErrorMessageWrapper = styled.div`
  white-space: pre-line;
  word-break: keep-all;
  word-wrap: break-word;
  text-align: center;
  background: transparent;
  color: var(--red);
  
  @media (max-width: 768px) {
    padding: 0 1rem;
    font-size: 0.9rem;
  }
`;

interface ErrorMessageProps {
  message: string | null;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  if (!message) return null;
  
  return <ErrorMessageWrapper>{message}</ErrorMessageWrapper>;
};

export default ErrorMessage;
