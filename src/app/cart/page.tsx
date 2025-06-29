'use client';
import { motion } from 'framer-motion';
import { useCart } from '@/src/contexts/cartContext';
import { useAuth } from '@/src/contexts/authContext';
import Image from 'next/image';
import { Button } from '@/src/components/button/button';
import { CartItem } from '@/src/contexts/cartContext';
import { useState, useMemo } from 'react';
import OrderModificationModal from '@/src/components/OrderModificationModal';
import ConsultationModal from '@/src/components/ConsultationModal';

const fadeInUp = {
  initial: { y: 60, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } },
};
const dividerVertical = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="2"
    height="128"
    viewBox="0 0 2 128"
    fill="none"
  >
    <path d="M1 0V128" stroke="#D9D9D9" />
  </svg>
);

const dividerHorizontal = (
  <div className="w-[95%] mx-auto">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="4"
      viewBox="0 0 1441 4"
      fill="none"
    >
      <path d="M0 2H1441" stroke="black" strokeWidth="4" />
    </svg>
  </div>
);

function CartGroupCard({
  title,
  children,
  phoneList,
  isSelected,
  onSelect,
}: {
  title: string;
  children: React.ReactNode;
  phoneList?: string[];
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
}) {
  return (
    <div className="mb-8 bg-white rounded-lg overflow-hidden py-4">
      <div className="flex items-center pt-4 pb-2 border-b border-black px-[3rem]">
        <input
          type="checkbox"
          className="w-6 h-6 mr-4"
          checked={isSelected}
          onChange={(e) => onSelect?.(e.target.checked)}
        />
        <span className="text-xl font-semibold">{title}</span>
        {phoneList && (
          <span className="ml-4 text-sm text-gray-500">
            상담전화: {phoneList.join(', ')}
          </span>
        )}
      </div>
      {dividerHorizontal}
      <div>{children}</div>
    </div>
  );
}

