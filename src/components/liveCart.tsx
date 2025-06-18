import { useCart } from '../contexts/cartContext';
import { Button } from './button/button';
import Image from 'next/image';

export default function LiveCart() {
  const { cart, dispatch } = useCart();

  if (cart.length === 0) return null;

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
            {cart.map((item) => (
              <div
                key={item.id}
                className="mb-2 flex items-center justify-between"
              >
                <div className="flex flex-col gap-2">
                  <div>
                    <span className="mr-2">{item.name}</span>
                    <span className="font-bold mr-2">
                      ({item.type === 'led-display' ? 'LED' : '배너'})
                    </span>
                  </div>
                  <span className="mr-2 text-gray-500">{item.district}</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <button
                    className="ml-auto text-red-500"
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
                  </button>{' '}
                  <span className="mr-2">{item.price.toLocaleString()}원</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 장바구니 버튼 */}
        <div className="lg:w-[27rem]  flex lg:flex-col md:flex-col sm:flex-row justify-center items-center p-6 sm:p-4 gap-2">
          <Button size="cart" variant="outlinedGray" color="gray" className="">
            장바구니 담기
          </Button>
          <Button size="cart" variant="filledBlack" color="black" className="">
            게시대 바로 신청하기
          </Button>
        </div>
      </div>
    </div>
  );
}
