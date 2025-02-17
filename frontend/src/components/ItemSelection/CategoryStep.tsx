import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useItemSelection } from '../../contexts/ItemSelectionContext';
import ProgressBar from '../../components/common/ProgressBar';
import { FaBed, FaBiking, FaBoxOpen } from 'react-icons/fa';
import { GiDesk, GiWashingMachine } from 'react-icons/gi';
import { CgSmartHomeRefrigerator } from 'react-icons/cg';
import { Category as CategoryType } from '../../types/item';
import { LoadingProgress } from '../common/LoadingProgress';

const CategoryGrid = styled.div`
  display: grid;
  gap: 2rem;
  padding: 2rem;
  margin-top: 2rem;
  
  // 기본 (PC) 레이아웃
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));

  // 모바일 레이아웃 (768px 미만에서 2열)
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);  // 강제로 2열
    gap: 1rem;  // 간격 축소
    padding: 1rem;  // 패딩 축소
  }
`;

const CategoryCard = styled.div`
  background-color: var(--dark-gray);
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;

  &:hover {
    border-color: var(--cyan);
    transform: translateY(-5px);
  }

  &:active {
    transform: scale(0.95);
    background-color: rgba(52, 152, 219, 0.1);
  }

  animation: cardPulseIn 0.5s ease-out;

  @keyframes cardPulseIn {
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

const CategoryIcon = styled.div`
  color: var(--cyan);
  font-size: 3rem;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
  transition: all 0.3s ease;

  ${CategoryCard}:hover &,
  ${CategoryCard}:active & {
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

const CategoryName = styled.h3`
  color: #f5f5f1;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  word-break: keep-all;  // 단어 단위로 줄바꿈
  white-space: pre-wrap;  // 공백 유지하며 줄바꿈
`;

interface CategoryUI {
  id: string;
  name: string;
  description: string;
  icon: React.ReactElement;
}

const categories: CategoryUI[] = [
  {
    id: 'bedroom-living',
    name: '침실/거실 가구',
    description: '침대, 쇼파, 옷장, 행거, 수납장 등',
    icon: <FaBed />,
  },
  {
    id: 'study',
    name: '서재가구',
    description: '책상, 의자, 책장 등',
    icon: <GiDesk />,
  },
  {
    id: 'digital-appliances',
    name: '디지털/생활가전',
    description: 'TV, PC, 에어컨, 세탁기 등',
    icon: <GiWashingMachine />,
  },
  {
    id: 'kitchen',
    name: '주방 가전/가구',
    description: '식기세척기, 전자레인지, 식탁 등',
    icon: <CgSmartHomeRefrigerator />,
  },
  {
    id: 'exercise-transport',
    name: '운동 및 이동수단',
    description: '자전거, 킥보드, 스쿠터 등',
    icon: <FaBiking />,
  },
  {
    id: 'etc',
    name: '기타',
    description: '운동용품, 화분, 안마의자 등',
    icon: <FaBoxOpen />,
  },
];

const CategoryStep: React.FC = () => {
  const navigate = useNavigate();
  const { dispatch } = useItemSelection();
  const [isLoading, setIsLoading] = useState(false);

  const handleCategorySelect = (categoryId: string) => {
    setIsLoading(true);

    const selectedCategory: CategoryType = {
      id: categoryId,
      name: getCategoryName(categoryId),
      subcategory: getSubcategoryName(categoryId),
    };

    dispatch({ type: 'SELECT_CATEGORY', payload: selectedCategory });
    
    setTimeout(() => {
      navigate(`/categories/${categoryId}/items`);
    }, 500);
  };

  const getCategoryName = (categoryId: string): string => {
    const categoryNames: { [key: string]: string } = {
      'bedroom-living': '침실/거실 가구',
      study: '서재가구',
      'digital-appliances': '디지털/생활가전',
      kitchen: '주방 가전/가구',
      'exercise-transport': '운동 및 이동수단',
      etc: '기타',
    };
    return categoryNames[categoryId] || categoryId;
  };

  const getSubcategoryName = (categoryId: string): string => {
    const subcategoryNames: { [key: string]: string } = {
      'bedroom-living': '침실/거실',
      study: '서재',
      'digital-appliances': '디지털/가전',
      kitchen: '주방',
      'exercise-transport': '운동/이동',
      etc: '기타',
    };
    return subcategoryNames[categoryId] || categoryId;
  };

  const getCategoryIcon = (categoryId: string): React.ReactElement => {
    switch (categoryId) {
      case 'bedroom-living':
        return <FaBed />;
      case 'study':
        return <GiDesk />;
      case 'digital-appliances':
        return <GiWashingMachine />;
      case 'kitchen':
        return <CgSmartHomeRefrigerator />;
      case 'exercise-transport':
        return <FaBiking />;
      case 'etc':
        return <FaBoxOpen />;
      default:
        return <FaBed />;
    }
  };

  return (
    <div className="step-container">
      <div className="step-progress-bar">
        <ProgressBar currentStep={1} totalSteps={8} />
      </div>
      <h1 className="step-title">배송할 물품의 종류를 선택해주세요</h1>
      <CategoryGrid>
        {categories.map((category) => (
          <CategoryCard key={category.id} onClick={() => handleCategorySelect(category.id)}>
            <CategoryIcon>{getCategoryIcon(category.id)}</CategoryIcon>
            <CategoryName>{category.name}</CategoryName>
          </CategoryCard>
        ))}
      </CategoryGrid>
      {isLoading && (
        <LoadingProgress 
          message="해당 카테고리의 상품을 불러오고 있습니다..." 
        />
      )}
    </div>
  );
};
export default CategoryStep;

