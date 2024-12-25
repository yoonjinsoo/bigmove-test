import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const FooterContainer = styled.footer`
  background-color: var(--dark-gray);
  color: var(--cyan);
  padding: 2rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1); // 상단으로 이동된 선
`;

const FooterGrid = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const FooterSection = styled.div`
  flex: 1;
  text-align: center;

  h3 {
    color: var(--cyan);
    margin-bottom: 1rem;
    font-size: 1rem;
  }

  ul {
    list-style: none;
    padding: 0;
  }

  li {
    margin-bottom: 0.5rem;
  }

  a,
  li,
  button {
    color: #f5f5f1; // 헤더의 "홈"과 같은 색상
    text-decoration: none;
    font-size: 0.8rem; // 1rem에서 0.8rem으로 축소

    &:hover {
      color: var(--cyan);
    }
  }
`;

const CompanyInfo = styled.div`
  margin-top: 3rem;
  padding-top: 2rem;
  // border-top: 1px solid rgba(255, 255, 255, 0.1);  // 이 선을 제거
  text-align: center;
  font-size: 0.9rem;
  color: #bdc3c7;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  justify-content: center;

  a {
    color: #ecf0f1;
    font-size: 1.5rem;

    &:hover {
      color: var(--cyan);
    }
  }
`;

const StyledButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  color: inherit;
  font: inherit;
  cursor: pointer;
  text-decoration: none;
`;

const FooterLinks = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;

  a {
    color: #666;
    text-decoration: none;
    margin-right: 20px;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const Footer: React.FC = () => {
  const handleCustomerService = (e: React.MouseEvent) => {
    e.preventDefault();
    alert('고객센터가 곧 오픈됩니다.\n더 나은 서비스로 찾아뵙겠습니다.\n문의사항은\n이메일:7health@hanmail.net 또는\n대표번호:1600-9891로 연락 부탁드립니다.');
  };

  const handleBlog = (e: React.MouseEvent) => {
    e.preventDefault();
    alert('기업 블로그가 곧 오픈됩니다.\n빅무브의 다양한 소식을 전해드리도록 하겠습니다.');
  };

  return (
    <FooterContainer>
      <FooterGrid>
        <FooterSection>
          <h3>회사</h3>
          <ul>
            <li>
              <a href="/company/greeting.html" target="_blank" rel="noopener noreferrer">
                <StyledButton>회사소개</StyledButton>
              </a>
            </li>
            <li>
              <a href="/company/recruitment.html" target="_blank" rel="noopener noreferrer">
                <StyledButton>배송기사 모집</StyledButton>
              </a>
            </li>
            <li>
              <StyledButton onClick={handleBlog}>
                블로그
              </StyledButton>
            </li>
          </ul>
        </FooterSection>

        <FooterSection>
          <h3>지원</h3>
          <ul>
            <li>
              <StyledButton onClick={handleCustomerService}>
                고객센터
              </StyledButton>
            </li>
            <li>
              <a href="/policy/terms.html" target="_blank" rel="noopener noreferrer">
                <StyledButton>이용약관</StyledButton>
              </a>
            </li>
            <li>
              <a href="/policy/privacy.html" target="_blank" rel="noopener noreferrer">
                <StyledButton>개인정보처리방침</StyledButton>
              </a>
            </li>
          </ul>
        </FooterSection>

        <FooterSection>
          <h3>고객지원</h3>
          <ul>
            <li>이메일: 7health@hanmail.net</li>
            <li>대표번호: 1600-9891</li>
          </ul>
        </FooterSection>
      </FooterGrid>

      <CompanyInfo>
        <p>사업자등록번호: 775-87-01555 | 통신판매업신고: 제2024-경기-0000호</p>
        <p>주소: 경기도 수원시 권선구 새터로37번길 3,202호(세류동)</p>
        <p>㈜ 주식회사 엔비로지스틱스 대표이사 : 김 문 수</p>
        <SocialLinks>
          <StyledButton onClick={handleCustomerService}>
            <i className="fab fa-facebook"></i>
          </StyledButton>
          <StyledButton onClick={handleCustomerService}>
            <i className="fab fa-instagram"></i>
          </StyledButton>
          <StyledButton onClick={handleCustomerService}>
            <i className="fab fa-youtube"></i>
          </StyledButton>
        </SocialLinks>
        <p>© 2024 BigMove Inc. All Rights Reserved.</p>
      </CompanyInfo>
    </FooterContainer>
  );
};

export default Footer;
