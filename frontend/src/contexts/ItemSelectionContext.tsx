import React, { createContext, useContext, useReducer } from 'react';
import { Category, Item, ItemDetail } from '../types/item';

interface ItemSelectionState {
  selectedCategory: Category | null;
  selectedItem: Item | null;
  selectedDetail: ItemDetail | null;
  selectedItems: Array<{
    id: string;
    name: string;
    quantity: number;
  }>;
}

type ItemSelectionAction =
  | { type: 'SELECT_CATEGORY'; payload: Category }
  | { type: 'SELECT_ITEM'; payload: Item }
  | { type: 'SELECT_ITEM_DETAIL'; payload: ItemDetail }
  | { type: 'RESET_SELECTION' };

interface SelectedItem {
  id: string;
  name: string;
  quantity: number;
}

interface ItemSelectionContextType {
  state: ItemSelectionState;
  dispatch: React.Dispatch<ItemSelectionAction>;
  selectedItems: SelectedItem[];
}

const initialState: ItemSelectionState = {
  selectedCategory: null,
  selectedItem: null,
  selectedDetail: null,
  selectedItems: [],
};

const ItemSelectionContext = createContext<ItemSelectionContextType | undefined>(undefined);

function itemSelectionReducer(
  state: ItemSelectionState,
  action: ItemSelectionAction
): ItemSelectionState {
  switch (action.type) {
    case 'SELECT_CATEGORY':
      return {
        ...state,
        selectedCategory: action.payload,
        selectedItem: null,
        selectedDetail: null,
      };
    case 'SELECT_ITEM':
      return {
        ...state,
        selectedItem: action.payload,
      };
    case 'SELECT_ITEM_DETAIL':
      return {
        ...state,
        selectedDetail: action.payload,
      };
    case 'RESET_SELECTION':
      return initialState;
    default:
      return state;
  }
}

export const ItemSelectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(itemSelectionReducer, initialState);

  return (
    <ItemSelectionContext.Provider value={{ state, dispatch, selectedItems: state.selectedItems }}>
      {children}
    </ItemSelectionContext.Provider>
  );
};

export const useItemSelection = () => {
  const context = useContext(ItemSelectionContext);
  if (!context) {
    throw new Error('useItemSelection must be used within an ItemSelectionProvider');
  }
  return context;
};
