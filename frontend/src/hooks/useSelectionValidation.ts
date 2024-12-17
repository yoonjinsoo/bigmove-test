import { useItemSelection } from '../contexts/ItemSelectionContext';
import { Category, Item, ItemDetail } from '../types/item';

interface ValidatedSelection {
  isValid: boolean;
  selectedCategory: Category | null;
  selectedItem: Item | null;
  selectedDetail: ItemDetail | null;
}

export const useSelectionValidation = (): ValidatedSelection => {
  const { state } = useItemSelection();
  const { selectedCategory, selectedItem, selectedDetail } = state;

  const isValid = !!(selectedCategory && selectedItem && selectedDetail);

  return {
    isValid,
    selectedCategory,
    selectedItem,
    selectedDetail
  };
};
