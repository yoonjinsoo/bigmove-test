import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProgressBar from '../components/common/ProgressBar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import { FaArrowLeft } from 'react-icons/fa';
import { getItemIcon } from '../utils/iconUtils';
import { useItemList } from '../hooks/useItemList';
import { useItemNavigation } from '../hooks/useItemNavigation';
import {
  StyledContainer,
  Title,
  BackButton,
  ItemGrid,
  ItemCard,
  ItemIcon,
  ItemName
} from './styles/ItemListStyles';

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
            <ItemIcon>{getItemIcon(item.name)}</ItemIcon>
            <ItemName>{item.name}</ItemName>
          </ItemCard>
        ))}
      </ItemGrid>
    </div>
  );
};

export default ItemListPage;
