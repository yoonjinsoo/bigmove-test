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

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <Router>
          <SignUpProvider>
            <ItemSelectionProvider>
              <OrderProvider>
                <ToastProvider>
                  <Header />
                  <AppRoutes />
                  <Footer />
                </ToastProvider>
              </OrderProvider>
            </ItemSelectionProvider>
          </SignUpProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
