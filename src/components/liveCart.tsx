import { useCart } from '../contexts/CartContext';
import { Button } from './button/button';

export default function LiveCart() {
  const { cart, dispatch } = useCart();

  if (cart.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full h-[16.9375rem] bg-white shadow-lg z-50 flex">
      <div className="flex-1 p-6 overflow-y-auto">
        {cart.map((item) => (
          <div key={item.id} className="mb-2 flex items-center">
            <span className="font-bold mr-2">
              {item.type === 'led-display' ? 'LED' : '배너'}
            </span>
            <span className="mr-2">{item.name}</span>
            <span className="mr-2 text-gray-500">{item.district}</span>
            <span className="mr-2">{item.price.toLocaleString()}원</span>
            <button
              className="ml-auto text-red-500"
              onClick={() => dispatch({ type: 'REMOVE_ITEM', id: item.id })}
            >
              삭제
            </button>
          </div>
        ))}
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
