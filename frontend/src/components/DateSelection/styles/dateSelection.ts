import styled from 'styled-components';

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  display: grid;
  grid-template-columns: 2fr 1px 1fr;
  gap: 2rem;
`;

export const Title = styled.h2`
  color: var(--cyan);
  font-size: 2rem;
  text-align: center;
  margin-bottom: 2rem;
`;

export const StyledCalendarWrapper = styled.div`
  .react-calendar {
    width: 100%;
    background: var(--dark-gray);
    border: 1px solid var(--gray-300);
    border-radius: 8px;
    padding: 1rem;

    .react-calendar__navigation {
      display: flex;
      margin-bottom: 1rem;

      button {
        min-width: 36px;
        background: none;
        border: none;
        padding: 8px;
        font-size: 1.2rem;
        color: var(--text);

        &:disabled {
          opacity: 0.5;
        }

        &:enabled:hover {
          background-color: var(--gray-700);
        }
      }

      .react-calendar__navigation__label {
        font-weight: bold;
        font-size: 1rem;
      }
    }

    .react-calendar__month-view__weekdays {
      text-align: center;
      text-transform: none;
      font-weight: 500;
      font-size: 0.9rem;
      color: var(--text);
      padding: 8px 0;

      abbr {
        text-decoration: none;
        cursor: default;
      }
    }

    .react-calendar__tile {
      padding: 10px;
      background: none;
      text-align: center;
      line-height: 1;
      font-size: 0.9rem;
      color: var(--text);
      transition: all 0.2s ease;

      &:disabled {
        color: var(--gray-600);
      }

      &:enabled:hover {
        background-color: var(--gray-700);
      }

      &--active {
        background-color: var(--cyan) !important;
        color: white !important;
      }

      &--now {
        color: var(--cyan);
        font-weight: bold;
      }

      &.booked-date {
        position: relative;
        color: var(--gray-600);

        &::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(255, 0, 0, 0.1);
          pointer-events: none;
        }
      }

      &.past-date {
        color: var(--gray-600);
      }
    }

    .react-calendar__month-view__days__day--weekend {
      &:nth-child(7n) {
        color: #4a9eff;
      }
      &:nth-child(7n + 1) {
        color: #ff6b6b;
      }
    }
  }
`;

export const Divider = styled.div`
  width: 1px;
  background-color: var(--gray-300);
`;

export const TimeSelectionContainer = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const TimeSelectGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const TimeLabel = styled.label`
  color: var(--text);
  font-weight: 500;
`;

export const TimeSelect = styled.select`
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--cyan);
  background-color: var(--dark-gray);
  color: var(--text);
  margin-bottom: 2rem;
  width: 100%;

  &:disabled {
    opacity: 0.5;
  }
`;

export const Notice = styled.p`
  color: var(--gray-400);
  font-size: 0.9rem;
  text-align: center;
  margin-top: 2rem;
  grid-column: 1 / -1;
`;

export const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
  grid-column: 1 / -1;
`;

export const Button = styled.button<{ primary?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  background-color: ${(props) => (props.primary ? 'var(--cyan)' : '#666')};
  color: white;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
`;
