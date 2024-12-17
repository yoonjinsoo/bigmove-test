import React from 'react';
import {
  FaBed,
  FaCouch,
  FaWarehouse,
  FaBoxOpen,
  FaBicycle,
  FaDumbbell,
  FaChair,
  FaTv,
} from 'react-icons/fa';
import {
  GiClosedDoors,
  GiHanger,
  GiMirrorMirror,
  GiWindow,
  GiWashingMachine,
  GiKitchenTap,
  GiBlender,
  GiWaterTank,
  GiGasStove,
  GiKickScooter,
  GiPlantWatering,
} from 'react-icons/gi';
import {
  MdTableRestaurant,
  MdMonitor,
  MdLaptopMac,
  MdAir,
  MdLocalLaundryService,
  MdKitchen,
  MdCleaningServices,
} from 'react-icons/md';

type IconMapType = {
  [key: string]: React.ReactElement;
};

export const iconMap: IconMapType = {
  // 침실/거실 가구
  침대: <FaBed />,
  쇼파: <FaCouch />,
  옷장: <GiClosedDoors />,
  행거: <GiHanger />,
  수납장: <FaWarehouse />,
  식탁: <MdTableRestaurant />,
  화장대: <GiMirrorMirror />,
  커튼: <GiWindow />,
  거울: <GiMirrorMirror />,

  // 디지털/생활가전
  TV: <FaTv />,
  모니터: <MdMonitor />,
  PC: <MdLaptopMac />,
  노트북: <MdLaptopMac />,
  에어컨: <MdAir />,
  세탁기: <GiWashingMachine />,
  냉장고: <GiKitchenTap />,
  건조기: <MdLocalLaundryService />,
  공기청정기: <MdAir />,
  의류관리기: <MdLocalLaundryService />,
  청소기: <MdCleaningServices />,

  // 주방 가전/가구
  식기세척기: <MdKitchen />,
  음식물처리기: <MdKitchen />,
  전자레인지: <GiBlender />,
  정수기: <GiWaterTank />,
  가스레인지: <GiGasStove />,

  // 운동 및 이동수단
  자전거: <FaBicycle />,
  킥보드: <GiKickScooter />,
  스쿠터: <GiKickScooter />,

  // 기타
  운동용품: <FaDumbbell />,
  화분: <GiPlantWatering />,
  안마의자: <FaChair />,
  '빨래 건조대': <MdLocalLaundryService />,
};

export const getItemIcon = (itemName: string): React.ReactElement => {
  const baseItemName = Object.keys(iconMap).find((key) => itemName.includes(key));
  return baseItemName ? iconMap[baseItemName] : <FaBoxOpen />;
};
