import React from 'react';
import styled from 'styled-components';
import { FaClock } from 'react-icons/fa';
import { TimeSelectGroup, TimeLabel, TimeSelect } from '../styles/dateSelection';
import LoadingSpinner from '../../common/LoadingSpinner';
import { TimeSlotOption } from '../types';

const SmallSpinner = styled(LoadingSpinner)`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
`;

const TimeIcon = styled(FaClock)`
  font-size: 1.2rem;
`;

const TimeTitle = styled.h3`
  font-size: 1.2rem;
  margin: 0;
`;

const TimeSelectionContainer = styled.div`
  padding: 2rem;
  background: var(--darkGray);
  border-radius: 8px;
  transition: opacity 0.3s ease-in-out;
`;

interface TimeSelectorProps {
  loadingTime: string | null;
  unloadingTime: string | null;
  availableLoadingTimes: TimeSlotOption[];
  availableUnloadingTimes: TimeSlotOption[];
  onTimeSelect: (type: 'loading' | 'unloading', time: string) => void;
  isNextDisabled: boolean;
  loading?: boolean;
}

const TimeSelector: React.FC<TimeSelectorProps> = ({
  loadingTime,
  unloadingTime,
  availableLoadingTimes,
  availableUnloadingTimes,
  onTimeSelect,
  isNextDisabled,
  loading = false,
}) => (
  <TimeSelectionContainer>
    <TimeSelectGroup>
      <TimeLabel>상차 시간</TimeLabel>
      <TimeSelect
        value={loadingTime || ''}
        onChange={(e) => onTimeSelect('loading', e.target.value)}
        disabled={loading}
      >
        <option value="">시간을 선택하세요</option>
        {!loading &&
          availableLoadingTimes.map((time) => (
            <option key={time.value} value={time.value}>
              {time.label}
            </option>
          ))}
      </TimeSelect>
      {loading && <SmallSpinner size="small" />}
    </TimeSelectGroup>

    <TimeSelectGroup>
      <TimeLabel>하차 시간</TimeLabel>
      <TimeSelect
        value={unloadingTime || ''}
        onChange={(e) => onTimeSelect('unloading', e.target.value)}
        disabled={!loadingTime}
      >
        <option value="">시간을 선택하세요</option>
        {availableUnloadingTimes.map((time) => (
          <option key={time.value} value={time.value} disabled={!time.available}>
            {time.label}
          </option>
        ))}
      </TimeSelect>
    </TimeSelectGroup>
  </TimeSelectionContainer>
);

export default React.memo(TimeSelector);