import styled from 'styled-components';

export const Container = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
`;

export const Title = styled.h2`
  font-size: 24px;
  color: var(--cyan);
  margin-bottom: 20px;
  text-align: center;
`;

export const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-top: 24px;
`;

export const Button = styled.button<{ primary?: boolean }>`
  padding: 12px 24px;
  border-radius: 4px;
  border: none;
  background-color: ${(props) => (props.primary ? 'var(--cyan)' : '#6c757d')};
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    font-size: 14px;
  }
`;
