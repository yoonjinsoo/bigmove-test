export interface Furniture {
  id: string;
  category: string;
  subcategory: string;
  name: string;
  description: string;
}

export interface FurnitureCategory {
  id: string;
  name: string;
  subcategories: string[];
}

export const categories: FurnitureCategory[] = [
  {
    id: 'bedroom-living',
    name: '침실/거실 가구',
    subcategories: ['침대', '쇼파', '옷장', '행거', '수납장', '식탁', '화장대', '커튼', '거울'],
  },
  {
    id: 'study',
    name: '서재가구',
    subcategories: ['책상', '의자', '책장'],
  },
  {
    id: 'digital-appliances',
    name: '디지털/생활가전',
    subcategories: [
      'TV/모니터',
      'PC/노트북',
      '에어컨',
      '세탁기',
      '냉장고',
      '건조기',
      '공기청정기',
      '의류관리기',
      '청소기',
    ],
  },
  {
    id: 'kitchen',
    name: '주방 가전/가구',
    subcategories: [
      '식기세척기',
      '음식물처리기',
      '정수기',
      '가스레인지',
      '주방 테이블',
      '식탁 의자',
    ],
  },
  {
    id: 'exercise-transport',
    name: '운동 및 이동수단',
    subcategories: ['자전거', '킥보드', '스쿠터', '전동차'],
  },
  {
    id: 'etc',
    name: '기타',
    subcategories: ['운동용품', '화분', '안마의자', '캣타워', '유모차', '빨래 건조대'],
  },
];
