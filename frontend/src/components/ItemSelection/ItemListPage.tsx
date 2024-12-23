import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProgressBar from '../common/ProgressBar';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import EmptyState from '../common/EmptyState';
import { FaArrowLeft } from 'react-icons/fa';
import { getItemIcon } from '../../utils/iconUtils';
import { useItemList } from '../../hooks/useItemList';
import { useItemNavigation } from '../../hooks/useItemNavigation';
import {
  StyledContainer,
  Title,
  BackButton,
  ItemGrid,
  ItemCard
} from '../../pages/styles/ItemListStyles';
import styled from 'styled-components';

const StyledItemIcon = styled.div`
  color: var(--cyan);
  font-size: 3rem;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
  transition: all 0.3s ease;

  ${ItemCard}:hover &,
  ${ItemCard}:active & {
    color: #3498db;
    transform: scale(1.1);
  }

  animation: pulseIn 0.5s ease-out;
  
  @keyframes pulseIn {
    0% {
      opacity: 0;
      transform: scale(0.5);
    }
    70% {
      transform: scale(1.1);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

const StyledItemName = styled.h3`
  color: #f5f5f1;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  word-break: keep-all;
  white-space: pre-wrap;

  ${ItemCard}:hover &,
  ${ItemCard}:active & {
    color: #3498db;
    transform: scale(1.1);
  }

  animation: pulseIn 0.5s ease-out;
`;

const ItemListPage: React.FC = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { items, loading, error } = useItemList(categoryId);
  const { handleBack, handleItemSelect } = useItemNavigation();

  useEffect(() => {
    if (!categoryId) {
      // categoryId가 없으면 첫 번째 카테고리로 리다이렉트
      navigate('/categories/bedroom-living/items');
    }
  }, [categoryId, navigate]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (items.length === 0) return <EmptyState message="해당 카테고리에 물품이 없습니다." />;

  return (
    <div className="step-container">
      <div className="step-progress-bar">
        <ProgressBar currentStep={2} totalSteps={8} />
      </div>
      <h1 className="step-title">물품을 선택해주세요</h1>
      <BackButton onClick={handleBack}>
        <FaArrowLeft /> 이전으로
      </BackButton>
      <ItemGrid>
        {items.map((item) => (
          <ItemCard 
            key={item.id} 
            onClick={() => handleItemSelect(categoryId!, item)}
          >
            <StyledItemIcon>{getItemIcon(item.name)}</StyledItemIcon>
            <StyledItemName>{item.name}</StyledItemName>
          </ItemCard>
        ))}
      </ItemGrid>
    </div>
  );
};

export default ItemListPage;
