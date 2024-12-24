import React, { useState, useEffect, memo, useCallback } from 'react';
import styled from 'styled-components';
import { calculateDistance, initializeKakaoMap, searchAddress, KakaoAddressResult } from '../../services/kakaoMapService';
import { debounce } from 'lodash';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdArrowForward } from 'react-icons/md';
import { ButtonContainer, Button } from '../../pages/styles/SelectionSummaryStyles';
import axios from 'axios';
import useOrderStore from '../../store/orderStore';  // orderStore import 추가

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

interface AddressStepProps {
  // No props
}

const Container = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background-color: transparent;
`;

const AddressContainer = styled.div`
  margin-bottom: 2rem;
  position: relative;
`;

const FromAddressContainer = styled(AddressContainer)`
  position: relative;
  z-index: 3;
`;

const ToAddressContainer = styled(AddressContainer)`
  position: relative;
  z-index: 2;
`;

const SearchInputContainer = styled.div`
  position: relative;
`;

const Label = styled.label`
  display: block;
  color: var(--cyan);
  margin-bottom: 0.8rem;
  font-size: 1.1rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  background-color: var(--dark-gray);
  border: 1px solid var(--cyan);
  border-radius: 8px;
  color: var(--text-light);
  font-size: 1rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(64, 224, 208, 0.3);
  }

  &::placeholder {
    color: #999;
  }
`;

const DetailInput = styled(Input)`
  margin-top: 1rem;
  background-color: var(--darker-gray);

  &::placeholder {
    color: #999;
  }
`;

const CompleteButton = styled.button<{ completed?: boolean }>`
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: ${props => props.completed ? 'var(--darker-gray)' : 'var(--cyan)'};
  color: ${props => props.completed ? '#999' : '#F5F5F5'};
  border: 1px solid rgba(79, 209, 197, 0.2);
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.completed ? 'var(--cyan)' : 'var(--cyan-dark)'};
    color: #F5F5F5;
  }

  &:disabled {
    background-color: var(--gray);
    border: 1px solid rgba(79, 209, 197, 0.2);
    color: var(--dark-gray);
    cursor: not-allowed;
  }
