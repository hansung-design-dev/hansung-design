import { useCart } from '../contexts/cartContext';
import { Button } from './button/button';
import Image from 'next/image';

export default function LiveCart() {
  const { cart, dispatch } = useCart();

  if (cart.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full h-[16.9375rem] justify-center  bg-white shadow-lg z-50 flex">
      <div className="h-[7rem] p-6 overflow-y-auto py-[3rem] flex items-center">
        <div className="w-[30rem] flex flex-col gap-2 max-h-[13rem] overflow-y-auto py-6 ">
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
                  onClick={() => dispatch({ type: 'REMOVE_ITEM', id: item.id })}
                >
                  <Image src="/svg/x.svg" alt="delete" width={20} height={20} />
                </button>{' '}
                <span className="mr-2">{item.price.toLocaleString()}원</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="w-[27rem] flex flex-col justify-center items-center border-l p-6">
        <Button variant="outlinedGray" color="gray" className="mb-2">
          장바구니 담기
        </Button>
        <Button variant="filledBlack" color="black">
          게시대 바로 신청하기
        </Button>
      </div>
    </div>
  );
}
