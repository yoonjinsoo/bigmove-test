import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Title } from './styles/SignUpStyles';
import { FaEnvelope, FaLock } from 'react-icons/fa';

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

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: var(--cyan);
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    font-size: 1.1rem;
  }
`;

const Input = styled.input<{ hasError?: boolean }>`
  width: 400px;
  max-width: 100%;
  padding: 0.7rem;
  border: 1px solid ${props => props.hasError ? '#ff6b6b' : '#333'};
  border-radius: 8px;
  font-size: 1rem;
  background-color: #2A2A2A;
  color: #F5F5F5;
  transition: all 0.2s ease-in-out;

  /* WebKit 브라우저에서 자동 배경색 변경 방지 */
  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus,
  &:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 30px #2A2A2A inset !important;
    -webkit-text-fill-color: #F5F5F5 !important;
  }

  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? '#ff6b6b' : '#40E0D0'};
    box-shadow: 0 0 0 2px ${props => props.hasError ? 'rgba(255, 107, 107, 0.2)' : 'rgba(64, 224, 208, 0.2)'} !important;
    background-color: #2A2A2A;
  }

  &::placeholder {
    color: #999;
  }

  &:disabled {
    background-color: #222222;
    color: #cccccc;
    cursor: not-allowed;
    opacity: 0.8;
  }
`;

const LoginPage: React.FC = () => {
  return (
    <LoginContainer>
      <StyledTitle>BigMove 로그인하기</StyledTitle>
      <StyledSignUpSection>
        <p>아직 회원이 아니신가요? <Link to="/signup">회원가입하기</Link></p>
      </StyledSignUpSection>

      <FormGroup>
        <Label htmlFor="email">
          <FaEnvelope />
          이메일
        </Label>
        <Input
          type="email"
          id="email"
          name="email"
          placeholder="이메일을 입력해주세요"
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="password">
          <FaLock />
          비밀번호
        </Label>
        <Input
          type="password"
          id="password"
          name="password"
          placeholder="비밀번호를 입력해주세요"
        />
      </FormGroup>

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