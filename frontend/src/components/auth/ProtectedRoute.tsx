import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import styled from 'styled-components';

const AdminLayout = styled.div`
  min-height: 100vh;
  background-color: var(--dark-gray);
  padding-top: 80px; // Header 높이만큼 여백
`;

const AdminContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to={adminOnly ? "/admin/login" : "/login"} replace />;
  }

  if (adminOnly && user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  // 관리자 페이지일 경우 AdminLayout 적용
  if (adminOnly) {
    return (
      <AdminLayout>
        <AdminContainer>
          {children}
        </AdminContainer>
      </AdminLayout>
    );
  }

  // 일반 보호된 라우트는 그대로 렌더링
  return <>{children}</>;
};

export default ProtectedRoute; 