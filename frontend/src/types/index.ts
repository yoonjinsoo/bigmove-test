export {};

export interface ReviewType {
  id: number;
  user_id: number;
  order_id: number;
  rating: number;
  comment: string;
}

export interface FurnitureCategory {
  id: number;
  name: string;
  subcategories: { [key: string]: any };
}