function CartItemRow({
  item,
  user,
  isSelected,
  onSelect,
  isConsulting = false,
  onOrderModify,
  onConsultation,
}: {
  item: CartItem;
  user: { name: string; phone: string };
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
  isConsulting?: boolean;
  onOrderModify?: () => void;
  onConsultation?: () => void;
}) {
  if (isConsulting) {
    return (
      <div className=" flex items-center pl-[3rem] py-6 border-b border-gray-200 ">
        <input
          type="checkbox"
          className="w-5 h-5 mr-6"
          checked={isSelected}
          onChange={(e) => onSelect?.(e.target.checked)}
        />
        <div className="flex items-center w-80">
          <Image
            src="/images/digital-signage-grid-example.jpeg"
            alt="썸네일"
            width={80}
            height={80}
            className="w-24 h-24  object-cover mr-4"
          />
          <div className="flex flex-col gap-3">
            <div className="text-1 ">{item.name}</div>
            <div className="text-1.25 font-semibold">
              {item.price === 0
                ? '상담문의'
                : `${item.price?.toLocaleString()}원`}
            </div>
          </div>
        </div>
        {dividerVertical}
        <div className="pr-20 flex flex-col ml-2 text-1 font-500 gap-2 text-gray-2">
          <div>담당자명: {user?.name}</div>
          <div>전화번호: {user?.phone}</div>
          <div>회사이름: -</div>
          <button
            className="mt-2 text-1 rounded-[0.25rem] w-[5rem] border-1 border-solid border-gray-1 px-2 py-1 text-gray-2"
            onClick={onOrderModify}
          >
            주문수정
          </button>
        </div>
        <div className="flex flex-col items-center justify-center gap-4 p-4 border-solid border-1 border-gray-1 w-[20rem]">
          <div className="text-center text-0.875 font-500">
            해당상품은 상담 진행 후 결제가 완료됩니다.
            <br /> 상담문의가 어려우실 경우 고객센터에 문의 부탁드립니다.
          </div>
          <Button
            className="w-[15rem] h-[2rem] px-12 py-4 text-lg font-bold rounded bg-black text-white text-1"
            onClick={onConsultation}
          >
            상담문의
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className=" flex items-center pl-[3rem] py-6 border-b border-gray-200 ">
      <input
        type="checkbox"
        className="w-5 h-5 mr-6"
        checked={isSelected}
        onChange={(e) => onSelect?.(e.target.checked)}
      />
      <div className="flex items-center w-80">
        <Image
          src="/images/digital-signage-grid-example.jpeg"
          alt="썸네일"
          width={80}
          height={80}
          className="w-24 h-24  object-cover mr-4"
        />
        <div className="flex flex-col gap-3">
          <div className="text-1 ">{item.name}</div>
          <div className="text-1.25 font-semibold">
            {item.price === 0
              ? '상담문의'
              : `${item.price?.toLocaleString()}원`}
          </div>
        </div>
      </div>
      {dividerVertical}
      <div className="flex-1 flex flex-col ml-2 text-1 font-500 gap-2 text-gray-2">
        <div>담당자명: {user?.name}</div>
        <div>전화번호: {user?.phone}</div>
        <div>회사이름: -</div>
        <button
          className="mt-2 text-1 rounded-[0.25rem] w-[5rem] border-1 border-solid border-gray-1 px-2 py-1 text-gray-2"
          onClick={onOrderModify}
        >
          주문수정
        </button>
      </div>
      {dividerVertical}
      <div className="w-35 text-left ml-5 flex flex-col gap-2">
        <div className="text-1 font-500">디자인비용</div>
        <div className="text-1.25 font-700">100,000원</div>
      </div>
      {dividerVertical}
      <div className="w-35 text-left ml-5 flex flex-col gap-2">
        <div className="text-1 font-500">게시대비용</div>
        <div className="text-1.25 font-700">100,000원</div>
      </div>
    </div>
  );
}

export default function Cart() {
  const { cart } = useCart();
  const { user } = useAuth();
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'payment' | 'consulting'>(
    'payment'
  );
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const [selectedProductName, setSelectedProductName] = useState('');

  const ledItems = cart.filter(
    (item) => item.type === 'led-display' && item.price !== 0
  );
  const bannerItems = cart.filter(
    (item) => item.type === 'banner-display' && item.price !== 0
  );
  const consultingItems = cart.filter((item) => item.price === 0);

  // 선택된 아이템들의 총계 계산
  const cartSummary = useMemo(() => {
    const selectedCartItems = cart.filter((item) =>
      selectedItems.has(String(item.id))
    );
    const totalQuantity = selectedCartItems.length;
    const totalPrice = selectedCartItems.reduce((sum, item) => {
      // 상담문의는 가격이 0이므로 제외
      if (item.price === 0) return sum;
      return sum + (item.price || 0);
    }, 0);

    // 추가금 (디자인비용 + 게시대비용) - 각 아이템당 200,000원으로 가정
    const additionalCost = selectedCartItems.length * 200000;

    return {
      quantity: totalQuantity,
      additionalCost,
      totalAmount: totalPrice + additionalCost,
    };
  }, [cart, selectedItems]);

  const handleItemSelect = (itemId: string, selected: boolean) => {
    const newSelected = new Set(selectedItems);
    if (selected) {
      newSelected.add(itemId);
    } else {
      newSelected.delete(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleGroupSelect = (items: CartItem[], selected: boolean) => {
    const newSelected = new Set(selectedItems);
    if (selected) {
      items.forEach((item) => newSelected.add(String(item.id)));
    } else {
      items.forEach((item) => newSelected.delete(String(item.id)));
    }
    setSelectedItems(newSelected);
  };

  const isGroupSelected = (items: CartItem[]) => {
    return (
      items.length > 0 &&
      items.every((item) => selectedItems.has(String(item.id)))
    );
  };

  const handleOrderModify = () => {
    setIsOrderModalOpen(true);
  };

  const handleConsultation = (productName: string) => {
    setSelectedProductName(productName);
    setIsConsultationModalOpen(true);
  };

  return (
    <main className="pt-[3rem] bg-gray-100 min-h-screen lg:px-[1rem] pb-[12rem]">
      <div className="max-w-5xl mx-auto py-10">
        {/* 탭 버튼들 */}
        <div className="flex gap-5 py-10">
          <Button
            size="sm"
            variant={activeTab === 'payment' ? 'outlinedBlack' : 'outlinedGray'}
            className="rounded-full"
            onClick={() => setActiveTab('payment')}
          >
            결제신청
          </Button>

          <Button
            size="sm"
            variant={
              activeTab === 'consulting' ? 'outlinedBlack' : 'outlinedGray'
            }
            className="rounded-full"
            onClick={() => setActiveTab('consulting')}
          >
            상담신청
          </Button>
        </div>

        <motion.div initial="initial" animate="animate" variants={fadeInUp}>
          {user && activeTab === 'payment' && (
            <>
              {ledItems.length > 0 && (
                <CartGroupCard
                  title="LED전자게시대"
                  phoneList={['1533-0570', '1899-0596', '02-719-0083']}
                  isSelected={isGroupSelected(ledItems)}
                  onSelect={(selected) => handleGroupSelect(ledItems, selected)}
                >
                  {ledItems.map((item) => (
                    <CartItemRow
                      key={item.id}
                      item={item}
                      user={user}
                      isSelected={selectedItems.has(String(item.id))}
                      onSelect={(selected) =>
                        handleItemSelect(String(item.id), selected)
                      }
                      onOrderModify={handleOrderModify}
                    />
                  ))}
                </CartGroupCard>
              )}

              {bannerItems.length > 0 && (
                <CartGroupCard
                  title="현수막게시대"
                  isSelected={isGroupSelected(bannerItems)}
                  onSelect={(selected) =>
                    handleGroupSelect(bannerItems, selected)
                  }
                >
                  {bannerItems.map((item) => (
                    <CartItemRow
                      key={item.id}
                      item={item}
                      user={user}
                      isSelected={selectedItems.has(String(item.id))}
                      onSelect={(selected) =>
                        handleItemSelect(String(item.id), selected)
                      }
                      onOrderModify={handleOrderModify}
                    />
                  ))}
                </CartGroupCard>
              )}

              {ledItems.length === 0 && bannerItems.length === 0 && (
                <CartGroupCard
                  title="결제신청"
                  phoneList={['1533-0570', '1899-0596', '02-719-0083']}
                >
                  <div className="flex items-center justify-center py-12 text-gray-500">
                    상품이 없습니다
                  </div>
                </CartGroupCard>
              )}
            </>
          )}

          {user && activeTab === 'consulting' && (
            <CartGroupCard
              title="상담신청"
              isSelected={isGroupSelected(consultingItems)}
              onSelect={(selected) =>
                handleGroupSelect(consultingItems, selected)
              }
            >
              {consultingItems.length > 0 ? (
                consultingItems.map((item) => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    user={user}
                    isSelected={selectedItems.has(String(item.id))}
                    onSelect={(selected) =>
                      handleItemSelect(String(item.id), selected)
                    }
                    isConsulting={true}
                    onOrderModify={handleOrderModify}
                    onConsultation={() => handleConsultation(item.name)}
                  />
                ))
              ) : (
                <div className="flex items-center justify-center py-12 text-gray-500">
                  상품이 없습니다
                </div>
              )}
            </CartGroupCard>
          )}
        </motion.div>
      </div>

      <div className="fixed bottom-0 left-0 w-full h-[11rem] bg-white border-t border-gray-300 py-0 px-8 flex items-center justify-around gap-4">
        <div className="flex space-x-6 text-lg font-semibold">
          <div>선택수량 {cartSummary.quantity}개</div>
          {/* <div>+ 추가금 {cartSummary.additionalCost.toLocaleString()}원</div> */}
          <div>= 총 주문금액 {cartSummary.totalAmount.toLocaleString()}원</div>
        </div>
        <Button className="px-12 py-4 text-lg font-bold rounded bg-black text-white">
          총 {cartSummary.quantity}건 결제하기
        </Button>
      </div>

      {/* 모달들 */}
      <OrderModificationModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
      />

      <ConsultationModal
        isOpen={isConsultationModalOpen}
        onClose={() => setIsConsultationModalOpen(false)}
        productName={selectedProductName}
      />
    </main>
  );
}
