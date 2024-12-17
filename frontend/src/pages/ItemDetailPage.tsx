import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useItemSelection } from '../contexts/ItemSelectionContext';
import apiService from '../services/apiService';
import { ItemDetail } from '../types/item';
import ProgressBar from '../components/common/ProgressBar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { FaArrowLeft } from 'react-icons/fa';
import { BackButton } from './styles/ItemListStyles';
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

const OptionCard = styled.div<{ selected?: boolean }>`
  padding: 15px;
  border: 2px solid ${props => props.selected ? props.theme.colors.primary : props.theme.colors.mediumGray};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    transform: translateY(-2px);
  }
`;

const ItemDetailPage: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useItemSelection();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [itemDetails, setItemDetails] = useState<ItemDetailInfo[]>([]);

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
    dispatch({ type: 'SELECT_ITEM_DETAIL', payload: detail });
    navigate('/selection-summary');  // 옵션 선택 즉시 선택 내역 확인 페이지로 이동
  };

  const handleBack = () => {
    if (state.selectedCategory) {
      navigate(`/categories/${state.selectedCategory.id}/items`);
    } else {
      navigate('/items');
    }
  };

  if (loading) return <LoadingSpinner />;
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
          {itemDetails.map((detail) => (
            <OptionCard
              key={detail.id}
              onClick={() => handleDetailSelect(detail)}
            >
              <h3>{detail.name}</h3>
              <p>{detail.description}</p>
            </OptionCard>
          ))}
        </OptionList>
      </DetailContainer>
    </div>
  );
};

export default ItemDetailPage;