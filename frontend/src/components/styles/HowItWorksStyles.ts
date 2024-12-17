import styled from 'styled-components';
import { COLORS } from '../../constants/colors';

export const HowItWorksContainer = styled.section`
  margin-top: 4rem;
  padding: 4rem 2rem;
  background-color: var(--dark-gray);
  color: var(--cyan);
  text-align: center;
`;

export const HowItWorksTitle = styled.h2`
  font-size: 2.5rem;
  margin-bottom: 2rem;
`;

export const HowItWorksDescription = styled.p`
  font-size: 1.2rem;
  max-width: 800px;
  margin: 0 auto 3rem;
  color: ${COLORS.lightGray};
`;

export const ProcessList = styled.div`
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

export const ProcessItem = styled.div`
  flex-basis: calc(25% - 2rem);
  text-align: center;
`;

export const ProcessIcon = styled.i`
  font-size: 3rem;
  margin-bottom: 1rem;
  color: ${COLORS.primary};
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

export const ProcessTitle = styled.h4`
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: var(--cyan);
`;

export const ProcessDescription = styled.p`
  font-size: 1rem;
  color: ${COLORS.lightGray};
`;
