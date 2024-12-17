import React from 'react';
import styled from 'styled-components';
import { FormGroup, Label } from '../../components/auth/styles/SignUpStyles';

interface AgreementSectionProps {
  agreements: {
    terms: boolean;
    privacy: boolean;
    privacyThirdParty: boolean;
    marketing: boolean;
  };
  handleCheckboxChange: (name: string) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleModalOpen: (type: 'terms' | 'privacy' | 'privacy-third-party' | 'privacy-marketing') => void;
}

const AgreementLabel = styled(Label)`
  color: #F5F5F5;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const RequiredCheckbox = styled.input.attrs({ type: 'checkbox' })`
  width: 16px;
  height: 16px;
  cursor: not-allowed;
  appearance: none;
  border: 1px solid #4ECDC4;
  border-radius: 3px;
  position: relative;
  
  &:checked {
    background-color: #4ECDC4;
    border-color: #4ECDC4;
    
    &::after {
      content: '✓';
      position: absolute;
      color: #000000;
      font-size: 18px;
      font-weight: 900;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }
`;

const OptionalCheckbox = styled.input.attrs({ type: 'checkbox' })`
  width: 16px;
  height: 16px;
  cursor: pointer;
  appearance: none;
  border: 1px solid #4ECDC4;
  border-radius: 3px;
  position: relative;
  
  &:checked {
    background-color: #4ECDC4;
    border-color: #4ECDC4;
    
    &::after {
      content: '✓';
      position: absolute;
      color: #0066ff;
      font-size: 14px;
      font-weight: 900;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }

  &:hover {
    border-color: #45b8b0;
  }
`;

const AgreementBox = styled.div`
  border: 1px solid #4ECDC4;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem auto;
  width: 95%;
`;

const AgreementLink = styled.a`
  color: #4ECDC4;
  margin-left: auto;
  text-decoration: none;
  font-size: 0.8rem;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

const AgreementSection: React.FC<AgreementSectionProps> = ({
  agreements,
  handleCheckboxChange,
  handleModalOpen
}) => {
  return (
    <AgreementBox>
      <FormGroup>
        <AgreementLabel>
          <RequiredCheckbox
            checked={agreements.terms}
            disabled={true}
            required
          />
          서비스 이용약관 동의 (필수)
          <AgreementLink onClick={() => handleModalOpen('terms')}>내용 보기</AgreementLink>
        </AgreementLabel>
      </FormGroup>

      <FormGroup>
        <AgreementLabel>
          <RequiredCheckbox
            checked={agreements.privacy}
            disabled={true}
            required
          />
          개인정보 수집 및 이용 동의 (필수)
          <AgreementLink onClick={() => handleModalOpen('privacy')}>내용 보기</AgreementLink>
        </AgreementLabel>
      </FormGroup>

      <FormGroup>
        <AgreementLabel>
          <RequiredCheckbox
            checked={agreements.privacyThirdParty}
            disabled={true}
            required
          />
          개인정보 제3자 제공 동의 (필수)
          <AgreementLink onClick={() => handleModalOpen('privacy-third-party')}>내용 보기</AgreementLink>
        </AgreementLabel>
      </FormGroup>

      <FormGroup>
        <AgreementLabel>
          <OptionalCheckbox
            checked={agreements.marketing}
            onChange={handleCheckboxChange('marketing')}
          />
          마케팅 정보 수신 동의 (선택)
          <AgreementLink onClick={() => handleModalOpen('privacy-marketing')}>내용 보기</AgreementLink>
        </AgreementLabel>
      </FormGroup>
    </AgreementBox>
  );
};

export default AgreementSection;