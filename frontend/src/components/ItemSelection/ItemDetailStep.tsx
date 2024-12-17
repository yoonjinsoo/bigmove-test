import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { useItemSelection } from '../../contexts/ItemSelectionContext';
import ProgressBar from '../common/ProgressBar';
import { FaArrowLeft } from 'react-icons/fa';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import apiService from '../../services/apiService';
import type { ItemDetail as ItemDetailType } from '../../types/item';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Title = styled.h1`
  color: var(--cyan);
  font-size: 2rem;
  text-align: center;
  margin-bottom: 2rem;
`;

const TopButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
`;

const DetailContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  background-color: var(--dark-gray);
  border-radius: 12px;
  padding: 2rem;
`;

const BottomButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;
`;

const PrevButton = styled.button`
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--cyan);
  background: transparent;
  color: var(--cyan);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const SelectButton = styled.button`
  padding: 1rem 2rem;
  border-radius: 8px;
  border: none;
  background-color: var(--cyan);
  color: var(--dark-gray);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 200px;

  &:hover {
    background-color: #45b7a0;
  }
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin: 2rem 0;
`;

const DetailCard = styled.div<{ isSelected: boolean }>`
  background: ${(props) =>
    props.isSelected ? 'rgba(var(--cyan-rgb), 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  border: 2px solid ${(props) => (props.isSelected ? 'var(--cyan)' : 'transparent')};
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--cyan);
  }
`;

const DetailName = styled.h3`
  color: var(--cyan);
  font-size: 1.2rem;
  margin-bottom: 1rem;
  text-align: center;
`;

const DetailDescription = styled.p`
  color: #f5f5f1;
  font-size: 0.9rem;
  text-align: center;
`;

interface ItemDetail {
  id: string;
  name: string;
  description: string;
  size: string;
}

const ItemDetailStep: React.FC = () => {
  const { categoryId, itemId } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useItemSelection();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<ItemDetail[]>([]);
  const [selectedDetail, setSelectedDetail] = useState<string | null>(null);

  useEffect(() => {
    const fetchItemDetails = async () => {
      if (!categoryId || !itemId) return;

      try {
        setLoading(true);
        const response = await apiService.items.getItemDetails(categoryId, itemId);
        setDetails(response);
      } catch (error) {
        setError('상세 정보를 불러오는데 실패했습니다.');
        console.error('Failed to fetch item details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchItemDetails();
  }, [categoryId, itemId]);

  const handleDetailSelect = (detail: ItemDetail) => {
    setSelectedDetail(detail.id);

    const itemDetail: ItemDetailType = {
      id: detail.id,
      item_id: state.selectedItem?.id || '',
      name: detail.name,
      description: detail.description,
      price_modifier: 0,
      condition: '',
    };

    dispatch({
      type: 'SELECT_ITEM_DETAIL',
      payload: itemDetail,
    });

    navigate('/selection-summary');
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <Container>
      <ProgressBar currentStep={3} totalSteps={9} />
      <Title>상세 옵션을 선택해주세요</Title>
      <TopButtonGroup>
        <PrevButton onClick={() => navigate(-1)}>
          <FaArrowLeft />
          이전으로
        </PrevButton>
      </TopButtonGroup>
      <DetailContainer>
        <DetailGrid>
          {details.map((detail) => (
            <DetailCard
              key={detail.id}
              isSelected={selectedDetail === detail.id}
              onClick={() => handleDetailSelect(detail)}
            >
              <DetailName>{detail.name}</DetailName>
              <DetailDescription>{detail.description}</DetailDescription>
            </DetailCard>
          ))}
        </DetailGrid>
        <BottomButtonGroup>
          <SelectButton
            onClick={() => {
              if (selectedDetail) {
                const detail = details.find((d) => d.id === selectedDetail);
                if (detail) {
                  handleDetailSelect(detail);
                }
              }
            }}
            disabled={!selectedDetail}
          >
            선택하기
          </SelectButton>
        </BottomButtonGroup>
      </DetailContainer>
    </Container>
  );
};

export default ItemDetailStep;
