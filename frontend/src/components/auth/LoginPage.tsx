import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Title } from './styles/SignUpStyles';

const ErrorMessage = styled.div`
  color: #1a73e8;  // 구글 파란색으로 변경
  background-color: #e8f0fe;  // 밝은 파란색 배경
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
  font-weight: 500;
  border: 1px solid #4285f4;
`;

const LoginContainer = styled.div`
  max-width: 500px;
  margin: 80px auto 0;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StyledTitle = styled(Title)`
  text-align: center;
  width: 100%;
  margin-bottom: 1.5rem;
  font-size: 2rem;
`;

const Button = styled.button`
  width: 60%;
  padding: 0.8rem;
  margin: 0.3rem auto;
  border: none;
  border-radius: 8px;
  background: #3498db;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.05rem;
  transform: scale(1);
  transition: all 0.2s ease-in-out;

  &:hover {
    background: #2980b9;
    transform: scale(1.02);
  }
`;

const RememberMeWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
  
  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    background-color: #2A2A2A;
  }

  label {
    color: #999;
    font-size: 14px;
  }
`;

const StyledSignUpSection = styled.div`
  margin: 1rem 0;
  text-align: center;
  
  a {
    color: #3498db;
    text-decoration: none;
    margin-left: 0.5rem;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const LoginPage: React.FC = () => {
  return (
    <LoginContainer>
      <StyledTitle>BigMove 로그인하기</StyledTitle>
      <StyledSignUpSection>
        <p>아직 회원이 아니신가요? <Link to="/signup">회원가입하기</Link></p>
      </StyledSignUpSection>
      <RememberMeWrapper>
        <input
          type="checkbox"
          id="rememberMe"
        />
        <label htmlFor="rememberMe">로그인 정보 기억하기</label>
      </RememberMeWrapper>
      <Button type="submit">로그인</Button>
    </LoginContainer>
  );
};

export default LoginPage;