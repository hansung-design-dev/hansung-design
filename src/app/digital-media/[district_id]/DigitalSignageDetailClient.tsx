'use client';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';

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
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleBack = () => {
    const tab = searchParams.get('tab') || 'digital-signage';
    router.push(`/digital-media?tab=${tab}`);
  };

  // 미디어경관디자인 전용 레이아웃 (제목과 이미지만 표시)
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
                className="object-cover"
                priority
              />
            </div>
          )}
        </section>
      </main>
    );
  }

  // 디지털전광판 전용 레이아웃 (제목과 이미지만 표시)
  if (isDigitalBillboard) {
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
                className="object-cover"
                priority
              />
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

            {/* Call to Action - Removed for portfolio purposes */}
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
