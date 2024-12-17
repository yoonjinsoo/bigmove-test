import { useNavigate } from 'react-router-dom';
import { Item } from '../types/item';
import { useItemSelection } from '../contexts/ItemSelectionContext';

interface UseItemNavigationReturn {
  handleBack: () => void;
  handleItemSelect: (categoryId: string, item: Item) => void;
}

export const useItemNavigation = (): UseItemNavigationReturn => {
  const navigate = useNavigate();
  const { dispatch } = useItemSelection();

  const handleBack = () => {
    navigate('/items');  // 카테고리 선택 페이지로 이동
  };

  const handleItemSelect = (categoryId: string, item: Item) => {
    dispatch({ type: 'SELECT_ITEM', payload: item });
    navigate(`/item/${item.id}`);  // ItemDetailPage로 이동
  };

  return {
    handleBack,
    handleItemSelect
  };
};
