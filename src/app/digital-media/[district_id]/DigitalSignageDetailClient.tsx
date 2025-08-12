'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@/src/components/button/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/src/contexts/cartContext';

interface DigitalSignageDetailClientProps {
  productData: {
    id: string;
    title: string;
    image: string;
    images?: string[];
    modelName?: string;
    pixelPitchOptions?: string[];
    specifications?: {
      moduleSize?: string;
      moduleResolution?: string;
      pixelDensity?: string;
      optimalViewingDistance?: string;
      screenBrightness?: string;
      pixelConfiguration?: string;
      refreshRate?: string;
      viewingAngle?: string;
      flatness?: string;
      operatingTemperature?: string;
      operatingHumidity?: string;
      ratedInput?: string;
      maintenance?: string;
      modelName?: string;
      productSize?: string;
      operatingLineup?: string;
      resolutionBrightness?: string;
      keyFeatures?: string;
      usage?: string;
      installationMethod?: string;
      inquiry?: string;
    };
    description?: string;
    type?: string;
    models?: {
      [key: string]: Array<{
        modelName: string;
        resolution: string;
        brightness: string;
        size: string;
        vesaHole: string;
        price: string;
        stock?: string;
        brand?: string;
        inch?: string;
      }>;
    };
  };
  isDigitalSignage?: boolean;
  isDigitalBillboard?: boolean;
}

