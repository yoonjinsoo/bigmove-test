import React from 'react';
import styled from 'styled-components';
import { animated, useTrail } from '@react-spring/web';

const FeaturesSectionContainer = styled.section`
  margin-top: 6rem; // 상단 여백 추가
  text-align: center;
  padding: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  color: var(--cyan);
  margin-bottom: 1rem;
`;

const SectionSubtitle = styled.p`
  font-size: 1.2rem;
  color: #f5f5f5;
  margin-bottom: 3rem;
`;

const FeatureList = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const FeatureCardWrapper = styled.div`
  width: 100%;
  height: 400px;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);

  &:hover {
    transform: translateY(-10px) scale(1.03);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
  }
`;

const FeatureCard = styled(animated.div)`
  background: rgba(47, 73, 94, 0.6);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;
`;

const ImageWrapper = styled.div`
  width: 100%;
  height: 100%; // 이미지 영역을 전체의 65%로 설정
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const TextContent = styled.div`
  flex: 1;
  padding: 0.5rem 1rem 1.5rem; // 상단 패딩을 줄이고 하단 패딩을 늘림
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start; // 시작 지점부터 정렬하도록 변경
  text-align: center;

  h3 {
    margin-top: 0.5rem; // 상단 여백 추가
    margin-bottom: 0.4rem;
    font-size: 1.25rem;
    color: #4ae4ca;
  }

  p {
    margin: 0;
    font-size: 0.9rem;
    line-height: 1.3;
    color: #f5f5f5;
    opacity: 0.8;
  }
`;

const IMAGE_PATHS = {
  CUSTOM_QUOTE: '/images/features/publicimagesfeaturescustomquote.jpg', // 's' 하나 제거
  PACKING_SERVICE: '/images/features/publicimagesfeaturespackingservice.jpg',
  SAFE_DELIVERY: '/images/features/publicimagesfeaturessafedelivery.jpg',
  TRACKING_SERVICE: '/images/features/publicimagesfeaturestrackingservice.jpg', // 's' 하나 제거
} as const;

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: IMAGE_PATHS.CUSTOM_QUOTE,
      title: '맞춤형 견적',
      description: '고객의 요구에 맞는 정확한 견적 제공',
    },
    {
      icon: IMAGE_PATHS.PACKING_SERVICE,
      title: '전문 포장 서비스',
      description: '전문가가 직접 포장부터 배송까지',
    },
    {
      icon: IMAGE_PATHS.SAFE_DELIVERY,
      title: '안전한 운송',
      description: '숙련된 전문가에 의한 안전한 운송',
    },
    {
      icon: IMAGE_PATHS.TRACKING_SERVICE,
      title: '실시간 배송 추적',
      description: '실시간으로 배송 현황을 확인',
    },
  ];

  const trail = useTrail(4, {
    from: { opacity: 0, y: 100 },
    to: { opacity: 1, y: 0 },
    config: {
      tension: 200,
      friction: 10,
      mass: 1,
      duration: 500,
    },
  });

  return (
    <FeaturesSectionContainer>
      <SectionTitle>BigMove만의 특장점</SectionTitle>
      <SectionSubtitle>대형 물품 이동의 새로운 기준을 만나보세요</SectionSubtitle>
      <FeatureList>
        {trail.map((props, index) => (
          <FeatureCardWrapper key={index}>
            <FeatureCard
              style={{
                ...props,
                transform: props.y.to((y) => `translate3d(0,${y}px,0)`),
              }}
            >
              <ImageWrapper>
                <img src={features[index].icon} alt={features[index].title} />
              </ImageWrapper>
              <TextContent>
                <h3>{features[index].title}</h3>
                <p>{features[index].description}</p>
              </TextContent>
            </FeatureCard>
          </FeatureCardWrapper>
        ))}
      </FeatureList>
    </FeaturesSectionContainer>
  );
};

export default FeaturesSection;
