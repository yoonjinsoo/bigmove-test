import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ServiceOption, ServiceOptionsResponse, SelectedOptions } from '../../types/service-options';
import { serviceOptionsService } from '../../services/serviceOptionsService';
import useOrderStore from '../../store/orderStore';
import { MdArrowBack, MdArrowForward } from 'react-icons/md';

// 타입 정의 추가
type OptionType = 'floor' | 'ladder' | 'special_vehicle';

interface ServiceOptions {
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
}

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  color: white;
`;

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
`;

const OptionCard = styled.div<{ selected?: boolean }>`
  background: #2A2A2A;
  border: 1px solid ${props => props.selected ? '#40E0D0' : '#333'};
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #40E0D0;
  }
`;

const OptionTitle = styled.h3`
  color: #40E0D0;
  font-size: 20px;
  margin-bottom: 10px;
`;

const OptionDescription = styled.p`
  color: #999;
  font-size: 14px;
  margin-bottom: 10px;
`;

const ErrorMessage = styled.div`
  color: #ff4444;
  background-color: rgba(255, 68, 68, 0.1);
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
  text-align: center;
`;

const SelectedOptionsContainer = styled.div`
  background: #2A2A2A;
  border: 1px solid #40E0D0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
`;

const SelectedOptionsTitle = styled.h2`
  color: #40E0D0;
  font-size: 18px;
  margin-bottom: 20px;
`;

const SelectedOptionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const SelectedOptionItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #333;

  &:last-child {
    border-bottom: none;
  }
`;

const OptionLabel = styled.span`
  color: #999;
  font-size: 14px;
`;

const OptionValue = styled.span`
  color: white;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const OptionPrice = styled.span`
  color: #40E0D0;
  font-weight: bold;
`;

const TotalPriceItem = styled(SelectedOptionItem)`
  margin-top: 10px;
  padding-top: 20px;
  border-top: 1px solid #40E0D0;
  border-bottom: none;
`;

const TotalPriceLabel = styled(OptionLabel)`
  font-size: 16px;
  font-weight: bold;
  color: white;
`;

const TotalPriceValue = styled.span`
  color: #40E0D0;
  font-size: 20px;
  font-weight: bold;
`;

const getOptionKey = (type: OptionType): keyof ServiceOptions => {
  const keyMap = {
    floor: 'floor_option_id',
    ladder: 'ladder_option_id',
    special_vehicle: 'special_vehicle_id'
  } as const;
  return keyMap[type];
};

