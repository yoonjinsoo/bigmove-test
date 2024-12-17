import React from 'react';
import styled from 'styled-components';
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';

interface UserInfoInputsProps {
  formData: {
    email: string;
    password?: string;
    passwordConfirm?: string;
    name: string;
  };
  errors: {
    name: string;
    email: string;
    password?: string;
    passwordConfirm?: string;
  };
  passwordValidation?: {
    hasLength: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
    hasLetter: boolean;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showPasswordFields?: boolean;
  disabled?: {
    email?: boolean;
    name?: boolean;
  };
  helperText?: {
    email?: string;
    name?: string;
  };
}

const UserInfoInputs: React.FC<UserInfoInputsProps> = ({
  formData,
  errors,
  passwordValidation = {
    hasLength: false,
    hasNumber: false,
    hasSpecial: false,
    hasLetter: false
  },
  onChange,
  showPasswordFields = true,
  disabled,
  helperText,
}) => {
  return (
    <InputContainer>
      <FormGroup>
        <Label htmlFor="name">
          <FaUser />
          이름
        </Label>
        <Input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={onChange}
          hasError={!!errors.name}
          placeholder="이름을 입력해주세요"
        />
        {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
      </FormGroup>

      <FormGroup>
        <Label htmlFor="email">
          <FaEnvelope />
          이메일(아이디로 사용됩니다)
        </Label>
        <Input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={onChange}
          disabled={disabled?.email}
          hasError={!!errors.email}
          placeholder="이메일을 입력해주세요"
        />
        {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
        {helperText?.email && <HelperText>{helperText.email}</HelperText>}
      </FormGroup>

      {showPasswordFields && (
        <>
          <FormGroup>
            <Label htmlFor="password">
              <FaLock />
              비밀번호
            </Label>
            <Input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={onChange}
              hasError={!!errors.password}
              placeholder="비밀번호를 입력해주세요"
            />
            {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
            <ValidationContainer>
              <ValidationMessage isValid={passwordValidation?.hasLength}>
                8자 이상
              </ValidationMessage>
              <ValidationMessage isValid={passwordValidation?.hasLetter}>
                영문 포함
              </ValidationMessage>
              <ValidationMessage isValid={passwordValidation?.hasNumber}>
                숫자 포함
              </ValidationMessage>
              <ValidationMessage isValid={passwordValidation?.hasSpecial}>
                특수문자 포함
              </ValidationMessage>
            </ValidationContainer>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="passwordConfirm">
              <FaLock />
              비밀번호 확인
            </Label>
            <Input
              type="password"
              id="passwordConfirm"
              name="passwordConfirm"
              value={formData.passwordConfirm}
              onChange={onChange}
              hasError={!!errors.passwordConfirm}
              placeholder="비밀번호를 다시 입력해주세요"
            />
            {errors.passwordConfirm && <ErrorMessage>{errors.passwordConfirm}</ErrorMessage>}
          </FormGroup>
        </>
      )}
    </InputContainer>
  );
};

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 0 auto;
  width: 100%;
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

  /* 비활성화된 입력 필드 스타일 추가 */
  &:disabled {
    background-color: #222222;  // 살짝 더 어두운 배경
    color: #cccccc;            // 밝은 회색으로 텍스트 색상
    cursor: not-allowed;       // 수정 불가능 커서
    opacity: 0.8;              // 약간의 투명도
  }
`;

const ErrorMessage = styled.span`
  color: #ff6b6b;
  font-size: 0.85rem;
  margin-top: -0.3rem;
`;

const ValidationContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: -0.3rem;
`;

const ValidationMessage = styled.div<{ isValid: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.85rem;
  color: ${props => props.isValid ? '#4ECDC4' : '#999'};
  white-space: nowrap;

  &:before {
    content: '${props => props.isValid ? '✓' : '•'}';
  }
`;

const HelperText = styled.span`
  color: #3498db;          // 파란색으로 변경
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
  font-family: inherit;    // 기존 폰트 상속
  font-weight: 500;        // 기존 폰트 굵기와 맞춤
`;

export default UserInfoInputs;