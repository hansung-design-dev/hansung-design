'use client';

import Image from 'next/image';
import { useCart } from '@/src/contexts/cartContext';
import { Button } from '@/src/components/button/button';
import { useState } from 'react';

interface ProductData {
  id: string;
  title: string;
  image: string;
  specifications: {
    operatingLineup: string;
    modelName: string;
    productSize: string;
    resolutionBrightness: string;
    keyFeatures: string;
    usage: string;
    installationMethod: string;
    inquiry: string;
  };
}

interface DigitalSignageDetailClientProps {
  productData: ProductData;
}

export default function DigitalSignageDetailClient({
  productData,
}: DigitalSignageDetailClientProps) {
  const { dispatch } = useCart();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleAddToCart = () => {
    setIsAddingToCart(true);

    // 장바구니에 상품 추가
    const cartItem = {
      id: productData.id,
      type: 'digital-signage' as const,
      name: productData.title,
      district: '디지털사이니지',
      price: 0, // 상담신청용
    };

    dispatch({ type: 'ADD_ITEM', item: cartItem });

    // 라이브장바구니에만 담고 페이지 이동하지 않음
    setIsAddingToCart(false);
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Header Section */}
      <section className="lg:container lg:mx-auto lg:px-[8rem] sm:px-[1.5rem] pt-[6rem] pb-[3rem]">
        <div className="flex items-center text-sm text-gray-600 mb-4">
          <span>홈</span>
          <span className="mx-2">&gt;</span>
          <span>디지털 사이니지</span>
          <span className="mx-2">&gt;</span>
          <span>싱글 사이니지</span>
          <span className="mx-2">&gt;</span>
          <span className="text-black font-medium">{productData.title}</span>
        </div>
      </section>

      {/* Product Detail Section */}
      <section className="lg:container lg:mx-auto lg:px-[8rem] sm:px-[1.5rem] pb-[6rem]">
        <div className="grid lg:grid-cols-2 gap-12 sm:grid-cols-1">
          {/* Product Image */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
            <Image
              src={productData.image}
              alt={productData.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Product Information */}
          <div className="flex flex-col">
            {/* Title and Share */}
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-black">
                {productData.title}
              </h1>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 5.12548 15.0077 5.24917 15.0227 5.37061L8.08264 9.26727C7.54305 8.48822 6.60487 8 5.5 8C4.11929 8 3 9.11929 3 10.5C3 11.8807 4.11929 13 5.5 13C6.60487 13 7.54305 12.5118 8.08264 11.7327L15.0227 15.6294C15.0077 15.7508 15 15.8745 15 16C15 17.6569 16.3431 19 18 19C19.6569 19 21 17.6569 21 16C21 14.3431 19.6569 13 18 13C16.8951 13 15.9569 13.4882 15.4174 14.2673L8.47736 10.3706C8.49232 10.2492 8.5 10.1255 8.5 10C8.5 9.87452 8.49232 9.75083 8.47736 9.62939L15.4174 5.73273C15.9569 6.51178 16.8951 7 18 7Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>

            {/* Specifications */}
            <div className="space-y-4 mb-8">
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600 font-medium">운영 라인업</span>
                <span className="text-black">
                  {productData.specifications.operatingLineup}
                </span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600 font-medium">모델명</span>
                <span className="text-black">
                  {productData.specifications.modelName}
                </span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600 font-medium">제품 크기</span>
                <span className="text-black">
                  {productData.specifications.productSize}
                </span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600 font-medium">해상도 / 밝기</span>
                <span className="text-black">
                  {productData.specifications.resolutionBrightness}
                </span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600 font-medium">주요 사양</span>
                <span className="text-black">
                  {productData.specifications.keyFeatures}
                </span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600 font-medium">활용 용도</span>
                <span className="text-black">
                  {productData.specifications.usage}
                </span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600 font-medium">설치 방식</span>
                <span className="text-black">
                  {productData.specifications.installationMethod}
                </span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600 font-medium">제품문의</span>
                <span className="text-black font-bold">
                  {productData.specifications.inquiry}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button
                size="lg"
                variant="filledBlack"
                color="black"
                className="w-full"
                onClick={handleAddToCart}
                disabled={isAddingToCart}
              >
                {isAddingToCart
                  ? '라이브장바구니에 추가 중...'
                  : '라이브장바구니에 담기'}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
