import styled from 'styled-components';

export const PriceDetailsContainer = styled.div`
  padding: 20px;
  border-radius: 8px;
  background-color: #f8f9fa;
  margin-top: 20px;
`;

export const PriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 8px 0;
  padding: 4px 0;

  &.total {
    border-top: 2px solid #dee2e6;
    margin-top: 16px;
    padding-top: 16px;
    font-weight: bold;
  }

  &.discount {
    color: #dc3545;
  }
`;

export const Title = styled.h3`
  margin-bottom: 16px;
  font-size: 1.2rem;
  font-weight: bold;
`; 