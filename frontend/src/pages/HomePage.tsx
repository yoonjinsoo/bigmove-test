import React from 'react';
import styled from 'styled-components';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import HowItWorksSection from '../components/HowItWorksSection';
import TestimonialsSection from '../components/TestimonialsSection';

const Container = styled.main`
  width: 100%;
  min-height: 100vh;
  padding-top: 80px; // Header 높이만큼 여백
`;

const HomePage: React.FC = () => {
  return (
    <Container>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
    </Container>
  );
};

export default HomePage;