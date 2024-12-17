import { 
  FaBed, FaCouch, FaTv,
  FaTable, FaWarehouse,
  FaBicycle, FaBoxOpen,
  FaDumbbell, FaShower
} from 'react-icons/fa6';
import { 
  MdMonitor, MdChair, MdTableRestaurant,
  MdLaptopMac, MdLocalLaundryService,
  MdAir, MdKitchen, MdCleaningServices
} from 'react-icons/md';
import {
  GiSofa, GiClosedDoors, GiHanger,
  GiMirrorMirror, GiWindow, GiWashingMachine,
  GiKitchenTap, GiBlender, GiWaterTank,
  GiGasStove, GiKickScooter, GiWeightLiftingUp,
  GiPlantWatering, GiWoodenChair
} from 'react-icons/gi';

export const iconMap: { [key: string]: JSX.Element } = {
  '침대': <FaBed />,
  '쇼파': <FaCouch />,
  '옷장': <GiClosedDoors />,
  '행거': <GiHanger />,
  '수납장': <FaWarehouse />,
  '식탁': <MdTableRestaurant />,
  '화장대': <GiMirrorMirror />,
  '커튼': <GiWindow />,
  '거울': <GiMirrorMirror />,
  '책상': <MdTableRestaurant />,
  '의자': <MdChair />,
  '책장': <FaWarehouse />,
  'TV/모니터': <MdMonitor />,
  'PC/노트북': <MdLaptopMac />,
  '에어컨': <MdAir />,
  '세탁기': <GiWashingMachine />,
  '냉장고': <GiKitchenTap />,
  '건조기': <MdLocalLaundryService />,
  '공기청정기': <MdAir />,
  '의류관리기': <MdLocalLaundryService />,
  '청소기': <MdCleaningServices />,
  '식기세척기': <MdKitchen />,
  '음식물처리기': <MdKitchen />,
  '전자레인지': <GiBlender />,
  '정수기': <GiWaterTank />,
  '가스레인지': <GiGasStove />,
  '주방 테이블': <FaTable />,
  '식탁 의자': <MdChair />,
  '자전거': <FaBicycle />,
  '안마의자': <GiWoodenChair />,
  '캣타워': <FaWarehouse />,
  '유모차': <FaBoxOpen />,
  '빨래 건조대': <MdLocalLaundryService />
};

export const getItemIcon = (itemName: string) => {
  const baseItemName = Object.keys(iconMap).find(key => itemName.includes(key));
  return baseItemName ? iconMap[baseItemName] : <FaBoxOpen />;
}; 