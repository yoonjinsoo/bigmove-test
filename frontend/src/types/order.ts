export interface OrderDTO {
  items: Array<{
    id: string;
    quantity: number;
    price: number;
  }>;
  addresses: {
    from_address_id: number;
    to_address_id: number;
    distance: number;
  };
  service_options: {
    floor_option_id: string | null;
    ladder_option_id: string | null;
    special_vehicle_id: string | null;
  };
  delivery_info: {
    date: Date | null;
    time_slot: string;
    delivery_option: string;
  };
  price_details?: {
    base_price: number;
    distance_fee: number;
    floor_fee: number;
    special_fee: number;
    discount_amount: number;
    final_price: number;
  };
}

export interface QuoteResponse {
  quote_id: string;
  price_details: OrderDTO['price_details'];
  valid_until: Date;
}

export interface OrderResponse {
  order_id: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed';
  created_at: Date;
  price_details: OrderDTO['price_details'];
}

export interface PriceDetails {
  base_price: number;
  distance_price: number;
  options_price: number;
  total_price: number;
}

export interface OrderSummary {
  product_selection: {
    product: string;
    category: string;
    details?: {
      items?: string[];
    };
  };
  date_selection?: {
    date: string;
    loading_time: string;
    unloading_time: string;
  };
  address_input?: {
    loading_address?: {
      address: string;
      detail_address?: string;
    };
    unloading_address?: {
      address: string;
      detail_address?: string;
    };
  };
  additional_options?: {
    selected_options?: Array<{
      name: string;
      price: number;
    }>;
  };
  price_details?: PriceDetails;
} 