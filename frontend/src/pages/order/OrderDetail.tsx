import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import api from '../../services/api';

interface OrderDetail {
  order: {
    id: string;
    created_at: string;
    status: string;
    total_amount: number;
  };
  payment: {
    status: string;
    method: string;
    paid_at: string;
  };
  shipping: {
    status: string;
    tracking_number?: string;
    carrier?: string;
  };
}

const OrderDetail = () => {
  const { orderId } = useParams();
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrderDetail();
  }, [orderId]);

  const loadOrderDetail = async () => {
    try {
      const response = await api.get(`/orders/${orderId}/details`);
      setOrderDetail(response.data);
    } catch (error) {
      console.error('주문 상세 정보 로딩 중 오류:', error);
      setError('주문 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingMessage>로딩 중...</LoadingMessage>;
  if (error) return <ErrorMessage>{error}</ErrorMessage>;
  if (!orderDetail) return <ErrorMessage>주문 정보를 찾을 수 없습니다.</ErrorMessage>;

  return (
    <Container>
      <Title>주문 상세 정보</Title>
      
      <Section>
        <SectionTitle>주문 정보</SectionTitle>
        <InfoItem>
          <Label>주문번호:</Label>
          <Value>{orderDetail.order.id}</Value>
        </InfoItem>
        <InfoItem>
          <Label>주문일시:</Label>
          <Value>{new Date(orderDetail.order.created_at).toLocaleString()}</Value>
        </InfoItem>
        <InfoItem>
          <Label>주문상태:</Label>
          <Value>{orderDetail.order.status}</Value>
        </InfoItem>
        <InfoItem>
          <Label>결제금액:</Label>
          <Value>{orderDetail.order.total_amount.toLocaleString()}원</Value>
        </InfoItem>
      </Section>

      <Section>
        <SectionTitle>결제 정보</SectionTitle>
        <InfoItem>
          <Label>결제상태:</Label>
          <Value>{orderDetail.payment.status}</Value>
        </InfoItem>
        <InfoItem>
          <Label>결제수단:</Label>
          <Value>{orderDetail.payment.method}</Value>
        </InfoItem>
        <InfoItem>
          <Label>결제일시:</Label>
          <Value>{new Date(orderDetail.payment.paid_at).toLocaleString()}</Value>
        </InfoItem>
      </Section>

      <Section>
        <SectionTitle>배송 정보</SectionTitle>
        <InfoItem>
          <Label>배송상태:</Label>
          <Value>{orderDetail.shipping.status}</Value>
        </InfoItem>
        {orderDetail.shipping.tracking_number && (
          <InfoItem>
            <Label>운송장번호:</Label>
            <Value>{orderDetail.shipping.tracking_number}</Value>
          </InfoItem>
        )}
        {orderDetail.shipping.carrier && (
          <InfoItem>
            <Label>배송사:</Label>
            <Value>{orderDetail.shipping.carrier}</Value>
          </InfoItem>
        )}
      </Section>
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
  margin-bottom: 30px;
`;

const Section = styled.div`
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  margin-bottom: 15px;
  color: #333;
`;

const InfoItem = styled.div`
  display: flex;
  margin-bottom: 10px;
  line-height: 1.5;
`;

const Label = styled.span`
  width: 100px;
  color: #666;
`;

const Value = styled.span`
  flex: 1;
  font-weight: 500;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: #f44336;
`;

export default OrderDetail; 