import styled from 'styled-components';

export const Title = styled.h1`
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
`;

export const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  background: none;
  cursor: pointer;
  color: #666;
  font-size: 16px;

  &:hover {
    color: #333;
  }
`;

export const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

export const DetailCard = styled.div`
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

export const DetailName = styled.h3`
  font-size: 18px;
  margin-bottom: 8px;
`;

export const DetailDescription = styled.p`
  color: #666;
  font-size: 14px;
  margin-bottom: 12px;
`;

export const DetailPrice = styled.p`
  font-size: 20px;
  font-weight: bold;
  color: #2c5282;
`;

export const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 60px;
  padding: 40px 0;

  .category-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 80px;
    max-width: 800px;
    margin: 0 auto;
  }
`;

export const CategoryItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
  
  img {
    width: 64px;
    height: 64px;
    margin-bottom: 16px;
  }

  span {
    color: var(--cyan);
    font-size: 18px;
  }
`;
