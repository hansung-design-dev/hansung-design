// 공공디자인 로컬 데이터
// 분류별로 정리하고 리스트용/디테일페이지용 이미지 분리

export interface PublicDesignCategory {
  id: number;
  name: string;
  description: string;
  listImage: string[]; // 리스트용 이미지들
  detailImages: string[]; // 디테일페이지용 이미지들
}

export const publicDesignCategories: PublicDesignCategory[] = [
  {
    id: 1,
    name: '간판개선사업',
    description: '도시 경관을 아름답게 만드는 간판 개선 프로젝트',
    listImage: [
      '/images/public-design/banner_improvment/2018/당진/list/02.jpg',
      '/images/public-design/banner_improvment/2018/당진/list/04.jpg',
    ],
    detailImages: [
      '/images/public-design/banner_improvment/2018/당진/detail/01.jpg',
      '/images/public-design/banner_improvment/2018/당진/detail/03.jpg',
      '/images/public-design/banner_improvment/2018/당진/detail/05.jpg',
    ],
  },
  {
    id: 2,
    name: '환경개선사업',
    description: '도시 환경을 개선하는 공공디자인 프로젝트',
    listImage: [
      '/images/public-design/env_improvememt/사당4동 가로환경개선/03.jpg',
      '/images/public-design/env_improvememt/사당4동 가로환경개선/05.jpg',
    ],
    detailImages: [
      '/images/public-design/env_improvememt/사당4동 가로환경개선/01.jpg',
      '/images/public-design/env_improvememt/사당4동 가로환경개선/02.jpg',
      '/images/public-design/env_improvememt/사당4동 가로환경개선/04.jpg',
    ],
  },
];

export const getCategoryById = (
  categoryId: string
): PublicDesignCategory | undefined => {
  return publicDesignCategories.find(
    (category) => category.id === parseInt(categoryId)
  );
};
