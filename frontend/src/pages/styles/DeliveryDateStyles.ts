import styled from 'styled-components';

export const PageContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

export const ContentContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  margin-top: 2rem;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

export const CalendarSection = styled.section`
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const OptionsSection = styled.section`
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  grid-column: 1 / -1;
  margin-top: 2rem;
`;

export const NextButton = styled.button<{ disabled: boolean }>`
  padding: 0.75rem 2rem;
  background-color: ${props => props.disabled ? '#ccc' : 'var(--primary-color)'};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  font-size: 1rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${props => props.disabled ? '#ccc' : 'var(--primary-color-dark)'};
  }
`;

export const DeliveryOptionItem = styled.div`
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--primary-color);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;
