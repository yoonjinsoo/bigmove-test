import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import ProgressBar from '../../components/common/ProgressBar';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Title = styled.h2`
  color: var(--cyan);
  font-size: 2rem;
  text-align: center;
  margin-bottom: 2rem;
`;

const ItemContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 2rem 0;
`;

const ItemRow = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const Input = styled.input`
  padding: 0.8rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;

  &[type='number'] {
    width: 100px;
  }

  &[type='text'] {
    flex: 1;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
`;

const Button = styled.button`
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    opacity: 0.9;
  }
`;

const AddButton = styled(Button)`
  background-color: var(--cyan);
  color: white;
`;

const NavButton = styled(Button)`
  background-color: #666;
  color: white;
`;

interface OrderItem {
  name: string;
  quantity: number;
}

interface ItemSelectionStepProps {
  items: OrderItem[];
  setItems: React.Dispatch<React.SetStateAction<OrderItem[]>>;
  nextStep: () => void;
  prevStep: () => void;
}

const ItemSelectionStep: React.FC<ItemSelectionStepProps> = React.memo(
  ({ items, setItems, nextStep, prevStep }) => {
    const addItem = useCallback(() => {
      setItems((prevItems) => [...prevItems, { name: '', quantity: 1 }]);
    }, [setItems]);

    const updateItem = useCallback(
      (index: number, field: keyof OrderItem, value: string | number) => {
        setItems((prevItems) => {
          const newItems = [...prevItems];
          newItems[index] = { ...newItems[index], [field]: value };
          return newItems;
        });
      },
      [setItems]
    );

    const itemRows = useMemo(
      () =>
        items.map((item, index) => (
          <ItemRow key={`item-${index}`}>
            <Input
              type="text"
              value={item.name}
              onChange={(e) => updateItem(index, 'name', e.target.value)}
              placeholder="가구 이름"
              required
            />
            <Input
              type="number"
              value={item.quantity}
              onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
              min="1"
              required
            />
          </ItemRow>
        )),
      [items, updateItem]
    );

    return (
      <Container>
        <ProgressBar currentStep={4} totalSteps={9} />
        <Title>주문 항목 선택</Title>
        <ItemContainer>{itemRows}</ItemContainer>
        <ButtonGroup>
          <NavButton onClick={prevStep}>이전 단계</NavButton>
          <AddButton onClick={addItem}>항목 추가</AddButton>
          <NavButton
            onClick={nextStep}
            disabled={items.length === 0 || items.some((item) => !item.name)}
          >
            다음 단계
          </NavButton>
        </ButtonGroup>
      </Container>
    );
  }
);

ItemSelectionStep.displayName = 'ItemSelectionStep';

export default ItemSelectionStep;
