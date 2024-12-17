import React from 'react';
import styled from 'styled-components';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import HowItWorksSection from './HowItWorksSection';
import TestimonialsSection from './TestimonialsSection';

const MainContainer = styled.main`
  background-color: var(--dark-gray);
  min-height: 100vh;
`;

const MainContent: React.FC = () => {
  return (
    <MainContainer>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
    </MainContainer>
  );
};

export default MainContent;
