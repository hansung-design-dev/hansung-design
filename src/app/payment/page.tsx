'use client';
import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { Button } from '@/src/components/button/button';
import Nav from '@/src/components/layouts/nav';
import { useAuth } from '@/src/contexts/authContext';
import { useCart } from '@/src/contexts/cartContext';
import { useProfile } from '@/src/contexts/profileContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { CartItem } from '@/src/contexts/cartContext';

interface BankInfo {
  id: string;
  bank_name: string;
  account_number: string;
  depositor: string;
  region_gu: {
    id: string;
    name: string;
  };
  display_types: {
    id: string;
    name: string;
  };
}

function PaymentPageContent() {
  const { user } = useAuth();
  const { cart, dispatch } = useCart();
  const { profiles } = useProfile();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedItems, setSelectedItems] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank_transfer'>(
    'card'
  );
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendByEmail, setSendByEmail] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');

  // URL 파라미터에서 선택된 아이템 ID들 가져오기
  useEffect(() => {
    const itemsParam = searchParams.get('items');
    console.log('🔍 Payment page - itemsParam:', itemsParam);
    console.log('🔍 Payment page - cart:', cart);

    if (itemsParam) {
      try {
        const selectedItemIds = JSON.parse(
          decodeURIComponent(itemsParam)
        ) as string[];
        console.log('🔍 Payment page - selectedItemIds:', selectedItemIds);

        const items = cart.filter((item) => selectedItemIds.includes(item.id));
        console.log('🔍 Payment page - filtered items:', items);

        setSelectedItems(items);
      } catch (error) {
        console.error('Error parsing selected items:', error);
        setError('선택된 상품 정보를 불러오는데 실패했습니다.');
      }
    } else {
      console.log('🔍 Payment page - no items param found');
    }
  }, [searchParams, cart]);

  // 기본 프로필 찾기
  const defaultProfile =
    profiles.find((profile) => profile.is_default) || profiles[0];

  // 가격 계산
  const priceSummary = selectedItems.reduce(
    (summary, item) => {
      const roadUsageFee = item.panel_slot_snapshot?.road_usage_fee || 0;
      const advertisingFee = item.panel_slot_snapshot?.advertising_fee || 0;
      const taxPrice = item.panel_slot_snapshot?.tax_price || 0;
      const totalPrice = item.price || 0;

      return {
        roadUsageFee: summary.roadUsageFee + roadUsageFee,
        advertisingFee: summary.advertisingFee + advertisingFee,
        taxPrice: summary.taxPrice + taxPrice,
        totalPrice: summary.totalPrice + totalPrice,
      };
    },
    {
      roadUsageFee: 0,
      advertisingFee: 0,
      taxPrice: 0,
      totalPrice: 0,
    }
  );

  // 구별 계좌번호 정보 가져오기
  useEffect(() => {
    const fetchBankInfo = async () => {
      if (selectedItems.length === 0) return;

      // 첫 번째 아이템의 구와 타입으로 계좌번호 가져오기
      const firstItem = selectedItems[0];
      const displayType =
        firstItem.type === 'banner-display' ? 'banner_display' : 'led_display';

      try {
        const response = await fetch(
          `/api/region-gu?action=getBankInfo&district=${encodeURIComponent(
            firstItem.district
          )}&displayType=${displayType}`
        );
        const data = await response.json();

        if (data.success) {
          setBankInfo(data.data);
        }
      } catch (error) {
        console.error('Error fetching bank info:', error);
      }
    };

    fetchBankInfo();
  }, [selectedItems]);

  // 결제 처리
  const handlePayment = async () => {
    if (!user) {
      setError('로그인이 필요합니다.');
      return;
    }

    if (selectedItems.length === 0) {
      setError('선택된 상품이 없습니다.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // 복합 ID에서 원본 UUID 추출 함수
      const extractPanelInfoId = (item: CartItem) => {
        const uuidPattern =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        if (item.panel_info_id) {
          if (uuidPattern.test(item.panel_info_id)) {
            return item.panel_info_id;
          } else if (item.panel_info_id.includes('-')) {
            const parts = item.panel_info_id.split('-');
            if (parts.length >= 5) {
              const uuidPart = parts.slice(2).join('-');
              if (uuidPattern.test(uuidPart)) {
                return uuidPart;
              }
            }
          }
        } else if (item.id) {
          if (uuidPattern.test(item.id)) {
            return item.id;
          } else if (item.id.includes('-')) {
            const parts = item.id.split('-');
            if (parts.length >= 5) {
              const uuidPart = parts.slice(2).join('-');
              if (uuidPattern.test(uuidPart)) {
                return uuidPart;
              }
            }
          }
        }
        throw new Error('패널 정보 ID를 추출할 수 없습니다.');
      };

      // 주문 생성 API 호출
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: selectedItems.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: 1,
            panel_info_id: extractPanelInfoId(item),
            panel_slot_snapshot: item.panel_slot_snapshot,
            panel_slot_usage_id: item.panel_slot_usage_id,
            halfPeriod: item.halfPeriod,
            selectedYear: item.selectedYear,
            selectedMonth: item.selectedMonth,
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0],
          })),
          paymentMethod: paymentMethod,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || '주문 생성에 실패했습니다.');
      }

      // 성공 시 선택된 아이템들을 장바구니에서 제거
      selectedItems.forEach((item) => {
        dispatch({ type: 'REMOVE_ITEM', id: item.id });
      });

      // 성공 시 마이페이지 주문내역으로 이동
      router.push('/mypage/orders');
    } catch (error) {
      console.error('Payment error:', error);
      setError('결제 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (error) {
    return (
      <main className="min-h-screen bg-white pt-[5.5rem] bg-gray-100 min-h-screen lg:px-[10rem]">
        <Nav variant="default" className="bg-white" />
        <div className="container mx-auto px-4 sm:px-1 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-red-400 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-red-800 font-medium">{error}</span>
            </div>
            <Button
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded"
              onClick={() => router.push('/cart')}
            >
              장바구니로 돌아가기
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white pt-[5.5rem] bg-gray-100 lg:px-[10rem]">
      <Nav variant="default" className="bg-white" />

      <div className="container mx-auto px-4 sm:px-1 py-8 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-8">
        {/* 좌측 - 주문 상품 정보 */}
        <div className="space-y-8 border border-solid border-gray-3 rounded-[0.375rem] p-[2.5rem] sm:p-[1.5rem]">
          {/* 주문 상품 목록 */}
          {selectedItems.map((item) => (
            <section
              key={item.id}
              className="p-6 border rounded-lg shadow-sm flex flex-col gap-4 sm:p-2"
            >
              <div>
                <h2 className="text-1.25 text-gray-2 font-bold mb-4 border-b-solid border-black border-b-[0.1rem] pb-4">
                  {item.type === 'banner-display'
                    ? '현수막 게시대'
                    : 'LED 전자게시대'}
                </h2>
                <div className="mb-4 text-1.25 font-700 text-[#222] sm:text-0.875">
                  {item.name}
                </div>
                <div className="flex items-center gap-2 border border-solid border-gray-12 rounded-[0.375rem] p-4 bg-gray-11 sm:p-2">
                  <div className="text-1.25 font-700 sm:text-0.875">
                    {item.is_public_institution
                      ? '공공기관용'
                      : item.is_company
                      ? '기업용'
                      : '개인용'}{' '}
                    -{' '}
                    {defaultProfile?.contact_person_name ||
                      user?.name ||
                      '사용자'}
                  </div>
                </div>
              </div>

              <div className="text-1 text-gray-10">
                <h3 className="text-1.25 font-600 mb-2 text-[#222] sm:pb-5">
                  고객 정보
                </h3>
                <form className="flex flex-col gap-5">
                  <div className="flex flex-col gap-4 sm:gap-8">
                    {/* 작업이름 */}
                    <div className="flex flex-col sm:flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-4 sm:gap-2">
                      <label className="w-full md:w-[9rem] text-gray-600 font-medium">
                        작업이름
                      </label>
                      <input
                        type="text"
                        className="w-full md:w-[21.25rem] sm:w-[13rem] border border-gray-300 border-solid shadow-none rounded px-4 h-[3rem]"
                        placeholder="파일 이름"
                      />
                    </div>

                    {/* 파일업로드 */}
                    <div className="flex flex-col sm:flex-col md:flex-row items-start justify-between gap-2 md:gap-4 sm:gap-2">
                      <label className="w-full md:w-[9rem] text-gray-600 font-medium pt-2">
                        파일업로드
                      </label>
                      <div className="flex-1 space-y-2">
                        <input
                          type="file"
                          className={`border border-gray-300 py-2 w-full rounded ${
                            sendByEmail ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          disabled={sendByEmail}
                          readOnly={sendByEmail}
                          defaultValue={
                            sendByEmail ? 'hansung-design@example.com' : ''
                          }
                        />
                        <div className="flex flex-col gap-2 items-start">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="sendByEmail"
                              checked={sendByEmail}
                              onChange={(e) => setSendByEmail(e.target.checked)}
                              className="w-4 h-4"
                            />
                            <label
                              htmlFor="sendByEmail"
                              className="text-sm text-gray-500"
                            >
                              이메일로 파일 보낼게요
                            </label>
                          </div>
                          {sendByEmail && (
                            <input
                              type="email"
                              value={emailAddress}
                              onChange={(e) => setEmailAddress(e.target.value)}
                              className="border border-gray-300 border-solid shadow-none rounded h-[3rem] w-full md:w-[20rem] sm:w-[14.4rem] placeholder:pl-4"
                              placeholder="이메일 주소를 입력해주세요"
                            />
                          )}
                          {!sendByEmail && (
                            <input
                              type="text"
                              className="border border-gray-300 border-solid shadow-none rounded h-[3rem] w-full md:w-[20rem] sm:w-[14.4rem] placeholder:pl-4"
                              placeholder="파일 이름"
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 세금계산서 */}
                    <div className="flex flex-col sm:flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 sm:gap-2">
                      <label className="w-full md:w-[9rem] text-gray-600 font-medium">
                        세금계산서
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="w-5 h-5 sm:w-4 sm:h-4"
                        />
                        <label className="text-gray-600 font-medium sm:text-0.875">
                          세금계산서 신청
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      className="bg-gray-4 w-full md:w-[8rem] text-0.875 p-1 sm:w-[10rem] sm:mb-6"
                    >
                      변경된 내용 저장
                    </Button>
                  </div>
                </form>
              </div>
            </section>
          ))}

          {/* 결제수단 선택 */}
          <section className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-1.25 font-700 mb-4 sm:text-1">결제수단</h3>
            <div className="flex flex-col gap-3 items-center justify-center">
              <button
                className={`border rounded-[0.375rem] px-4 py-6 w-full text-1.25 font-700 sm:text-1 sm:py-4 ${
                  paymentMethod === 'card'
                    ? 'border-black bg-black text-white'
                    : 'border-gray-3 bg-gray-11'
                }`}
                onClick={() => setPaymentMethod('card')}
              >
                신용 · 체크카드
              </button>

              <button
                className={`border rounded-[0.375rem] px-4 py-6 w-full text-1.25 font-700 sm:text-1 sm:py-4 ${
                  paymentMethod === 'bank_transfer'
                    ? 'border-black bg-black text-white'
                    : 'border-gray-3 bg-gray-11'
                }`}
                onClick={() => setPaymentMethod('bank_transfer')}
              >
                계좌이체
              </button>

              <div className="w-full flex flex-col sm:flex-row gap-4 items-center justify-between">
                <button className="border border-gray-3 rounded-[0.375rem] p-4 w-full sm:h-[3rem] sm:flex sm:items-center sm:justify-center">
                  <Image
                    src="/svg/naver-pay.svg"
                    alt="Naver Pay"
                    width={80}
                    height={80}
                    className="sm:w-[3rem] sm:h-[3rem]"
                  />
                </button>
                <button className="border border-gray-3 rounded-[0.375rem] p-4 w-full sm:h-[3rem] sm:flex sm:items-center sm:justify-center">
                  <Image
                    src="/svg/kakao-pay.svg"
                    alt="Kakao Pay"
                    width={80}
                    height={80}
                    className="sm:w-[3rem] sm:h-[3rem]"
                  />
                </button>
              </div>
            </div>

            {/* 계좌이체 선택 시 계좌번호 표시 */}
            {paymentMethod === 'bank_transfer' && bankInfo && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">
                  입금 계좌 정보
                </h4>
                <div className="text-blue-700">
                  <p>
                    <strong>은행:</strong> {bankInfo.bank_name}
                  </p>
                  <p>
                    <strong>계좌번호:</strong> {bankInfo.account_number}
                  </p>
                  <p>
                    <strong>예금주:</strong> {bankInfo.depositor}
                  </p>
                </div>
                <p className="text-sm text-blue-600 mt-2">
                  * 계좌이체 시 입금자명을 주문자명과 동일하게 입력해주세요.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* 우측 - 결제 영역 */}
        <div className="w-full md:w-[24rem] space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-bold text-1.25 mb-4 border-b border-gray-1 pb-4 border-b-[2px]">
              최종 결제 금액
            </h3>
            <div className="flex flex-col gap-[0.88rem] text-1 font-500 text-gray-2">
              <div className="flex justify-between py-1">
                <span>도로이용비</span>
                <span>{priceSummary.roadUsageFee.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between py-1">
                <span>광고대행비</span>
                <span>{priceSummary.advertisingFee.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between py-1">
                <span>수수료</span>
                <span>{priceSummary.taxPrice.toLocaleString()}원</span>
              </div>
            </div>
            <div className="flex justify-between items-center mt-4 border-t border-gray-1 pt-7 sm:flex-col sm:gap-4">
              <span className="text-1.25 font-900">최종결제금액</span>
              <span className="text-1.875 font-900">
                {priceSummary.totalPrice.toLocaleString()}{' '}
                <span className="text-1 font-400">원</span>
              </span>
            </div>
          </div>

          <button
            className={`w-full py-6 rounded-lg transition-colors ${
              isProcessing
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
            disabled={isProcessing}
            onClick={handlePayment}
          >
            <span className="text-white sm:text-1.25">
              {isProcessing
                ? '처리중...'
                : paymentMethod === 'bank_transfer'
                ? '입금대기 신청'
                : '결제하기'}
            </span>
          </button>
        </div>
      </div>
    </main>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentPageContent />
    </Suspense>
  );
}
