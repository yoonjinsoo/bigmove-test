import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { COLORS } from '../constants/colors';

const HeroContainer = styled.section`
  height: 50vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 180px 40px 20px;
`;

const HeroTitle = styled.h1`
  font-size: 2.875rem;
  margin-bottom: 2rem;
  word-break: keep-all;
  line-height: 1.3;
  width: 100%;
  max-width: 800px;
`;

const HeroSubtitle = styled.p`
  font-size: 1.32rem;
  margin-bottom: 1.5rem;
  color: ${COLORS.lightGray};
  word-break: keep-all;
  line-height: 1.5;
  width: 100%;
  max-width: 600px;
`;

const CTAButton = styled(Link)`
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
