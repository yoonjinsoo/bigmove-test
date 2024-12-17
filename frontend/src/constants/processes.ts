export interface Process {
  readonly icon: string;
  readonly title: string;
  readonly description: string;
}

export const PROCESSES: readonly Process[] = [
  { 
    icon: 'fas fa-box', 
    title: '물품 선택', 
    description: '이동할 물품을 선택하세요' 
  },
  {
    icon: 'fas fa-calendar-alt',
    title: '날짜 선택',
    description: '원하는 이동 날짜를 선택하세요',
  },
  { 
    icon: 'fas fa-calculator', 
    title: '견적 확인', 
    description: '정확한 견적을 즉시 확인하세요' 
  },
  {
    icon: 'fas fa-check-circle',
    title: '결제 완료',
    description: '간편하게 결제하고 서비스를 예약하세요',
  },
] as const;
