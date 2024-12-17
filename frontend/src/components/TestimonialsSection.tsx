import React from 'react';
import styled, { keyframes } from 'styled-components';

const slideAnimation = keyframes`
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
`;

const TestimonialsContainer = styled.section`
  margin-top: 3rem; // 상단 여백 추가
  padding: 4rem 2rem 15rem 2rem; // bottom padding만 10rem으로 수정
  background-color: var(--dark-gray);
  color: var(--cyan);
  text-align: center;
  overflow: hidden; // 슬라이드 애니메이션을 위해 필요
`;

const TestimonialsList = styled.div`
  display: flex;
  width: fit-content;
  animation: ${slideAnimation} 150s linear infinite;
  &:hover {
    animation-play-state: paused;
  }
`;

const Testimonial = styled.div`
  flex: 0 0 auto;
  width: 300px;
  margin: 0 1rem;
  padding: 2rem;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  text-align: left;
`;

const TestimonialsTitle = styled.h2`
  font-size: 2.5rem;
  margin-bottom: 1rem;
`;

const TestimonialsSubtitle = styled.p`
  font-size: 1.2rem;
  margin-bottom: 3rem;
  color: #ecf0f1;
`;

const Comment = styled.p`
  font-size: 1rem;
  color: #ecf0f1;
  margin-bottom: 1rem;
  line-height: 1.6;
`;

const CustomerInfo = styled.div`
  color: var(--cyan);
  strong {
    display: block;
    margin-bottom: 0.5rem;
  }
  p {
    font-size: 0.9rem;
    color: #ecf0f1;
  }
`;

const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      name: '김○○ 고객님',
      type: '침대 이동',
      comment:
        '중고나라에서 산 퀸사이즈 침대를 배송받았어요. 무거운 침대라 걱정했는데 기사님들이 안전하게 옮겨주셨습니다!',
    },
    {
      name: '이○○ 고객님',
      type: '냉장고 이동',
      comment:
        '당근마켓에서 구매한 4도어 냉장고 배송이었어요. 계단이 많아서 걱정했는데 전문가분들이 안전하게 운반해주셨습니다.',
    },
    {
      name: '박○○ 고객님',
      type: '소파 이동',
      comment:
        '중고로 산 3인용 가죽소파 배송했는데, 문이 좁아서 걱정했지만 기사님들이 알아서 잘 해결해주셨어요.',
    },
    {
      name: '정○○ 고객님',
      type: '세탁기 이동',
      comment: '번개장터에서 산 드럼세탁기 옮겼는데, 가격도 합리적이고 서비스도 훌륭했습니다.',
    },
    {
      name: '최○○ 고객님',
      type: '냉장고 이동',
      comment:
        '중고 양문형 냉장고 배송받았는데, 기사님들 너무 친절하시고 전문적으로 잘 옮겨주셨어요.',
    },
    {
      name: '강○○ 고객님',
      type: '안마의자 이동',
      comment: '중고로 구매한 안마의자 배송이었는데, 무게가 상당했지만 안전하게 잘 옮겨주셨습니다.',
    },
    {
      name: '조○○ 고객님',
      type: '공기청정기 이동',
      comment:
        '당근마켓에서 산 대형 공기청정기 이동했어요. 기사님들이 신속하고 안전하게 처리해주셨습니다.',
    },
    {
      name: '윤○○ 고객님',
      type: '세탁기 이동',
      comment: '중고 세탁기 배송 받았는데, 기존 세탁기 철거부터 깔끔하게 처리해주셨어요.',
    },
    {
      name: '장○○ 고객님',
      type: '소파 이동',
      comment:
        '번개장터에서 산 4인용 소파 배송받았어요. 계단이 많았는데도 안전하게 옮겨주셨습니다.',
    },
    {
      name: '임○○ 고객님',
      type: '냉장고 이동',
      comment: '중고나라에서 산 대형 냉장고 이사였는데, 전문가다운 모습에 정말 안심이 되었어요.',
    },
    {
      name: '한○○ 고객님',
      type: '건조기 이동',
      comment: '중고 건조기 배송받았는데, 시간 약속도 잘 지키시고 안전하게 배송해주셨습니다.',
    },
    {
      name: '신○○ 고객님',
      type: '침대 이동',
      comment: '당근마켓에서 구매한 침대 프레임 배송이었는데, 문이 좁았지만 잘 해결해주셨어요.',
    },
    {
      name: '오○○ 고객님',
      type: '안마의자 이동',
      comment: '중고 안마의자 이동했는데, 무거운 물건인데도 신속하고 안전하게 처리해주셨어요.',
    },
    {
      name: '서○○ 고객님',
      type: '세탁기 이동',
      comment:
        '번개장터에서 산 세탁기 배송받았는데, 계단이 많아 걱정했지만 완벽하게 해결해주셨어요.',
    },
    {
      name: '황○○ 고객님',
      type: '건조기 이동',
      comment: '중고로 구매한 건조기 배송받았는데, 가격도 시간도 절약되어 좋았습니다.',
    },
  ];

  return (
    <TestimonialsContainer>
      <TestimonialsTitle>BigMove를 먼저 경험한 고객님의 후기</TestimonialsTitle>
      <TestimonialsSubtitle>지금 이 순간 고민을 빅무브와 함께 해결하세요</TestimonialsSubtitle>
      <TestimonialsList>
        {[...testimonials, ...testimonials, ...testimonials].map((testimonial, index) => (
          <Testimonial key={index}>
            <Comment>{testimonial.comment}</Comment>
            <CustomerInfo>
              <strong>{testimonial.name}</strong>
              <p>{testimonial.type}</p>
            </CustomerInfo>
          </Testimonial>
        ))}
      </TestimonialsList>
    </TestimonialsContainer>
  );
};

export default TestimonialsSection;
