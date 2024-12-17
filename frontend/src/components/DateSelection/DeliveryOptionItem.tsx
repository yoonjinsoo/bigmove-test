import React from 'react';
import { ApiDeliveryOption } from '../../types/delivery';
import { DeliveryOptionItem } from '../../pages/styles/DeliveryDateStyles';

interface DeliveryOptionItemProps {
  option: ApiDeliveryOption;
  onSelect: (option: ApiDeliveryOption) => void;
}

const DeliveryOptionItemComponent = React.forwardRef<HTMLDivElement, DeliveryOptionItemProps>(
  ({ option, onSelect }, ref) => {
    return (
      <DeliveryOptionItem ref={ref} onClick={() => onSelect(option)}>
        <h3>{option.label}</h3>
        <p>{option.description}</p>
        <span>+{option.additionalFee.toLocaleString()}원</span>
      </DeliveryOptionItem>
    );
  }
);

DeliveryOptionItemComponent.displayName = 'DeliveryOptionItemComponent';

export default DeliveryOptionItemComponent;
