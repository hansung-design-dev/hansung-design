interface District {
  id: number;
  name: string;
  description: string;
  count: number;
  icon: string;
  size: string;
  sizeOfPeople: string;
  src: string;
  code: string;
}

const ledDistricts: District[] = [
  {
    id: 1,
    name: '전체',
    code: 'all',
    description: '울림픽대교 남단사거리 앞 외 3건',
    count: 4,
    icon: '/images/district-icon/all.svg',
    size: '1000x1000',
    sizeOfPeople: '10000',
    src: '/images/led/landing.png',
  },
  {
    id: 2,
    name: '강동구',
    code: 'gangdong',
    description: '울림픽대교 남단사거리 앞 외 3건',
    count: 4,
    icon: '/images/district-icon/gangdong-gu.png',
    size: '1000x1000',
    sizeOfPeople: '10000',
    src: '/images/led/landing.png',
  },
  {
    id: 3,
    name: '광진구',
    code: 'gwangjin',
    description: '서울대입구역 앞 외 3건',
    count: 4,
    icon: '/images/district-icon/gwangjin-gu.png',
    size: '1000x1000',
    sizeOfPeople: '10000',
    src: '/images/led/landing.png',
  },
  {
    id: 4,
    name: '관악구',
    code: 'gwanak',
    description: '서울대입구역 앞 외 3건',
    count: 4,
    icon: '/images/district-icon/gwanak-gu.png',
    size: '1000x1000',
    sizeOfPeople: '10000',
    src: '/images/led/landing.png',
  },
  {
    id: 5,
    name: '동작구',
    code: 'donjak',
    description: '홍대입구역 앞 외 5건',
    count: 6,
    icon: '/images/district-icon/dongjak-gu.png',
    size: '1000x1000',
    sizeOfPeople: '10000',
    src: '/images/led/landing.png',
  },
  {
    id: 6,
    name: '동대문구',
    code: 'dongdaemun',
    description: '울림픽대교 남단사거리 앞 외 3건',
    count: 4,
    icon: '/images/district-icon/dongdaemun-gu.png',
    size: '1000x1000',
    sizeOfPeople: '10000',
    src: '/images/led/landing.png',
  },
];
export default ledDistricts;
