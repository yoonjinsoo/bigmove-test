import { Routes, Route } from 'react-router-dom';
import PaymentTest from '../pages/payment/PaymentTest';
import PaymentResult from '../pages/payment/PaymentResult';
import OrderHistory from '../pages/order/OrderHistory';
import OrderDetail from '../pages/order/OrderDetail';

const AppRoutes = () => {
  return (
    <Routes>
      {/* 기존 라우트들 */}
      <Route path="/payment/test" element={<PaymentTest />} />
      <Route path="/payment/success" element={<PaymentResult />} />
      <Route path="/payment/fail" element={<PaymentResult />} />
      <Route path="/orders/history" element={<OrderHistory />} />
      <Route path="/order/detail/:orderId" element={<OrderDetail />} />
    </Routes>
  );
};

export default AppRoutes; 