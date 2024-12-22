import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { SignupAgreements } from '../types/auth';

// Pages
import HomePage from '../pages/HomePage';
import SignUpPage from '../pages/SignUpPage';
import LoginPage from '../components/auth/LoginPage';
import ItemListPage from '../pages/ItemListPage';
import ItemDetailPage from '../pages/ItemDetailPage';
import DeliveryDatePage from '../pages/DeliveryDatePage';
import SelectionSummaryPage from '../pages/SelectionSummaryPage';
import AddressPage from '../pages/AddressPage';
import ServiceOptionsPage from '../pages/ServiceOptionsPage';
import { Summary } from '../pages/Summary/Summary';
import ReviewPage from '../pages/ReviewPage';
import PaymentTest from '../pages/payment/PaymentTest';

// Auth Components
import SignUpForm from '../components/auth/SignUpForm';
import SignUpComplete from '../components/auth/SignUpComplete';
import SocialSignup from '../pages/auth/SocialSignup';
import SocialCallback from '../pages/auth/SocialCallback';
import AdminLoginForm from '../components/admin/AdminLoginForm';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import AdminDashboard from '../pages/admin/Dashboard';

// Item Selection Components
import CategoryStep from '../components/ItemSelection/CategoryStep';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Admin Routes - 최상단에 배치 */}
      <Route path="/admin" element={<AdminLoginForm />} />
      <Route path="/admin/login" element={<AdminLoginForm />} />
      <Route path="/admin/dashboard" element={
        <ProtectedRoute adminOnly>
          <AdminDashboard />
        </ProtectedRoute>
      } />

      {/* Main Routes */}
      <Route path="/" element={<HomePage />} />
      
      {/* Item Routes */}
      <Route path="/items" element={<CategoryStep />} />
      <Route path="/categories/:categoryId/items" element={<ItemListPage />} />
      <Route path="/item/:itemId" element={<ItemDetailPage />} />
      <Route path="/selection-summary" element={<SelectionSummaryPage />} />
      
      {/* Auth Routes */}
      {/* 일반 사용자 로그인은 /login 유지 */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/signup/form" element={<SignUpForm />} />
      <Route path="/signup/complete" element={<SignUpComplete />} />
      <Route path="/auth/callback/:provider" element={<SocialCallback />} />
      <Route path="/auth/social-signup" element={<SocialSignup />} />
      
      {/* Order Process Routes */}
      <Route path="/delivery-date" element={<DeliveryDatePage />} />
      <Route path="/address" element={<AddressPage />} />
      <Route path="/service-options" element={<ServiceOptionsPage />} />
      <Route path="/summary" element={<SelectionSummaryPage />} />
      <Route path="/order/summary" element={<Summary />} />
      <Route path="/payment/test" element={<PaymentTest />} />
      <Route path="/review" element={<ReviewPage />} />
    </Routes>
  );
};

export default AppRoutes;

