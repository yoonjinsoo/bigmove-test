import { useNavigate } from 'react-router-dom';
import { Category, Item, ItemDetail } from '../types/item';
import useOrderStore from '../store/orderStore';

interface NavigationHandlers {
  handleBack: () => void;
  handleDeliveryDateClick: (category: Category, item: Item, detail: ItemDetail) => void;
}

export const useSelectionNavigation = (): NavigationHandlers => {
  const navigate = useNavigate();
  const { updateOrderData } = useOrderStore();

  const handleBack = () => {
    navigate(-1);
  };

  const handleDeliveryDateClick = (category: Category, item: Item, detail: ItemDetail) => {
    // 가격 계산
    const basePrice = Number(item.base_price) || 0;
    const priceModifier = Number(detail.price_modifier) || 0;
    const finalPrice = basePrice * (1 + priceModifier);

    // item.id가 없는 경우 처리
    if (!item.id) {
      console.error('Item ID is missing');
      return;
    }

    console.log('Saving order data:', {
      itemId: item.id,
      basePrice,
      priceModifier,
      finalPrice
    });

    // "배송 날짜 선택" 버튼 클릭 시 orderStore에 선택 정보 저장
    updateOrderData({
      items: [{
        id: item.id,  // 문자열 그대로 사용
        name: `${category.name} - ${item.name} - ${detail.name}`,
        quantity: 1,
        price: finalPrice,
      }],
      price_details: {
        basePrice: finalPrice,
        additionalFees: {
          deliveryFee: 0,
          distanceFee: 0,
          serviceFee: 0
        },
        totalPrice: finalPrice
      }
    });

    // 배송 날짜 선택 페이지로 이동
    navigate('/delivery-date', {
      state: {
        categoryId: category.id,
        itemId: item.id,
        detailId: detail.id,
      },
    });
  };

  return {
    handleBack,
    handleDeliveryDateClick
  };
};