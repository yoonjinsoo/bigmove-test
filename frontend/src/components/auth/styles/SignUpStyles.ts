import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const SignUpContainer = styled.div`
  max-width: 480px;
  margin: 6rem auto 0;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  background: var(--dark-gray);

  .coupon-banner {
    padding: 16px;
    width: 65%;
    margin: 0 auto;
    margin-bottom: 1rem;
    
    .coupon {
      background: #1a5f9e;
      border-radius: 12px;
      position: relative;
      display: flex;
      color: white;
      animation: pulse 2s infinite;

      @keyframes pulse {
        0% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.05);
        }
        100% {
          transform: scale(1);
        }
      }

      &::before, &::after {
        content: '';
        position: absolute;
        width: 24px;
        height: 24px;
        background: #1E1E1E;
        border-radius: 50%;
        top: 50%;
        transform: translateY(-50%);
      }
      
      &::before {
        left: -12px;
      }
      
      &::after {
        right: -12px;
      }

      .coupon-left {
        width: 30%;
        border-right: 2px dashed rgba(255, 255, 255, 0.3);
        padding: 14px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-size: 1.1rem;
        font-weight: 700;
        gap: 4px;
      }

      .coupon-right {
        width: 70%;
        padding: 14px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        background: white;
        border-top-right-radius: 12px;
        border-bottom-right-radius: 12px;

        .amount {
          font-size: 1.3rem;
          font-weight: 700;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          gap: 4px;
          color: #000;

          .won {
            font-size: 1rem;
          }
        }

        .description {
          font-size: 0.75rem;
          opacity: 0.9;
          color: #000;
        }
      }
    }
  }
`;

export const Title = styled.h1`
  color: #40E0D0;
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 0rem;

  span {
    color: #40E0D0;
  }
`;

export const SubTitle = styled.h2`
  color: #999;
  font-size: 0.9rem;
  text-align: center;
  margin-bottom: 3rem;
  font-weight: 400;

  a {
    color: #40E0D0;
    text-decoration: none;
    margin-left: 0.5rem;

    &:hover {
      text-decoration: underline;
    }
  }
`;

export const Button = styled.button`
  width: 80%;
  padding: 0.8rem;
  margin: 0 auto 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1rem;
  transform: scale(1);
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: scale(1.02);
  }

  &.primary {
    background: #3498db;
    color: white;
    border: none;
    padding: 1.1rem;
    font-size: 1.2rem;

    &:hover {
      background: #2980b9;
      transform: scale(1.02);
    }
  }
`;

export const Divider = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  margin: 0.5rem auto 1rem;
  width: 80%;

  &::before,
  &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid #ddd;
  }

  span {
    padding: 0 0.6rem;
    color: #f5f5f5;
    font-size: 1rem;
  }
`;

export const LoginLink = styled(Link)`
  text-decoration: none;
  color: #2980b9;

  &:hover {
    text-decoration: underline;
  }
`;

export const LoginSection = styled.div`
  width: 80%;
  margin: 0.5rem auto;
  padding-top: 1rem;
  border-top: 1px solid #ddd;
  text-align: center;
  
  span {
    margin-right: 3rem;
    color: #666;
  }
`;

export const SkipLoginButton = styled(Link)`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 2rem;
  margin-bottom: 3rem;
  text-decoration: none;
  color: #4ECDC4;
  font-size: 1.1rem;

  &:hover {
    transform: scale(1.02);
  }
`;

export const SocialButton = styled(Button)`
  color: #495057;
  border-radius: 50px;
  font-size: 0.9rem;
  
  &.naver {
    background: #03C75A;
    color: white;
    border: none;
  }

  &.kakao {
    background: #FEE500;
    color: #000000;
    border: none;
  }
  
  svg {
    margin-right: 8px;
  }
`;

export const FormGroup = styled.div`
  margin-bottom: 1rem;
  width: 100%;

  &:first-of-type {
    margin-top: 1rem;
  }
`;

export const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  color: #666;
  font-size: 0.9rem;
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
  }

  @media (max-width: 480px) {
    font-size: 0.75rem;
  }
  
  svg {
    color: #4ECDC4;
    font-size: 1.2rem;
  }
`;

export const Input = styled.input<{ hasError?: boolean }>`
  width: 100%;
  padding: 1rem;
  border: 1px solid ${props => props.hasError ? '#ff6b6b' : '#ddd'};
  border-radius: 8px;
  font-size: 1rem;
  background-color: white;

  &:focus {
    outline: none;
    border-color: #4ECDC4;
    box-shadow: 0 0 0 1px #4ECDC4;
  }

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }

  &::placeholder {
    color: #999;
  }
`;

export const DisabledInput = styled(Input)`
  background-color: #f5f5f5;
  cursor: not-allowed;
  color: #666;

  &:focus {
    border-color: #4ECDC4;
    box-shadow: 0 0 0 1px #4ECDC4;
  }
`;

export const FormWrapper = styled.div`
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem;
`;

export const StyledTitle = styled.h1`
  color: #4ECDC4;
  text-align: center;
  width: 100%;
  margin-bottom: 1.5rem;
  font-size: 2rem;
  font-weight: 700;
`;

export const StyledSubTitle = styled.h2`
  color: #999;
  font-size: 1rem;
  margin-bottom: -0.5rem;
  text-align: center;
  font-weight: 400;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const ErrorMessage = styled.span`
  color: #ff6b6b;
  font-size: 0.85rem;
  margin-top: 0.3rem;
`;