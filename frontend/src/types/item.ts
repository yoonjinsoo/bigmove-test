export interface Category {
  id: string;
  name: string;
  subcategory: string;
}

export interface Item {
  id: string;
  category_id: string;
  name: string;
  description: string;
  base_price: number;
  icon?: string;
}

export interface ItemDetail {
  id: string;
  name: string;
  description: string;
  item_id?: string;
  price_modifier?: number;
  condition?: string;
  options?: {
    id: string;
    name: string;
    description: string;
  }[];
}

export interface DetailedItemInfo extends ItemDetail {
  name: string;
  description: string;
  size: string;
  icon: string;
}

export interface SelectedItem {
  category_id: string;
  item_id: string;
  item_detail_id: string;
  quantity: number;
  total_price: number;
}
