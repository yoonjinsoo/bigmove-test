import React from 'react';
import styled from 'styled-components';

const ErrorContainer = styled.div`
  padding: 20px;
  margin: 20px 0;
  background-color: var(--dark-gray);
  border: 1px solid var(--red);
  border-radius: 4px;
  color: var(--red);
  text-align: center;
`;

interface ErrorMessageProps {
  message: string | null;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  if (!message) return null;
  return <ErrorContainer>{message}</ErrorContainer>;
};

export default ErrorMessage;
