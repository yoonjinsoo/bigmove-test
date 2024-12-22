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
  margin: 0 auto 1rem;  // 상하좌우 마진 조정
  word-break: keep-all;
  line-height: 1.3;
  width: 100%;
  max-width: 800px;
  text-align: center;   // 텍스트 가운데 정렬
`;

const SectionSubtitle = styled.p`
  font-size: 1.2rem;
  color: #f5f5f5;
  margin: 0 auto 3rem;  // 상하좌우 마진 조정
  word-break: keep-all;
  line-height: 1.5;
  width: 100%;
  max-width: 600px;
  text-align: center;   // 텍스트 가운데 정렬
`;

const FeatureList = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;  // 좌우 여백 추가

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);  // 모바일에서도 2열 유지
    gap: 1rem;  // 간격 줄임
  }
`;

const FeatureCardWrapper = styled.div`
  width: 100%;
  height: auto;  // 높이를 자동으로
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);

  @media (max-width: 768px) {
    max-width: 400px;  // 모바일에서 최대 너비 제한
    margin: 0 auto;    // 가운데 정렬
  }
`;

const FeatureCard = styled(animated.div)`
  background: rgba(47, 73, 94, 0.6);
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 3/4;  // 카드 비율 고정
  display: flex;
  flex-direction: column;
`;

const ImageWrapper = styled.div`
  flex: 5;  // 이미지 영역이 2의 비중
  position: relative;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const TextContent = styled.div`
  flex: 1;  // 텍스트 영역이 1의 비중
  padding: 0.8rem;
  background: rgba(47, 73, 94, 0.6);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;

  h3 {
    font-size: clamp(0.9rem, 2.5vw, 1.25rem);  // 반응형 폰트 크기
    color: #4ae4ca;
    margin-bottom: 0.3rem;
  }

  p {
    font-size: clamp(0.7rem, 2vw, 0.9rem);  // 반응형 폰트 크기
    color: #f5f5f5;
    opacity: 0.8;
    line-height: 1.2;
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