`;

const DistanceInfo = styled.div`
  margin: 2rem 0;
  padding: 1.5rem;
  background-color: rgba(79, 209, 197, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(79, 209, 197, 0.2);

  div {
    margin-bottom: 0.5rem;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
`;

const AdditionalInfo = styled.div`
  font-size: 0.8rem;
  color: #999;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(79, 209, 197, 0.2);
`;

const SearchResults = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  list-style: none;
  padding: 0;
  margin: 0;
  background-color: var(--dark-gray);
  border: 1px solid var(--darker-gray);
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
`;

const SearchResultItem = styled.li`
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  background-color: var(--dark-gray);
  display: flex;
  flex-direction: column;
  gap: 0.2rem;

  .place-name {
    color: var(--cyan);
    font-size: 0.9rem;
  }

  .building-name {
    color: var(--cyan);
    font-size: 0.9rem;
  }

  .address {
    color: var(--text-light);
  }

  &:hover {
    background-color: var(--darker-gray);
  }
`;

const LoadingSpinner = styled.div`
  border: 3px solid rgba(79, 209, 197, 0.1);
  border-left-color: var(--cyan);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
  margin: 1rem auto;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

interface SearchResultListProps {
  results: KakaoAddressResult[];
  onSelect: (result: KakaoAddressResult, isFrom: boolean) => void;
  isFrom: boolean;
}

const SearchResultList = memo(function SearchResultList({ results, onSelect, isFrom }: SearchResultListProps) {
  return (
    <SearchResults>
      {results.map((result, index) => (
        <SearchResultItem
          key={index}
          onClick={() => onSelect(result, isFrom)}
        >
          {result.place_name && (
            <span className="place-name">{result.place_name}</span>
          )}
          {result.building_name && (
            <span className="building-name">{result.building_name}</span>
          )}
          <span className="address">{result.address_name}</span>
        </SearchResultItem>
      ))}
    </SearchResults>
  );
});

const AddressStep: React.FC<AddressStepProps> = () => {
  const { updateOrderData } = useOrderStore();  // orderStore 추가
  const [fromAddress, setFromAddress] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [fromDetailAddress, setFromDetailAddress] = useState('');
  const [toDetailAddress, setToDetailAddress] = useState('');
  const [fromAddressCompleted, setFromAddressCompleted] = useState(false);
  const [toAddressCompleted, setToAddressCompleted] = useState(false);
  const [showFromDetailAddress, setShowFromDetailAddress] = useState(false);
  const [showToDetailAddress, setShowToDetailAddress] = useState(false);
  const [selectedFromAddress, setSelectedFromAddress] = useState<KakaoAddressResult | null>(null);
  const [selectedToAddress, setSelectedToAddress] = useState<KakaoAddressResult | null>(null);
  const [distance, setDistance] = useState<number>(0);
  const [additionalFee, setAdditionalFee] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const navigate = useNavigate();
  const [isKakaoInitialized, setIsKakaoInitialized] = useState(false);
  const [fromSearchResults, setFromSearchResults] = useState<KakaoAddressResult[]>([]);
  const [toSearchResults, setToSearchResults] = useState<KakaoAddressResult[]>([]);
  const [showToAddress, setShowToAddress] = useState(false);

  // 카카오맵 초화
  useEffect(() => {
    const initKakao = async () => {
      try {
        await initializeKakaoMap();
        setIsKakaoInitialized(true);
      } catch (error) {
        console.error('카카오맵 초기화 실패:', error);
      }
    };
    initKakao();
  }, []);

  // 주소 검색 핸들러
  const handleSearch = useCallback(async (query: string, isFrom: boolean) => {
    if (!query.trim() || !isKakaoInitialized) return;
    
    try {
      const results = await searchAddress(query);
      console.log('검색 결과:', results); // 응답 확인

      if (isFrom) {
        setFromSearchResults(results);
      } else {
        setToSearchResults(results);
      }
    } catch (error) {
      console.error('주소 검색 실패:', error);
    }
  }, [isKakaoInitialized]);

  // 주소 선택 핸들러
  const handleAddressSelect = useCallback(async (result: KakaoAddressResult, isFrom: boolean) => {
    try {
      if (isFrom) {
        setFromAddress(result.address_name);
        setSelectedFromAddress(result);
        setFromSearchResults([]);
        setShowFromDetailAddress(true);  // 주소 선택 시 상세주소 입력 칸 표시
      } else {
        setToAddress(result.address_name);
        setSelectedToAddress(result);
        setToSearchResults([]);
        setShowToDetailAddress(true);  // 주소 선택 시 상세주소 입력 칸 표시
      }
    } catch (error) {
      console.error('Error handling address selection:', error);
    }
  }, []);

  // 주소 초기화 핸들러
  const handleFromAddressReset = () => {
    setFromAddress('');
    setFromDetailAddress('');
    setFromAddressCompleted(false);
    setFromSearchResults([]);
    setSelectedFromAddress(null);
    setShowFromDetailAddress(false);
    if (toAddressCompleted) {
      setDistance(0);
      setAdditionalFee(0);
    }
  };

  const handleToAddressReset = () => {
    setToAddress('');
    setToDetailAddress('');
    setToAddressCompleted(false);
    setToSearchResults([]);
    setSelectedToAddress(null);
    setShowToDetailAddress(false);
    setDistance(0);
    setAdditionalFee(0);
  };

  // 주소 완료 버튼 활성화 조건
  const isFromAddressButtonEnabled = selectedFromAddress && fromDetailAddress.trim() !== '';
  const isToAddressButtonEnabled = selectedToAddress && toDetailAddress.trim() !== '';

  const calculateDistanceAndFee = async () => {
    try {
      const calculatedDistance = await calculateDistance(fromAddress, toAddress);
      setDistance(calculatedDistance);
      
      if (calculatedDistance > 50) {
        setAdditionalFee(calculatedDistance * 1000);
      }
    } catch (error) {
      console.error('Failed to process address information:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <Container>
      <FromAddressContainer>
        <Label>출발지(상차지) 주소</Label>
        <SearchInputContainer>
          <Input
            value={fromAddress}
            onChange={(e) => {
              if (!fromAddressCompleted) {
                setFromAddress(e.target.value);
                handleSearch(e.target.value, true);
                setSelectedFromAddress(null);
                setShowFromDetailAddress(false);  // 새로운 주소 입력 시 상세주소 입력 칸 숨김
              }
            }}
            placeholder="출발지 주소를 입력하세요 (도로명 또는 지번 주소)"
            disabled={fromAddressCompleted}
          />
          {fromSearchResults.length > 0 && !fromAddressCompleted && (
            <SearchResultList 
              results={fromSearchResults}
              onSelect={handleAddressSelect}
              isFrom={true}
            />
          )}
        </SearchInputContainer>
        
        {showFromDetailAddress && (  // 주소 선택 시에만 상세주소 입력 칸 표시
          <>
            <DetailInput
              value={fromDetailAddress}
              onChange={(e) => setFromDetailAddress(e.target.value)}
              placeholder="상세주소를 입력하세요 (예: 2층 203호)"
              disabled={fromAddressCompleted}
            />
            <CompleteButton
              onClick={() => {
                if (fromAddressCompleted) {
                  // 다시 입력하기 클릭 시
                  handleFromAddressReset();  // 출발지 주소 초기화
                } else if (isFromAddressButtonEnabled) {
                  // 처음 완료 버튼 클릭 시
                  setFromAddressCompleted(true);
                  setShowToAddress(true);
                }
              }}
              disabled={!isFromAddressButtonEnabled && !fromAddressCompleted}
              completed={fromAddressCompleted}
            >
              {fromAddressCompleted ? "다시 입력하기" : "출발지 주소 입력 완료"}
            </CompleteButton>
          </>
        )}
      </FromAddressContainer>

      {showToAddress && (
        <ToAddressContainer>
          <Label>도착지(하차지) 주소</Label>
          <SearchInputContainer>
            <Input
              value={toAddress}
              onChange={(e) => {
                if (!toAddressCompleted) {
                  setToAddress(e.target.value);
                  handleSearch(e.target.value, false);
                  setSelectedToAddress(null);
                  setShowToDetailAddress(false);  // 새로운 주소 입력 시 상세주소 입력 칸 숨김
                }
              }}
              placeholder="도착지 주소를 입력하세요 (도로명 또는 지번 주소)"
              disabled={toAddressCompleted}
            />
            {toSearchResults.length > 0 && !toAddressCompleted && (
              <SearchResultList 
                results={toSearchResults}
                onSelect={handleAddressSelect}
                isFrom={false}
              />
            )}
          </SearchInputContainer>
          
          {showToDetailAddress && (  // 주소 선택 시에만 상세주소 입력 칸 표시
            <>
              <DetailInput
                value={toDetailAddress}
                onChange={(e) => setToDetailAddress(e.target.value)}
                placeholder="상세주소를 입력하세요 (예: 지하 1층)"
                disabled={toAddressCompleted}
              />
              <CompleteButton
                onClick={() => {
                  if (toAddressCompleted) {
                    // 다시 입력하기 클릭 시
                    handleToAddressReset();  // 도착지 주소 초기화
                  } else if (isToAddressButtonEnabled) {
                    // 처음 완료 버튼 클릭 시
                    setToAddressCompleted(true);
                    calculateDistanceAndFee();
                  }
                }}
                disabled={!isToAddressButtonEnabled && !toAddressCompleted}
                completed={toAddressCompleted}
              >
                {toAddressCompleted ? "다시 입력하기" : "도착지 주소 입력 완료"}
              </CompleteButton>
            </>
          )}
        </ToAddressContainer>
      )}

      {distance > 0 && !isCalculating && (
        <DistanceInfo>
          <div>총 이동거리 : {distance.toFixed(1)}km</div>
          <div>기본 거리(10km이내) : 추가요금 없음(0원)</div>
          {distance > 10 && (
            <>
              <div>추가거리 : {(distance - 10).toFixed(1)}km</div>
              <div>추가요금 : {((distance - 10) * 2000).toLocaleString()}원</div>
              <AdditionalInfo>
                10km를 초과한 거리에 대해 1km당 2,000원의 추가요금이 발생됩니다.
              </AdditionalInfo>
            </>
          )}
        </DistanceInfo>
      )}

      <ButtonContainer>
        <Button onClick={() => navigate(-1)}>
          <MdArrowBack size={16} /> 이전으로
        </Button>
        <Button 
          primary
          disabled={!fromAddressCompleted || !toAddressCompleted}
          onClick={() => {
            // orderStore에 주소 정보 저장
            updateOrderData({
              addresses: {
                from_address: fromAddress,
                from_detail_address: fromDetailAddress,
                to_address: toAddress,
                to_detail_address: toDetailAddress,
                distance: distance,
                base_distance: 10,
                additional_distance: distance > 10 ? distance - 10 : 0,
                distance_fee: distance > 10 ? (distance - 10) * 2000 : 0
              }
            });

            navigate('/service-options');
          }}
        >
          다음으로 <MdArrowForward size={16} />
        </Button>
      </ButtonContainer>
      {isCalculating && <LoadingSpinner />}
    </Container>
  );
};

export default AddressStep;

