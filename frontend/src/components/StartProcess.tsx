import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const StartContainer = styled.div`
  background-color: var(--dark-gray);
  padding: 3rem 2rem;
  text-align: center;
`;

const Title = styled.h2`
  color: var(--cyan);
  font-size: 2rem;
  margin-bottom: 2rem;
`;

const SubTitle = styled.p`
  color: #f5f5f1;
  font-size: 1.2rem;
  margin-bottom: 3rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 400px;
  margin: 0 auto;
`;

const Button = styled.button<{ primary?: boolean }>`
  padding: 1rem 2rem;
  border-radius: 8px;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  ${(props) =>
    props.primary
      ? `
    background-color: var(--cyan);
    color: var(--dark-gray);
    &:hover {
      background-color: #45B7A0;
    }
  `
      : `
    background-color: transparent;
    color: #F5F5F1;
    border: 1px solid #F5F5F1;
    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  `}
`;

const Benefit = styled.p`
  color: #ff6b6b;
  font-size: 0.9rem;
  margin-top: 2rem;
`;

const StartProcess: React.FC = () => {
  const navigate = useNavigate();

  const handleSignUp = () => {
    navigate('/signup');
  };

  const handleSkip = () => {
    sessionStorage.setItem('isGuest', 'true');
    navigate('/items');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <StartContainer>
      <Title>BigMove와 함께 시작하세요</Title>
      <SubTitle>회원가입하고 다양한 혜택을 받아보세요</SubTitle>

      <ButtonGroup>
        <Button primary onClick={handleSignUp}>
          회원가입하고 시작하기
        </Button>
        <Button onClick={handleLogin}>로그인</Button>
        <Button onClick={handleSkip}>로그인 없이 진행하기</Button>
      </ButtonGroup>

      <Benefit>지금 회원가입하면 10,000원 할인 쿠폰 즉시 지급!</Benefit>
    </StartContainer>
  );
};

export default StartProcess;
