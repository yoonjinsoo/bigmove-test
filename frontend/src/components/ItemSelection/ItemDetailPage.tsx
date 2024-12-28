import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useItemSelection } from '../../contexts/ItemSelectionContext';
import apiService from '../../services/apiService';
import { ItemDetail } from '../../types/item';
import ProgressBar from '../common/ProgressBar';
import { LoadingProgress } from '../common/LoadingProgress';
import ErrorMessage from '../common/ErrorMessage';
import { FaArrowLeft } from 'react-icons/fa';
import { BackButton } from '../../pages/styles/ItemListStyles';
import styled from 'styled-components';

interface ItemDetailInfo {
  id: string;
  name: string;
  description: string;
  options?: {
    id: string;
    name: string;
    description: string;
  }[];
}

const DetailContainer = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const OptionList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

interface OptionCardProps {
  selected?: boolean;
}

const OptionCard = styled.div<OptionCardProps>`
  padding: 15px;
  border: 2px solid ${props => props.selected ? props.theme.colors.primary : props.theme.colors.mediumGray};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.5s ease;
  opacity: 0;
  animation: cardFadeIn 0.8s ease-out forwards;
  animation-delay: calc(var(--index) * 0.2s);

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    transform: translateY(-8px);
    box-shadow: 0 5px 15px rgba(78, 205, 196, 0.2);
  }

  &:active {
    transform: scale(0.95);
    background-color: rgba(52, 152, 219, 0.2);
  }

  @keyframes cardFadeIn {
    0% {
      opacity: 0;
      transform: translateY(20px) scale(0.8);
    }
    60% {
      transform: translateY(-10px) scale(1.1);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  h3 {
    transition: all 0.3s ease;
    &:hover {
      transform: scale(1.1);
      color: ${props => props.theme.colors.primary};
    }
  }

  p {
    transition: all 0.3s ease;
    &:hover {
      color: ${props => props.theme.colors.primary};
    }
  }
`;

const ItemDetailPage: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useItemSelection();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [itemDetails, setItemDetails] = useState<ItemDetailInfo[]>([]);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    const fetchItemDetail = async () => {
      if (!state.selectedCategory) {
        navigate('/items');
        return;
      }

      try {
        setLoading(true);
        const response = await apiService.items.getItemDetails(
          state.selectedCategory.id,
          itemId!
        );
        setItemDetails(response);
      } catch (err) {
        console.error('Error fetching item details:', err);
        setError('상세 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchItemDetail();
  }, [itemId, state.selectedCategory, navigate]);

  const handleDetailSelect = (detail: ItemDetailInfo) => {
    setIsNavigating(true);
    dispatch({ type: 'SELECT_ITEM_DETAIL', payload: detail });
    
    setTimeout(() => {
      navigate('/selection-summary');
    }, 500);
  };

  const handleBack = () => {
    if (state.selectedCategory) {
      navigate(`/categories/${state.selectedCategory.id}/items`);
    } else {
      navigate('/items');
    }
  };

  if (loading) return <LoadingProgress message="상세 정보를 불러오고 있습니다..." />;
  if (error) return <ErrorMessage message={error} />;
  if (!itemDetails.length) return <ErrorMessage message="상세 옵션을 찾을 수 없습니다." />;

  return (
    <div className="step-container">
      <div className="step-progress-bar">
        <ProgressBar currentStep={3} totalSteps={8} />
      </div>
      <h1 className="step-title">상세 옵션을 선택해주세요</h1>
      <BackButton onClick={handleBack}>
        <FaArrowLeft /> 이전으로
      </BackButton>
      <DetailContainer>
        <OptionList>
          {itemDetails.map((detail, index) => (
            <OptionCard
              key={detail.id}
              onClick={() => handleDetailSelect(detail)}
              style={{ '--index': index } as React.CSSProperties}
            >
              <h3>{detail.name}</h3>
              <p>{detail.description}</p>
            </OptionCard>
          ))}
        </OptionList>
      </DetailContainer>
      {isNavigating && (
        <LoadingProgress 
          message="선택하신 내용을 저장하고 있습니다..." 
        />
      )}
    </div>
  );
};

export default ItemDetailPage;