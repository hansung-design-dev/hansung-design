'use client';

import Image from 'next/image';
import { useCart } from '@/src/contexts/cartContext';
import { Button } from '@/src/components/button/button';
import { useState } from 'react';

interface ProductData {
  id: string;
  title: string;
  image: string;
  images?: string[];
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
      district: '디지털미디어',
      price: 0, // 상담신청용
    };

    dispatch({ type: 'ADD_ITEM', item: cartItem });

    // 라이브장바구니에만 담고 페이지 이동하지 않음
    setIsAddingToCart(false);
  };

  const allImages = productData.images || [productData.image];
  const galleryImages = allImages.slice(1); // 대표이미지 제외

  return (
    <main className="min-h-screen bg-white pb-[10rem]">
      {/* Header Section */}
      <section className="lg:container lg:mx-auto lg:px-[8rem] sm:px-[1.5rem] pt-[6rem] pb-[3rem]">
        <div className="flex items-center text-sm text-gray-600 mb-4">
          <span>홈</span>
          <span className="mx-2">&gt;</span>
          <span>디지털미디어</span>
          <span className="mx-2">&gt;</span>
          <span className="text-black font-medium">{productData.title}</span>
        </div>
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <Image
            src="/svg/arrow-left.svg"
            alt="뒤로 가기"
            width={16}
            height={16}
          />
          <span>목록으로 가기</span>
        </button>
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
          <div className="flex flex-col gap-8">
            {/* Product Information */}
            <div className="flex flex-col border-2 border-solid border-gray-200 rounded-lg p-4">
              {/* Title and Share */}
              <div className="flex items-center justify-between mb-8 border-b border-gray-300  border-b-solid">
                <h1 className="text-3xl font-900 text-black">
                  {productData.title}
                </h1>
              </div>

              {/* Specifications */}
              <div className="space-y-4 mb-8">
                <div className="flex py-3 border-b border-gray-200 items-center">
                  <div className="flex items-center gap-2">
                    <Image
                      src="/svg/checkbox-input.svg"
                      alt="모델명"
                      width={24}
                      height={24}
                    />
                    <span className="text-gray-600 font-medium">모델명</span>
                  </div>
                  <span className="text-black">
                    {productData.specifications.modelName}
                  </span>
                </div>
                <div className="flex  py-3 border-b border-gray-200 items-center">
                  <div className="flex items-center gap-2">
                    <Image
                      src="/svg/checkbox-input.svg"
                      alt="모델명"
                      width={24}
                      height={24}
                    />
                    <span className="text-gray-600 font-medium">제품 크기</span>
                  </div>
                  <span className="text-black">
                    {productData.specifications.productSize}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <ul>
                    <li>작업이 진행 된 후 환불이 불가한 상품입니다.</li>
                    <li>설 명절로 인해 2.1부터 진행됩니다.</li>
                    <li>기타 안내 사항이 들어가는 부분</li>
                  </ul>
                </div>
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
                {isAddingToCart ? '상담신청' : '상담신청'}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Image Gallery Section - 스크롤 형태 */}
      {galleryImages.length > 0 && (
        <section className="container mx-auto px-4 flex flex-col gap-12 lg:px-[8rem] sm:px-[1.5rem]">
          {galleryImages.map((image, index) => (
            <div key={index} className="relative w-full h-auto min-h-[200px]">
              <Image
                src={image}
                alt={`${productData.title} ${index + 2}`}
                width={1200}
                height={600}
                className="w-full h-auto rounded-2xl object-contain"
              />
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
