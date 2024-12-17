import create from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface PriceDetails {
  basePrice: number;
  additionalFees: {
    deliveryFee: number;    // 배송 타입에 따른 추가 요금
    distanceFee: number;    // 거리 추가 요금
    serviceFee: number;     // 서비스 옵션 추가 요금
  };
  totalPrice: number;
}

interface OrderDTO {
  // 1단계: 상품 선택
  items: OrderItem[];
  price_details: PriceDetails;

  // 2단계: 배송 정보
  delivery_info: {
    date: string | null;
    loading_time: string;
    unloading_time: string;
    delivery_option: 'same-day' | 'next-day' | 'regular';
    delivery_fee: number;
  };

  // 3단계: 주소 정보
  addresses: {
    from_address: string;
    from_detail_address: string;
    to_address: string;
    to_detail_address: string;
    distance: number;
    base_distance: number;     // 기본 거리 (10km)
    additional_distance: number; // 추가 거리
    distance_fee: number;       // 추가 거리 요금
  };

  // 4단계: 서비스 옵션
  service_options: {
    floor_option_id: number | null;
    floor_option_name: string | null;
    floor_option_fee: number;
    
    ladder_option_id: number | null;
    ladder_option_name: string | null;
    ladder_option_fee: number;
    
    special_vehicle_id: number | null;
    special_vehicle_name: string | null;
    special_vehicle_fee: number;
    
    total_option_fee: number;
  };
}

interface OrderState {
  currentStep: number;
  orderData: OrderDTO;
  isLoading: boolean;
  error: string | null;

  // Actions
  setStep: (step: number) => void;
  updateOrderData: (data: Partial<OrderDTO>) => void;
  calculateTotalPrice: () => number;
  createOrder: () => Promise<void>;
  resetOrder: () => void;
}

const initialOrderData: OrderDTO = {
  items: [],
  price_details: {
    basePrice: 0,
    additionalFees: {
      deliveryFee: 0,
      distanceFee: 0,
      serviceFee: 0
    },
    totalPrice: 0
  },
  delivery_info: {
    date: null,
    loading_time: '',
    unloading_time: '',
    delivery_option: 'regular',
    delivery_fee: 0
  },
  addresses: {
    from_address: '',
    from_detail_address: '',
    to_address: '',
    to_detail_address: '',
    distance: 0,
    base_distance: 10,
    additional_distance: 0,
    distance_fee: 0
  },
  service_options: {
    floor_option_id: null,
    floor_option_name: null,
    floor_option_fee: 0,
    
    ladder_option_id: null,
    ladder_option_name: null,
    ladder_option_fee: 0,
    
    special_vehicle_id: null,
    special_vehicle_name: null,
    special_vehicle_fee: 0,
    
    total_option_fee: 0
  }
};

const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      orderData: initialOrderData,
      isLoading: false,
      error: null,

      setStep: (step: number) => set({ currentStep: step }),

      updateOrderData: (data: Partial<OrderDTO>) => {
        set((state) => {
          const newOrderData = { ...state.orderData, ...data };
          // 총 가격 자동 계산
          const totalPrice = get().calculateTotalPrice();
          newOrderData.price_details.totalPrice = totalPrice;
          return { orderData: newOrderData };
        });
      },

      calculateTotalPrice: () => {
        const { orderData } = get();
        const basePrice = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const deliveryFee = orderData.delivery_info.delivery_fee;
        const distanceFee = orderData.addresses.distance_fee;
        const serviceFee = orderData.service_options.total_option_fee;

        const totalAdditionalFees = deliveryFee + distanceFee + serviceFee;
        const totalPrice = basePrice + totalAdditionalFees;

        set(state => ({
          orderData: {
            ...state.orderData,
            price_details: {
              basePrice,
              additionalFees: {
                deliveryFee,
                distanceFee,
                serviceFee
              },
              totalPrice
            }
          }
        }));

        return totalPrice;
      },

      createOrder: async () => {
        const state = get();
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post('/api/orders', state.orderData);
          set({ isLoading: false });
          return response.data;
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : '주문 생성 중 오류가 발생했습니다.'
          });
          throw error;
        }
      },

      resetOrder: () => {
        set({ orderData: initialOrderData, currentStep: 1, error: null });
      },
    }),
    {
      name: 'order-storage',
      getStorage: () => localStorage,
    }
  )
);

export default useOrderStore;