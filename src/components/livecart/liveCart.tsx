import { useCart } from '@/src/contexts/cartContext';
import { useAuth } from '@/src/contexts/authContext';
import { Button } from '../button/button';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function LiveCart() {
  const { cart, dispatch } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [expanded, setExpanded] = useState(false);

  // 상담신청 아이템과 일반 아이템 분리
  const regularItems = cart.filter((item) => item.price !== 0);
  const hasRegularItems = regularItems.length > 0;

  const getPanelTypeLabel = (panelType?: string) => {
    if (!panelType) return '현수막게시대';

    switch (panelType) {
      case 'multi_panel':
        return '연립형';
      case 'lower_panel':
        return '저단형';
      case 'bulletin_board':
        return '시민게시대';
      case 'citizen-board':
        return '시민/문화게시대';
      case 'with_lighting':
        return '조명형';
      case 'no_lighting':
        return '비조명형';
      case 'semi-auto':
        return '반자동';
      case 'panel':
        return '패널형';
      case 'led':
        return 'LED전자게시대';
      case 'top_fixed':
        return '상단광고';
      default:
        return '현수막게시대';
    }
  };
  // 디버깅용: cart 배열 상태 확인
  console.log('🔍 Cart state in LiveCart:', cart);
  console.log('🔍 Cart length in LiveCart:', cart.length);

  // 상단광고 아이템 디버깅
  cart.forEach((item, index) => {
    if (
      item.panel_type === 'top_fixed' ||
      item.panel_slot_snapshot?.banner_type === 'top_fixed'
    ) {
      console.log(`🔍 상단광고 아이템 ${index}:`, {
        id: item.id,
        name: item.name,
        panel_type: item.panel_type,
        panel_slot_snapshot: item.panel_slot_snapshot,
        type: item.type,
        district: item.district,
        price: item.price,
      });
    }
  });

  // 남은 시간 계산 (일반 아이템이 있을 때만)
  useEffect(() => {
    if (!hasRegularItems) {
      setTimeLeft('');
      return;
    }

    const calculateTimeLeft = () => {
      const stored = localStorage.getItem('hansung_cart');
      if (!stored) return;

      try {
        const cartState = JSON.parse(stored);
        const now = Date.now();
        const timeElapsed = now - cartState.lastUpdated;
        const timeRemaining = 15 * 60 * 1000 - timeElapsed; // 15분 - 경과시간

        if (timeRemaining <= 0) {
          setTimeLeft('만료됨');
          return;
        }

        const minutes = Math.floor(timeRemaining / (1000 * 60));
        setTimeLeft(`${minutes}분`);
      } catch (error) {
        console.error('Error calculating time left:', error);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000); // 1분마다 업데이트

    return () => clearInterval(interval);
  }, [cart.length, hasRegularItems]);

  if (cart.length === 0) return null;

  const handleCartClick = () => {
    // 로그인하지 않은 경우 로그인 페이지로 이동
    if (!user) {
      router.push('/signin');
      return;
    }

    // 로그인된 경우 장바구니 페이지로 이동
    router.push('/cart');
  };

  const handleDirectApply = () => {
    // 바로 신청하기 로직
    console.log('바로 신청하기:', cart);
    // 여기에 신청 로직 구현
  };

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white shadow-lg z-50 flex flex-col">
      <div
        className={`bottom-8 left-0 w-full bg-white shadow-lg z-50 flex sm:flex-col md:flex-row transition-all duration-300 ${
          expanded ? 'h-[25rem]' : 'h-[12rem]'
        } sm:h-auto md:justify-center lg:justify-center`}
      >
        {/* 장바구니 */}
        <div className={`relative ${expanded ? 'h-[35rem]' : 'h-[12rem]'}`}>
          {/* Arrow-up 버튼 */}
          <button
            className="absolute top-2 left-1/2 -translate-x-1/2 z-10 bg-white rounded-full p-1 shadow-md hover:bg-gray-50 transition-colors"
            onClick={() => setExpanded(!expanded)}
          >
            <Image
              src="/svg/arrow-up.svg"
              alt="더보기"
              width={20}
              height={20}
              className={`transition-transform duration-300 ${
                expanded ? 'rotate-180' : ''
              }`}
            />
          </button>
          <div
            className={`lg:w-[40rem] sm:w-full flex flex-col gap-2 overflow-y-auto py-6 sm:py-4 sm:px-4 h-full`}
          >
            {/* 남은 시간 표시 (일반 아이템이 있을 때만) */}
            {hasRegularItems && (
              <div className="text-sm text-red-500 font-medium mb-2">
                ⏰ 장바구니 만료까지: {timeLeft}
              </div>
            )}
            {cart.map((item) => {
              return (
                <div
                  key={item.id}
                  className="mb-2 flex items-center justify-between"
                >
                  <div className="flex flex-col gap-2">
                    <div>
                      <span className="mr-2 text-gray-600 font-medium text-sm">
                        no.{item.panel_code}
                      </span>
                      <span className="mr-2">{item.name}</span>
                      <span className="font-bold mr-2">
                        ({getPanelTypeLabel(item.panel_type)}
                        {item.district === '서대문구' &&
                          item.is_for_admin &&
                          '-행정용패널'}
                        )
                      </span>
                      {/* LED 전자게시대가 아닌 경우에만 상하반기 정보 표시 */}
                      {item.halfPeriod && item.type !== 'led-display' && (
                        <span className="ml-2 text-sm text-blue-600 font-medium">
                          {item.halfPeriod === 'first_half'
                            ? '상반기'
                            : '하반기'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">{item.district}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Button
                      size="sm"
                      className="ml-auto text-red-500 p-0 bg-transparent border-none hover:cursor-pointer"
                      onClick={() =>
                        dispatch({ type: 'REMOVE_ITEM', id: item.id })
                      }
                    >
                      <Image
                        src="/svg/x.svg"
                        alt="delete"
                        width={20}
                        height={20}
                      />
                    </Button>
                    <span className="mr-2">
                      {item.price === 0
                        ? '상담문의'
                        : `${item.price.toLocaleString()}원`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 장바구니 버튼 */}
        <div
          className={`lg:w-[27rem] flex lg:flex-col md:flex-col sm:flex-row justify-center items-center p-6 sm:p-4 gap-2 ${
            expanded ? 'h-[35rem]' : 'h-[15rem]'
          }`}
        >
          <Button
            size="cart"
            variant="outlinedBlack"
            color="black"
            className=""
            onClick={handleCartClick}
          >
            장바구니로 가기
          </Button>
          <Button
            size="cart"
            variant="filledBlack"
            color="black"
            className=""
            onClick={handleDirectApply}
          >
            게시대 바로 신청하기
          </Button>
        </div>
      </div>
      {/* 최근 방문한 사람*/}
      <div className="h-[2rem] bg-[#E6E6E6] flex items-center justify-center py-3 text-1.5 md:text-1.25 font-weight-700 sm:text-0.875 sm:font-weight-500">
        <div>최근 방문한 사람이 20명 이에요.</div>
      </div>
    </div>
  );
}
