'use client';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import DetailImageSlider from '@/src/components/DetailImageSlider';
import BackToListButton from '@/src/components/BackToListButton';

interface Model {
  modelName: string;
  brand: string;
  inch: string;
  size: string;
  specifications: string;
  resolution: string;
  brightness: string;
  usage: string;
  installation: string;
  vesaHole: string;
  price: string;
  specialFeatures?: string;
}

interface Series {
  name: string;
  description: string;
  operatingLineup: string;
  models: Model[];
}

interface DigitalSignageDetailClientProps {
  productData: {
    id: string;
    title: string;
    image: string;
    images?: string[];
    modelName?: string;
    description?: string;
    type?: string;
    contactInfo?: string;
    bracketNote?: string;
    series?: {
      [key: string]: Series;
    };
    // 기존 구조 호환성을 위한 필드들
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
  isShoppingMall?: boolean; // 쇼핑몰(digital_products) 탭 여부
}

export default function DigitalSignageDetailClient({
  productData,
  isDigitalSignage = false,
  isDigitalBillboard = false,
  isShoppingMall = false,
}: DigitalSignageDetailClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [expandedSeries, setExpandedSeries] = useState<string[]>([]);

  const handleBack = () => {
    const tab = searchParams.get('tab') || 'digital-signage';
    router.push(`/digital-media?tab=${tab}`);
  };

  const toggleSeries = (seriesKey: string) => {
    setExpandedSeries((prev) =>
      prev.includes(seriesKey)
        ? prev.filter((key) => key !== seriesKey)
        : [...prev, seriesKey]
    );
  };

  // 미디어경관디자인 전용 레이아웃 (제목과 이미지만 표시)
  // 쇼핑몰 아이템은 제외 (상세 정보 UI 사용)
  if (!isDigitalSignage && !isDigitalBillboard && !isShoppingMall) {
    return (
      <main className="min-h-screen bg-white">
        {/* Header Section */}
        <section className="lg:container lg:mx-auto lg:px-[8rem] sm:px-[1.5rem] pt-[10rem] pb-[6rem]">
          <BackToListButton onClick={handleBack} />
          <h1 className="text-3.75 sm:text-2.5 font-[700] mb-4 font-gmarket">
            {productData.title}
          </h1>
        </section>

        {/* Images Gallery Section */}
        <section className="lg:container lg:mx-auto lg:px-[8rem] sm:px-[1.5rem] pb-[6rem]">
          {productData.images && productData.images.length > 0 ? (
            <div className="flex flex-col gap-10">
              {productData.images.map((image, index) => (
                <div
                  key={index}
                  className="relative aspect-[4/3] overflow-hidden rounded-lg"
                >
                  <Image
                    src={image}
                    alt={`${productData.title} - 이미지 ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 80vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
              <Image
                src={productData.image}
                alt={productData.title}
                fill
                sizes="(max-width: 768px) 100vw, 80vw"
                className="object-cover"
                priority
              />
            </div>
          )}
        </section>
      </main>
    );
  }

  // 디지털전광판 또는 디지털 사이니지 전용 레이아웃 (제목과 이미지만 표시)
  // digital_media_billboards와 digital_media_signages 테이블 아이템은 모두 간단한 UI 사용
  // 단, 쇼핑몰(digital_products) 탭 아이템은 제외 (상세 정보 UI 사용)
  if ((isDigitalBillboard || isDigitalSignage) && !isShoppingMall) {
    return (
      <main className="min-h-screen bg-white">
        {/* Header Section */}
        <section className="lg:container lg:mx-auto lg:px-[8rem] sm:px-[1.5rem] pt-[10rem] pb-[6rem]">
          <BackToListButton onClick={handleBack} />
          <h1 className="text-3.75 sm:text-2.5 font-[700] mb-4 font-gmarket">
            {productData.title}
          </h1>
        </section>

        {/* Images Gallery Section */}
        <section className="lg:container lg:mx-auto lg:px-[8rem] sm:px-[1.5rem] pb-[6rem]">
          {productData.images && productData.images.length > 0 ? (
            <div className="flex flex-col gap-10">
              {productData.images.map((image, index) => (
                <div
                  key={index}
                  className="relative aspect-[4/3] overflow-hidden rounded-lg"
                >
                  <Image
                    src={image}
                    alt={`${productData.title} - 이미지 ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 80vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
              <Image
                src={productData.image}
                alt={productData.title}
                fill
                sizes="(max-width: 768px) 100vw, 80vw"
                className="object-cover"
                priority
              />
            </div>
          )}
        </section>
      </main>
    );
  }

  // 쇼핑몰(digital_products) 전용 레이아웃 - 상세한 제품 정보 UI
  return (
    <main className="min-h-screen bg-white">
      {/* Header Section */}
      <section className="lg:container lg:mx-auto lg:px-[8rem] sm:px-[1.5rem] pt-[10rem] pb-[6rem]">
        <BackToListButton onClick={handleBack} className="mb-4" />
        <h1 className="text-3.75 sm:text-2.5 font-[700] mb-4 font-gmarket">
          {productData.title}
        </h1>
      </section>

      {/* Product Detail Section */}
      <section className="lg:container lg:mx-auto lg:px-[8rem] sm:px-[1.5rem] pb-[6rem]">
        <div className="grid lg:grid-cols-2 gap-12 sm:grid-cols-1">
          {/* Product Image */}
          <div className="flex flex-col gap-2 ">
            {productData.images && productData.images.length > 1 ? (
              <DetailImageSlider
                images={productData.images}
                alt={productData.title}
              />
            ) : (
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                <Image
                  src={productData.image}
                  alt={productData.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 80vw"
                  className="object-contain"
                  priority
                />
              </div>
            )}
            <div className="text-red text-sm text-center">
              * 제품 이미지는 제조공정으로 인해 약간의 차이는 있습니다.
            </div>
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

              {/* Series Options - New Structure */}
              {productData.series && (
                <div className="mb-6">
                  {/* Product Series Overview */}
                  <div className="mb-4">
                    <div className="space-y-1">
                      {Object.entries(productData.series).map(
                        ([seriesKey, series]) => (
                          <div
                            key={seriesKey}
                            className="flex items-center gap-2"
                          >
                            <span className="text-gray-600">•</span>
                            <span className="font-medium">
                              {series.description}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {Object.entries(productData.series).map(
                      ([seriesKey, series]) => (
                        <details
                          key={seriesKey}
                          className="border border-gray-200 rounded-lg"
                        >
                          <summary
                            className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors font-medium"
                            onClick={() => toggleSeries(seriesKey)}
                          >
                            <svg
                              className={`w-5 h-5 transition-transform ${
                                expandedSeries.includes(seriesKey)
                                  ? 'rotate-90'
                                  : ''
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                            <span className="font-bold ">{series.name}</span>
                          </summary>
                          <div className="px-4 pb-4">
                            <div className="space-y-4">
                              {series.models.map((model, modelIndex) => (
                                <div
                                  key={modelIndex}
                                  className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                                >
                                  <div className="flex items-center gap-2 mb-3">
                                    <span className="font-bold text-lg ">
                                      {model.modelName}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-1 gap-3 text-sm">
                                    <div className="flex items-start">
                                      <span className=" w-24 font-700">
                                        브랜드:
                                      </span>
                                      <span className="font-medium">
                                        {model.brand}
                                      </span>
                                    </div>
                                    <div className="flex items-start">
                                      <span className=" w-24 font-700">
                                        운영 라인업:
                                      </span>
                                      <span className="font-medium">
                                        {series.operatingLineup}
                                      </span>
                                    </div>
                                    <div className="flex items-start">
                                      <span className=" w-24 font-700">
                                        모델명:
                                      </span>
                                      <span className="font-medium">
                                        {model.modelName}
                                      </span>
                                    </div>
                                    <div className="flex items-start">
                                      <span className=" w-24 font-700">
                                        인치:
                                      </span>
                                      <span className="font-medium">
                                        {model.inch}
                                      </span>
                                    </div>
                                    <div className="flex items-start">
                                      <span className=" w-24 font-700">
                                        제품크기:
                                      </span>
                                      <span className="font-medium">
                                        {model.size} mm
                                      </span>
                                    </div>
                                    <div className="flex items-start">
                                      <span className=" w-24 font-700">
                                        해상도/밝기:
                                      </span>
                                      <span className="font-medium">
                                        {model.resolution} / {model.brightness}
                                      </span>
                                    </div>
                                    <div className="flex items-start">
                                      <span className=" w-24 font-700">
                                        주요사양:
                                      </span>
                                      <span className="font-medium">
                                        {model.specifications}
                                      </span>
                                    </div>
                                    <div className="flex items-start">
                                      <span className=" w-24 font-700">
                                        활용용도:
                                      </span>
                                      <span className="font-medium">
                                        {model.usage}
                                      </span>
                                    </div>
                                    <div className="flex items-start">
                                      <span className=" w-24 font-700">
                                        설치방식:
                                      </span>
                                      <span className="font-medium">
                                        {model.installation}
                                      </span>
                                    </div>
                                    <div className="flex items-start">
                                      <span className=" w-24 font-700">
                                        베사홀:
                                      </span>
                                      <span className="font-medium">
                                        {model.vesaHole} mm
                                      </span>
                                    </div>
                                    {model.specialFeatures && (
                                      <div className="flex items-start">
                                        <span className=" w-24 font-700">
                                          기타 특이사항:
                                        </span>
                                        <span className="font-medium">
                                          {model.specialFeatures}
                                        </span>
                                      </div>
                                    )}
                                    <div className="flex items-start">
                                      <span className=" w-24 font-700">
                                        제품문의:
                                      </span>
                                      <span className="font-bold">
                                        {productData.contactInfo}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </details>
                      )
                    )}
                    {productData.bracketNote && (
                      <div className="text-xs text-red pl-6 pt-6">
                        {productData.bracketNote}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Legacy Structure Support */}
              {!productData.series && productData.pixelPitchOptions && (
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

            {/* Call to Action - Removed for portfolio purposes */}
          </div>
        </div>
      </section>
    </main>
  );
}
