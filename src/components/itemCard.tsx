'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/src/contexts/cartContext';
import { useAuth } from '@/src/contexts/authContext';
import { useProfile } from '@/src/contexts/profileContext';
import ImageSlider from './ImageSlider';

interface ItemCardProps {
  item: {
    id: string;
    title: string;
    src: string;
    images?: string[];
    productUuid?: string;
  };
}

export default function ItemCard({ item }: ItemCardProps) {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'digital-signage';
  const { cart, dispatch } = useCart();
  const { user } = useAuth();
  const { profiles } = useProfile();

  // 미디어경관디자인 탭일 때만 rounded-lg와 간격 조정 적용
  const isMediaDisplayTab = currentTab === 'media-display';
  const isShoppingMallTab = currentTab === 'digital_products';

  // 체크박스 선택 여부 확인
  const isSelected = cart.some((cartItem) => cartItem.id === item.id);

  // 체크박스 클릭 핸들러
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSelected) {
      // 장바구니에서 제거
      dispatch({ type: 'REMOVE_ITEM', id: item.id });
    } else {
      // 장바구니에 추가 (상담신청)
      const defaultProfile = profiles.find((profile) => profile.is_default);

      const cartItem = {
        id: item.id,
        type: 'digital-product' as const,
        name: item.title,
        district: '', // 디지털미디어 쇼핑몰 상품은 district가 없음
        price: 0, // 상담신청이므로 가격 0
        // 상담 중복 방지를 위한 공통 키 (쇼핑몰은 리스트 상품 id 기준)
        consultationKey: `digital_product:${item.id}`,
        // 사용자 프로필 정보 추가
        contact_person_name: defaultProfile?.contact_person_name,
        phone: defaultProfile?.phone,
        company_name: defaultProfile?.company_name,
        email: defaultProfile?.email,
        user_profile_id: defaultProfile?.id,
        user_auth_id: defaultProfile?.user_auth_id || user?.id,
        digitalProductUuid: item.productUuid,
      };

      dispatch({
        type: 'ADD_ITEM',
        item: cartItem,
      });
    }
  };

  // 이미지 클릭 핸들러 (상세페이지로 이동)
  const handleImageClick = (e: React.MouseEvent) => {
    // 체크박스 영역이 아닐 때만 상세페이지로 이동
    const target = e.target as HTMLElement;
    if (target.closest('.checkbox-container')) {
      return;
    }
    // Link 컴포넌트가 자동으로 처리하므로 여기서는 아무것도 하지 않음
  };

  return (
    <div className="relative">
      <Link
        href={`/digital-media/${item.id}?tab=${currentTab}`}
        className={`bg-white border-solid border-gray-200 border-1 flex flex-col items-center justify-center hover:opacity-80 transition-opacity w-[23rem] h-full ${
          isMediaDisplayTab ? 'rounded-lg' : ''
        } ${
          isSelected && isShoppingMallTab
            ? 'border-[#238CFA] border-[0.3rem]'
            : ''
        }`}
        onClick={handleImageClick}
      >
        <div className="flex flex-col items-start justify-center w-full h-full relative">
          {/* 체크박스 컨테이너 (쇼핑몰 탭일 때만 표시) */}
          {isShoppingMallTab && (
            <div
              className="checkbox-container absolute top-3 right-3 z-10 cursor-pointer"
              onClick={handleCheckboxClick}
            >
              <div
                className={`flex items-center justify-center w-7 h-7 rounded-md border transition-colors duration-150 shadow-md backdrop-blur-md ${
                  isSelected
                    ? 'border-[#238CFA] bg-[rgba(35,140,250,0.08)]'
                    : 'border-gray-600 border-[0.1rem] '
                }`}
              >
                {isSelected ? (
                  <Image
                    src="/images/blue-check.png"
                    alt="선택됨"
                    width={16}
                    height={16}
                    className="w-4 h-4"
                  />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-[0.25rem] border border-gray-300 bg-white"></div>
                )}
              </div>
            </div>
          )}

          <div className="object-cover flex-1 w-full flex items-center justify-center">
            {item.images ? (
              <ImageSlider images={item.images} alt={item.title} />
            ) : (
              <Image
                src={item.src}
                alt={item.title}
                width={1400}
                height={1400}
                className="lg:w-full lg:h-full object-cover md:w-[15rem] md:h-[15rem] sm:w-[15rem] sm:h-[15rem] flex items-center justify-center"
              />
            )}
          </div>
          <div className="text-xl font-bold text-black line-clamp-2 pl-10 py-7">
            {item.title}
          </div>
        </div>
      </Link>
    </div>
  );
}
