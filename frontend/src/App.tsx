import * as React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import GlobalStyle from './styles/GlobalStyle';
import Header from './components/Header';
import Footer from './components/Footer';
import AppRoutes from './routes/AppRoutes';
import { SignUpProvider } from './contexts/SignUpContext';
import { ItemSelectionProvider } from './contexts/ItemSelectionContext';
import { OrderProvider } from './context/OrderContext';
import { ToastProvider } from './components/common/Toast';
import type { DefaultTheme } from 'styled-components';
import AdminDashboard from './pages/admin/Dashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ScrollToTop from './components/common/ScrollToTop';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { AxiosError } from 'axios';

const theme: DefaultTheme = {
  colors: {
    darkGray: '#1E1E1E',
    lightGray: '#F5F5F5',
    mediumGray: '#CCCCCC',
    cyan: '#4ECDC4',
    darkCyan: '#45B7A0',
    orange: '#FF6B6B',
    primary: '#45B7A0',
    button: '#4ECDC4'
  }
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5분
      cacheTime: 1000 * 60 * 30, // 30분
    },
  },
});

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const customError = error as AxiosError;
  
  // 401 에러는 표시하지 않음
  if (customError.response?.status === 401) {
    return null;
  }
  
  return (
    <div role="alert">
      <p>오류가 발생했습니다</p>
      <button onClick={resetErrorBoundary}>다시 시도</button>
    </div>
  );
}

const App: React.FC = () => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Router>
        <ScrollToTop />
        <ThemeProvider theme={theme}>
          <QueryClientProvider client={queryClient}>
            <SignUpProvider>
              <ItemSelectionProvider>
                <OrderProvider>
                  <ToastProvider>
                    <GlobalStyle />
                    <Header />
                    <AppRoutes />
                    <Footer />
                  </ToastProvider>
                </OrderProvider>
              </ItemSelectionProvider>
            </SignUpProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