export default function DigitalSignageDetailClient({
  productData,
  isDigitalSignage = false,
  isDigitalBillboard = false,
}: DigitalSignageDetailClientProps) {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToCart } = useCart();

  const handleBack = () => {
    const tab = searchParams.get('tab') || 'digital-signage';
    router.push(`/digital-media?tab=${tab}`);
  };

  const handleAddToCart = async () => {
    setIsAddingToCart(true);

    try {
      // 디지털사이니지 상품을 장바구니에 추가 (price: 0으로 설정하여 상담신청 아이템으로 분류)
      addToCart({
        type: 'digital-signage',
        name: productData.title,
        district: '디지털사이니지',
        price: 0, // 상담신청 아이템
        photo_url: productData.image,
      });
    } catch (error) {
      console.error('장바구니 추가 중 오류:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  // 디지털사이니지가 아닌 경우 기존 레이아웃 사용 (미디어경관디자인, 디지털전광판)
  if (!isDigitalSignage && !isDigitalBillboard) {
    return (
      <main className="min-h-screen bg-white">
        {/* Header Section */}
        <section className="lg:container lg:mx-auto lg:px-[8rem] sm:px-[1.5rem] pt-[10rem] pb-[6rem]">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <Image
              src="/svg/arrow-left.svg"
              alt="뒤로 가기"
              width={16}
              height={16}
            />
            <span className="text-lg">목록으로 가기</span>
          </button>
          <h1 className="text-3.75 sm:text-2.5 font-[700] mb-4 font-gmarket">
            {productData.title}
          </h1>
        </section>

        {/* Product Detail Section */}
        <section className="lg:container lg:mx-auto lg:px-[8rem] sm:px-[1.5rem] pb-[6rem]">
          <div className="grid lg:grid-cols-2 gap-12 sm:grid-cols-1">
            {/* Product Image */}
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src={productData.image}
                alt={productData.title}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Product Information */}
            <div className="flex flex-col gap-8">
              <div className="flex flex-col border-2 border-solid border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6 border-b border-gray-300 border-b-solid pb-4">
                  <h2 className="text-2xl font-900 text-black">
                    {productData.title}
                  </h2>
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
                    </div>
                    <span className="text-black pl-2">
                      {productData.specifications?.modelName ||
                        '상세페이지 참조'}
                    </span>
                  </div>
                  <div className="flex py-3 border-b border-gray-200 items-center">
                    <div className="flex items-center gap-2">
                      <Image
                        src="/svg/checkbox-input.svg"
                        alt="제품 크기"
                        width={24}
                        height={24}
                      />
                      <span className="text-gray-600 font-medium">
                        제품 크기
                      </span>
                    </div>
                    <span className="text-black">
                      {productData.specifications?.productSize ||
                        '상세페이지 참조'}
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

              {/* Call to Action */}
              <div className="space-y-4">
                <Button
                  size="lg"
                  variant="filledBlack"
                  color="black"
                  className="w-full"
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                >
                  {isAddingToCart ? '상담신청 중...' : '제품 견적문의'}
                </Button>
              </div>
            </div>
          </div>

          {/* Additional Images Gallery */}
          {productData.images && productData.images.length > 1 && (
            <div className="py-[10rem]">
              <div className="flex flex-col gap-10">
                {productData.images.slice(1).map((image, index) => (
                  <div
                    key={index}
                    className="relative aspect-[4/3] overflow-hidden rounded-lg"
                  >
                    <Image
                      src={image}
                      alt={`${productData.title} - 이미지 ${index + 2}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    );
  }

  // 디지털사이니지 전용 레이아웃
  return (
    <main className="min-h-screen bg-white">
      {/* Header Section */}
      <section className="lg:container lg:mx-auto lg:px-[8rem] sm:px-[1.5rem] pt-[10rem] pb-[6rem]">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors mb-4"
        >
          <Image
            src="/svg/arrow-left.svg"
            alt="뒤로 가기"
            width={16}
            height={16}
          />
          <span className="text-lg">목록으로 가기</span>
        </button>
        <h1 className="text-3.75 sm:text-2.5 font-[700] mb-4 font-gmarket">
          {productData.title}
        </h1>
      </section>

      {/* Product Detail Section */}
      <section className="lg:container lg:mx-auto lg:px-[8rem] sm:px-[1.5rem] pb-[6rem]">
        <div className="grid lg:grid-cols-2 gap-12 sm:grid-cols-1">
          {/* Product Image */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src={productData.image}
              alt={productData.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Product Information */}
          <div className="flex flex-col gap-8">
            {/* Title and Type */}
            <div className="flex flex-col border-2 border-solid border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6 border-b border-gray-300 border-b-solid pb-4">
                <h2 className="text-2xl font-900 text-black">
                  {productData.title}
                </h2>
              </div>

              {/* Pixel Pitch Options */}
              {productData.pixelPitchOptions && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-3">
                    Pixel Pitch Options
                  </h3>
                  <div className="space-y-2">
                    {productData.pixelPitchOptions.map((option, index) => (
                      <details key={index} className="">
                        <summary className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 transition-colors">
                          <Image
                            src="/images/media-arrow-up.jpg"
                            alt="펼치기"
                            width={16}
                            height={16}
                            className="text-gray-400"
                          />
                          <span className="font-medium text-gray-700">
                            {option}
                          </span>
                        </summary>
                        {productData.models && productData.models[option] && (
                          <div className="px-3 pb-3">
                            <div className="space-y-2">
                              {productData.models[option].map(
                                (model, modelIndex) => (
                                  <div
                                    key={modelIndex}
                                    className="border-b border-gray-200 pb-6"
                                  >
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="font-bold text-lg ">
                                        {model.modelName}
                                      </span>
                                    </div>
                                    <div className=" space-y-1 text-sm">
                                      <div className="flex items-start">
                                        <span className="text-gray-600 w-20">
                                          브랜드:
                                        </span>
                                        <span className="font-medium">
                                          {model.brand || '-'}
                                        </span>
                                      </div>
                                      <div className="flex items-start">
                                        <span className="text-gray-600 w-20">
                                          인치:
                                        </span>
                                        <span className="font-medium">
                                          {model.inch || '-'}
                                        </span>
                                      </div>
                                      <div className="flex items-start">
                                        <span className="text-gray-600 w-20">
                                          제품크기:
                                        </span>
                                        <span className="font-medium">
                                          {model.size}
                                        </span>
                                      </div>
                                      <div className="flex items-start">
                                        <span className="text-gray-600 w-20">
                                          베사홀:
                                        </span>
                                        <span className="font-medium">
                                          {model.vesaHole}
                                        </span>
                                      </div>
                                      <div className="flex items-start">
                                        <span className="text-gray-600 w-20">
                                          해상도:
                                        </span>
                                        <span className="font-medium">
                                          {model.resolution}
                                        </span>
                                      </div>
                                      <div className="flex items-start">
                                        <span className="text-gray-600 w-20">
                                          제품밝기:
                                        </span>
                                        <span className="font-medium">
                                          {model.brightness}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </details>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Call to Action */}
            <div className="space-y-4">
              <Button
                size="lg"
                variant="filledBlack"
                color="black"
                className="w-full"
                onClick={handleAddToCart}
                disabled={isAddingToCart}
              >
                {isAddingToCart ? '상담신청 중...' : '제품 견적문의'}
              </Button>
            </div>
          </div>
        </div>

        {/* Additional Images Gallery */}
        {productData.images && productData.images.length > 1 && (
          <div className="mt-12">
            <h3 className="text-2xl font-bold mb-6">추가 이미지</h3>
            <div className="flex flex-col gap-6">
              {productData.images.slice(1).map((image, index) => (
                <div
                  key={index}
                  className="relative aspect-[4/3] overflow-hidden rounded-lg"
                >
                  <Image
                    src={image}
                    alt={`${productData.title} - 이미지 ${index + 2}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
