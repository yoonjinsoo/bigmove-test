import React from 'react';
import styled from 'styled-components';
import { FaInbox } from 'react-icons/fa';

const EmptyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: var(--gray);
  background-color: var(--dark-gray);
  border-radius: 8px;
  margin: 20px 0;
`;

const IconWrapper = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  color: var(--gray);
`;

const Message = styled.p`
  font-size: 16px;
  text-align: center;
`;

interface EmptyStateProps {
  message: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message }) => (
  <EmptyContainer>
    <IconWrapper>
      <FaInbox />
    </IconWrapper>
    <Message>{message}</Message>
  </EmptyContainer>
);

export default EmptyState;
