import { Item } from '../types/item';
import apiService from '../services/apiService';

export const categoryItems: Record<string, Item[]> = {};

export const getItemsByCategory = async (categoryId: string): Promise<Item[]> => {
  try {
    if (categoryItems[categoryId]) {
      return categoryItems[categoryId];
    }
    const data = await apiService.categories.getItems(categoryId);
    categoryItems[categoryId] = data;
    return data;
  } catch (error) {
    console.error('Error fetching items:', error);
    return [];
  }
};

export const getItemById = async (categoryId: string, itemId: string): Promise<Item | null> => {
  try {
    if (!categoryItems[categoryId]) {
      await getItemsByCategory(categoryId);
    }
    return categoryItems[categoryId].find((item) => item.id === itemId) || null;
  } catch (error) {
    console.error('Error fetching item:', error);
    return null;
  }
};
