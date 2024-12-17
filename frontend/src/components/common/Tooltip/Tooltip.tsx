import React from 'react';
import styled from 'styled-components';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

const TooltipContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const TooltipContent = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.5rem;
  background-color: var(--dark-gray);
  color: var(--text);
  border-radius: 4px;
  font-size: 0.875rem;
  white-space: nowrap;
  z-index: 1000;

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-width: 5px;
    border-style: solid;
    border-color: var(--dark-gray) transparent transparent transparent;
  }
`;

const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  return (
    <TooltipContainer>
      {children}
      <TooltipContent>{content}</TooltipContent>
    </TooltipContainer>
  );
};

export default Tooltip;
