import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { COLORS } from '../../constants/colors';

export const HeroContainer = styled.section`
  height: 50vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 180px 40px 20px;
`;

export const HeroTitle = styled.h1`
  font-size: 2.875rem;
  margin-bottom: 2rem;
`;

export const HeroSubtitle = styled.p`
  font-size: 1.32rem;
  margin-bottom: 1.5rem;
  color: ${COLORS.lightGray};
`;

export const CTAButton = styled(Link)`
  margin-top: 2rem;
  padding: 1.2rem 2.5rem;
  font-size: 1.2rem;
  text-decoration: none;
  color: white;
  background-color: ${COLORS.primary};
  border-radius: 5px;
  transition: all 0.3s ease;

  &:hover {
    background-color: ${COLORS.primaryDark};
    transform: scale(1.05);
  }
`;