const ServiceOptionsStep: React.FC = () => {
  const { orderData, updateOrderData } = useOrderStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<ServiceOptionsResponse | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await serviceOptionsService.getOptions();
      setOptions(response);
    } catch (error) {
      setError('서비스 옵션을 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = async (option: ServiceOption, type: OptionType) => {
    try {
      const idKey = getOptionKey(type);
      const feeKey = `${type}_option_fee` as keyof ServiceOptions;
      const nameKey = `${type}_option_name` as keyof ServiceOptions;

      const newOptions = {
        ...orderData.service_options,
        floor_option_fee: 0,
        ladder_option_fee: 0,
        special_vehicle_fee: 0,
        [idKey]: option.id,
        [feeKey]: option.fee || 0,
        [nameKey]: option.label,
        total_option_fee: getTotalPrice() + (option.fee || 0)
      };

      await updateOrderData({
        service_options: newOptions
      });
    } catch (error) {
      console.error('Error updating options:', error);
    }
  };

  const getSelectedOptionLabel = (type: OptionType): string => {
    if (!options) return '';

    const key = getOptionKey(type);
    const optionId = orderData.service_options?.[key];
    if (!optionId) return '선택되지 않음';

    const optionsList = {
      floor: options.floor_options,
      ladder: options.ladder_options,
      special_vehicle: options.special_vehicle_options
    }[type];

    const selectedOption = optionsList?.find(opt => String(opt.id) === String(optionId));
    return selectedOption ? selectedOption.label : '선택되지 않음';
  };

  const getSelectedOptionPrice = (type: OptionType): number => {
    if (!options) return 0;

    const key = getOptionKey(type);
    const optionId = orderData.service_options?.[key];
    if (!optionId) return 0;

    const optionsList = {
      floor: options.floor_options,
      ladder: options.ladder_options,
      special_vehicle: options.special_vehicle_options
    }[type];

    const selectedOption = optionsList?.find(opt => String(opt.id) === String(optionId));
    return selectedOption?.fee || 0;
  };

  const getTotalPrice = (): number => {
    return ['floor', 'ladder', 'special_vehicle'].reduce(
      (total, type) => total + getSelectedOptionPrice(type as OptionType),
      0
    );
  };

  if (loading) return <Container>로딩 중...</Container>;
  if (error) return <Container>{error}</Container>;
  if (!options) return <Container>옵션을 불러올 수 없습니다.</Container>;

  return (
    <Container>
      <SelectedOptionsContainer>
        <SelectedOptionsTitle>선택된 서비스 옵션</SelectedOptionsTitle>
        <SelectedOptionsList>
          <SelectedOptionItem>
            <OptionLabel>층수 옵션</OptionLabel>
            <OptionValue>
              {getSelectedOptionLabel('floor')}
              {getSelectedOptionPrice('floor') > 0 && (
                <OptionPrice>+{getSelectedOptionPrice('floor').toLocaleString()}원</OptionPrice>
              )}
            </OptionValue>
          </SelectedOptionItem>
          <SelectedOptionItem>
            <OptionLabel>사다리차</OptionLabel>
            <OptionValue>
              {getSelectedOptionLabel('ladder')}
              {getSelectedOptionPrice('ladder') > 0 && (
                <OptionPrice>+{getSelectedOptionPrice('ladder').toLocaleString()}원</OptionPrice>
              )}
            </OptionValue>
          </SelectedOptionItem>
          <SelectedOptionItem>
            <OptionLabel>특수 차량</OptionLabel>
            <OptionValue>
              {getSelectedOptionLabel('special_vehicle')}
              {getSelectedOptionPrice('special_vehicle') > 0 && (
                <OptionPrice>+{getSelectedOptionPrice('special_vehicle').toLocaleString()}원</OptionPrice>
              )}
            </OptionValue>
          </SelectedOptionItem>
          <TotalPriceItem>
            <TotalPriceLabel>총 추가 비용</TotalPriceLabel>
            <TotalPriceValue>{getTotalPrice().toLocaleString()}원</TotalPriceValue>
          </TotalPriceItem>
        </SelectedOptionsList>
      </SelectedOptionsContainer>

      <OptionsGrid>
        {options?.floor_options.map(option => (
          <OptionCard
            key={option.id}
            selected={String(orderData.service_options?.floor_option_id) === String(option.id)}
            onClick={() => handleOptionSelect(option, 'floor')}
          >
            <OptionTitle>{option.label} (필수)</OptionTitle>
            <OptionDescription>{option.description}</OptionDescription>
            <OptionDescription>
              {option.fee ? `${option.fee.toLocaleString()}원` : '무료'}
            </OptionDescription>
          </OptionCard>
        ))}
      </OptionsGrid>

      <OptionsGrid>
        {options?.ladder_options.map(option => (
          <OptionCard
            key={option.id}
            selected={String(orderData.service_options?.ladder_option_id) === String(option.id)}
            onClick={() => handleOptionSelect(option, 'ladder')}
          >
            <OptionTitle>{option.label}</OptionTitle>
            <OptionDescription>{option.description}</OptionDescription>
            <OptionDescription>
              {option.fee ? `${option.fee.toLocaleString()}원` : '협의 필요'}
            </OptionDescription>
          </OptionCard>
        ))}
      </OptionsGrid>
    </Container>
  );
};

export default ServiceOptionsStep;