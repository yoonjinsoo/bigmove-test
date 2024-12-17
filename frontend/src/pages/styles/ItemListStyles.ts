import styled from 'styled-components';

export const StyledContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

export const Title = styled.h2`
  color: var(--cyan);
  font-size: 2rem;
  text-align: center;
  margin-bottom: 2rem;
`;

export const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: none;
  border: 1px solid var(--cyan);
  color: var(--cyan);
  border-radius: 4px;
  cursor: pointer;
  margin: 0 auto 2rem;  
  width: fit-content;  

  &:hover {
    background: var(--cyan-dark);
  }
`;

export const ItemGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 2rem;
  padding: 2rem;
  justify-content: center;  
  max-width: 1000px;  
  margin: 0 auto;  
`;

export const ItemCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  border: 1px solid var(--cyan);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  background: var(--dark-gray);
  margin: 0 auto;  
  width: 100%;  

  &:hover {
    transform: translateY(-5px);
    border-color: var(--cyan);
  }
`;

export const ItemIcon = styled.div`
  color: var(--cyan);
  font-size: 2.5rem;
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const ItemName = styled.h3`
  color: var(--light-gray);
  font-size: 1.1rem;
  text-align: center;
  margin: 0;
`;
