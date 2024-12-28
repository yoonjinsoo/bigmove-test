import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Item } from '../types/item';
import { useItemSelection } from '../contexts/ItemSelectionContext';

export const useItemNavigation = () => {
  const navigate = useNavigate();
  const { dispatch } = useItemSelection();
  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => {
    navigate('/items');
  };

  const handleItemSelect = (categoryId: string, item: Item) => {
    setIsLoading(true);
    dispatch({ type: 'SELECT_ITEM', payload: item });
    
    setTimeout(() => {
      navigate(`/item/${item.id}`);
    }, 500);
  };

  return {
    handleBack,
    handleItemSelect,
    isLoading
  };
};
