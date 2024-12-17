import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const OrderPage: React.FC = () => {
  return (
    <>
      <Header />
      <div style={{ 
        padding: '2rem',
        minHeight: '60vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <h2>주문 페이지 준비중입니다</h2>
      </div>
      <Footer />
    </>
  );
};

export default OrderPage;
