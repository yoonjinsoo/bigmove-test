import styled from 'styled-components';

export const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
`;

export const Title = styled.h2`
  color: var(--cyan);
  font-size: 2rem;
  text-align: center;
  margin-bottom: 2rem;
`;

export const SummaryCard = styled.div`
  background: var(--dark-gray);
  border: 1px solid var(--cyan);
  border-radius: 12px;
  padding: 2rem;
  margin: 2rem 0;
`;

export const SummaryItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid var(--gray);

  &:last-child {
    border-bottom: none;
  }
`;

export const Label = styled.span`
  color: var(--text-light);
  font-size: 1.1rem;
`;

export const Value = styled.span`
  color: var(--cyan);
  font-size: 1.1rem;
  font-weight: bold;
`;

export const TotalPrice = styled.div`
  text-align: right;
  margin-top: 2rem;
  font-size: 1.5rem;
  color: var(--cyan);
  font-weight: bold;
`;

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
  padding: 0 5rem;

  @media (max-width: 768px) {
    padding: 0 2rem;
  }
`;

export const Button = styled.button<{ primary?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border: 1px solid var(--cyan);
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.1rem;
  background: ${props => props.disabled ? 'var(--mediumGray)' : props.primary ? 'var(--cyan)' : 'none'};
  color: ${props => props.primary ? 'var(--dark)' : 'var(--cyan)'};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};

  &:hover {
    background: ${props => !props.disabled && props.primary ? 'var(--cyan-dark)' : 'none'};
  }
`;
