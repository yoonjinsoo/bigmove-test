import { Item, ItemDetail } from '../types/item';

export const calculateBasePrice = (item: Item | null, detail: ItemDetail | null): number => {
  if (!item || !detail) {
    return 0;
  }
  
  const basePrice = Number(item.base_price || 0);
  const modifier = Number(detail.price_modifier || 0);
  return basePrice * (1 + modifier);  // 수정자를 곱셈으로 적용
};

export const formatPrice = (price: number): string => {
  return `${price.toLocaleString()}원`;
};
