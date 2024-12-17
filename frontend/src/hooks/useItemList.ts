import { useState, useEffect } from 'react';
import { Item } from '../types/item';
import apiService from '../services/apiService';

interface UseItemListReturn {
  items: Item[];
  loading: boolean;
  error: string | null;
}

export const useItemList = (categoryId: string | undefined): UseItemListReturn => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      if (!categoryId) return;

      try {
        setLoading(true);
        setError(null);
        const items = await apiService.categories.getItems(categoryId);
        setItems(items);
      } catch (err) {
        setError('물품 목록을 불러오는데 실패했습니다.');
        console.error('Failed to fetch items:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [categoryId]);

  return { items, loading, error };
};
