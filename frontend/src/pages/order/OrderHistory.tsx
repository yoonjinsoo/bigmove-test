import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

interface OrderItem {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  shipping_status: string;
}

const OrderHistory = () => {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await api.get(`/orders/user/${user.id}`);
      setOrders(response.data);
    } catch (error) {
      console.error('주문 내역 로딩 중 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderClick = (orderId: string) => {
    navigate(`/order/detail/${orderId}`);
  };

  return (
    <Container>
      <Title>주문 내역</Title>
      {isLoading ? (
        <LoadingMessage>로딩 중...</LoadingMessage>
      ) : orders.length === 0 ? (
        <NoOrderMessage>주문 내역이 없습니다.</NoOrderMessage>
      ) : (
        <OrderList>
          {orders.map((order) => (
            <OrderItem key={order.id} onClick={() => handleOrderClick(order.id)}>
              <OrderHeader>
                <OrderDate>{new Date(order.created_at).toLocaleDateString()}</OrderDate>
                <OrderStatus>{order.status}</OrderStatus>
              </OrderHeader>
              <OrderInfo>
                <div>주문번호: {order.id}</div>
                <div>결제금액: {order.total_amount.toLocaleString()}원</div>
              </OrderInfo>
              <ShippingStatus>배송상태: {order.shipping_status}</ShippingStatus>
            </OrderItem>
          ))}
        </OrderList>
      )}
    </Container>
  );
};

const Container = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 24px;
  margin-bottom: 20px;
`;

const OrderList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const OrderItem = styled.div`
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #f8f8f8;
    transform: translateY(-2px);
  }
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const OrderDate = styled.span`
  color: #666;
`;

const OrderStatus = styled.span`
  font-weight: bold;
  color: #2196f3;
`;

const OrderInfo = styled.div`
  margin: 10px 0;
  line-height: 1.5;
`;

const ShippingStatus = styled.div`
  color: #4caf50;
  font-weight: bold;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
`;

const NoOrderMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
`;

export default OrderHistory; 