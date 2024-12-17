import React, { useState } from 'react';
import styled from 'styled-components';
import { searchAddress, KakaoAddressResult } from '../../services/kakaoMapService';

const SearchInput = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid var(--cyan);
  border-radius: 4px;
  background-color: var(--dark-gray);
  color: white;
`;

const SearchResults = styled.ul`
  position: absolute;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  background-color: var(--dark-gray);
  border: 1px solid var(--cyan);
  border-top: none;
  border-radius: 0 0 4px 4px;
  z-index: 1000;
`;

const SearchResultItem = styled.li`
  padding: 10px;
  cursor: pointer;
  &:hover {
    background-color: rgba(79, 209, 197, 0.1);
  }
`;

interface Props {
  onSelect: (address: KakaoAddressResult) => void;
  placeholder: string;
}

const AddressSearchInput: React.FC<Props> = ({ onSelect, placeholder }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<KakaoAddressResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      const addresses = await searchAddress(query);
      setResults(addresses);
    } catch (error) {
      console.error('주소 검색 실패:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div>
      <SearchInput
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        placeholder={isSearching ? '검색 중...' : placeholder}
        disabled={isSearching}
      />
      {results.length > 0 && (
        <SearchResults>
          {results.map((result, index) => (
            <SearchResultItem
              key={index}
              onClick={() => {
                onSelect(result);
                setResults([]);
                setQuery(result.address_name);
              }}
            >
              {result.address_name}
            </SearchResultItem>
          ))}
        </SearchResults>
      )}
    </div>
  );
};

export default AddressSearchInput; 