import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuthStore } from '../store/authStore';
import { useAuth } from '../hooks/useAuth';

const HeaderContainer = styled.header`
  background-color: var(--dark-gray);
  padding: 1rem 2rem;
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;
`;

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
`;

const Logo = styled(Link)`
  color: var(--cyan);
  font-size: 2.34rem; // 1.8rem에서 30% 증가
  font-weight: bold;
  text-decoration: none;
  transition: color 0.3s ease;

  &:hover {
    color: #3498db;
  }
`;

const NavList = styled.ul`
  display: flex;
  gap: 2rem;
  list-style: none;
  margin: 0;
  padding: 0;
`;

const NavItem = styled.li`
  a {
    color: var(--light-gray);  // 로 변경
    text-decoration: none;#F5F5F5
    font-size: 1rem;
    transition: color 0.3s ease;
    
    &:hover {
      color: var(--cyan);
    }
  }
`;

const StyledButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  color: var(--light-gray);
  font: inherit;
  cursor: pointer;
  text-decoration: none;
  font-size: 1rem;
  transition: color 0.3s ease;

  &:hover {
    color: var(--cyan);
  }
`;

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { logout } = useAuth();
  
  const handleComingSoon = (e: React.MouseEvent) => {
    e.preventDefault();
    alert('서비스 준비중입니다.');
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  const handleCustomerService = (e: React.MouseEvent) => {
    e.preventDefault();
    alert('고객센터가 곧 오픈됩니다.\n더 나은 서비스로 찾아뵙겠습니다.\n문의사항은 1600-9891로 연락 부탁드립니다.');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <HeaderContainer>
      <Nav>
        <Logo to="/">BigMove</Logo>
        <NavList>
          {/* 항상 표시되는 메뉴 */}
          <NavItem>
            <a href="/company/greeting.html" target="_blank" rel="noopener noreferrer">
              회사소개
            </a>
          </NavItem>
          <NavItem>
            <a href="#" onClick={handleCustomerService}>
              고객센터
            </a>
          </NavItem>
          <NavItem>
          <a href="/company/recruitment.html" target="_blank" rel="noopener noreferrer">
              배송기사 모집
            </a>
          </NavItem>
          
          {/* 로그인 상태에 따라 변경되는 메뉴 */}
          {isAuthenticated ? (
            <>
              <NavItem>
                <Link to="/items">서비스</Link>
              </NavItem>
              <NavItem>
                <Link to="/mypage">마이페이지</Link>
              </NavItem>
              <NavItem>
                <StyledButton onClick={handleLogout}>로그아웃</StyledButton>
              </NavItem>
            </>
          ) : (
            <>
              <NavItem>
                <Link to="/login">로그인</Link>
              </NavItem>
              <NavItem>
                <Link to="/signup">회원가입</Link>
              </NavItem>
            </>
          )}
        </NavList>
      </Nav>
    </HeaderContainer>
  );
};

export default Header;