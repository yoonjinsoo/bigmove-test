import React from 'react';
import {
  HeroContainer,
  HeroTitle,
  HeroSubtitle,
  CTAButton
} from './styles/HeroStyles';
import { useAuthStore } from '../store/authStore';

const HeroSection: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  
  return (
    <HeroContainer className="hero bg-dark-gray text-cyan">
      <HeroTitle>대형 물품 배송의 새로운 기준</HeroTitle>
      <HeroSubtitle>국내 최초 이형화물 전문 배송 서비스</HeroSubtitle>
      <HeroSubtitle>중고거래도 안전하게, 복잡한 절차 없이</HeroSubtitle>
      <CTAButton to={isAuthenticated ? "/items" : "/login"}>
        {isAuthenticated ? "서비스 시작하기" : "지금 시작하기"}
      </CTAButton>
    </HeroContainer>
  );
};

export default HeroSection;
