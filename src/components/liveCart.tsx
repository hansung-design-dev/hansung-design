import { useCart } from '../contexts/cartContext';
import { Button } from './button/button';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function LiveCart() {
  const { cart, dispatch } = useCart();
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState<string>('');

  const getPanelTypeLabel = (panelType?: string) => {
    if (!panelType) return '현수막게시대';

    switch (panelType) {
      case 'multi-panel':
        return '연립형';
      case 'lower-panel':
        return '저단형';
      case 'bulletin-board':
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
      default:
        return '현수막게시대';
    }
  };
  // 디버깅용: cart 배열 상태 확인
  console.log('🔍 Cart state in LiveCart:', cart);
  console.log('🔍 Cart length in LiveCart:', cart.length);

  // 남은 시간 계산
  useEffect(() => {
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
  }, [cart.length]);

  if (cart.length === 0) return null;

  const handleCartClick = () => {
    // 라이브 장바구니를 일반 장바구니로 이동하지 않고,
    // 현재 장바구니 상태를 유지한 채 장바구니 페이지로 이동
    router.push('/cart');
  };

  const handleDirectApply = () => {
    // 바로 신청하기 로직
    console.log('바로 신청하기:', cart);
    // 여기에 신청 로직 구현
  };

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white shadow-lg z-50 flex flex-col">
      {/* 최근 방문한 사람*/}
      <div className="h-[2rem] bg-[#E6E6E6] flex items-center justify-center py-3 text-1.5 md:text-1.25 font-weight-700 sm:text-0.875 sm:font-weight-500">
        <div>최근 방문한 사람이 20명 이에요.</div>
      </div>
      <div className=" bottom-0 left-0 w-full bg-white shadow-lg z-50 flex sm:flex-col md:flex-row h-[16.9375rem] sm:h-auto md:justify-center  lg:justify-center">
        {/* 장바구니 */}
        <div className="h-[7rem] sm:h-auto p-6 sm:p-3 overflow-y-auto py-[3rem] sm:py-2 flex items-center sm:items-start ">
          <div className="lg:w-[30rem] sm:w-full flex flex-col gap-2 max-h-[13rem] sm:max-h-[10rem] overflow-y-auto py-6 sm:py-4 sm:px-4 ">
            {/* 남은 시간 표시 */}
            <div className="text-sm text-red-500 font-medium mb-2">
              ⏰ 장바구니 만료까지: {timeLeft}
            </div>
            {cart.map((item) => (
              <div
                key={item.id}
                className="mb-2 flex items-center justify-between"
              >
                <div className="flex flex-col gap-2">
                  <div>
                    <span className="mr-2">{item.name}</span>
                    <span className="font-bold mr-2">
                      ({getPanelTypeLabel(item.panel_type)})
                    </span>
                    {item.halfPeriod && (
                      <span className="ml-2 text-sm text-blue-600 font-medium">
                        (
                        {item.halfPeriod === 'first_half' ? '상반기' : '하반기'}
                        )
                      </span>
                    )}
                  </div>
                  <span className="mr-2 text-gray-500">{item.district}</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    className="ml-auto text-red-500 p-0 bg-transparent border-none"
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
            ))}
          </div>
        </div>

        {/* 장바구니 버튼 */}
        <div className="lg:w-[27rem]  flex lg:flex-col md:flex-col sm:flex-row justify-center items-center p-6 sm:p-4 gap-2">
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
    </div>
  );
}
