'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Nav from '@/src/components/layouts/nav';
import { useCart } from '@/src/contexts/cartContext';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { dispatch: cartDispatch } = useCart();
  const [paymentInfo, setPaymentInfo] = useState<{
    paymentId: string;
    orderId: string;
    amount: number;
    status?: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasCalledConfirm = useRef(false); // 무한 루프 방지용 ref

  useEffect(() => {
    const paymentKey = searchParams.get('paymentKey');
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');
    const paymentId = searchParams.get('paymentId');
    const status = searchParams.get('status');

    // 🔍 디버깅: 토스페이먼츠에서 받은 URL 파라미터 확인
    console.log(
      '🔍 [결제 성공 페이지] URL 파라미터 확인 (토스페이먼츠에서 전달됨):',
      {
        paymentKey: paymentKey ? `${paymentKey.substring(0, 30)}...` : '(없음)',
        orderId: orderId || '(없음)',
        amount: amount || '(없음)',
        paymentId: paymentId || '(없음)',
        status: status || '(없음)',
        allParams: {
          paymentKey,
          orderId,
          amount,
          paymentId,
          status,
        },
        url: typeof window !== 'undefined' ? window.location.href : '(SSR)',
        timestamp: new Date().toISOString(),
      }
    );

    // 이미 호출했으면 다시 호출하지 않음
    if (hasCalledConfirm.current) {
      console.log(
        '🔍 [결제 성공 페이지] 이미 결제 확인 API 호출 완료, 재호출 방지'
      );
      return;
    }

    // 토스 결제 성공 시 paymentKey가 있으면 결제 확인 API 호출
    if (paymentKey && orderId && amount && !isProcessing) {
      // ⚠️ 중요: hasCalledConfirm은 성공했을 때만 true로 설정
      // 실패 시에는 재시도할 수 있도록 false로 유지
      setIsProcessing(true);

      const confirmPayment = async () => {
        try {
          // localStorage에서 주문 정보 가져오기 (임시/기존 주문 공통)
          let orderData = null;
          const pendingOrderData = localStorage.getItem('pending_order_data');
          if (pendingOrderData) {
            try {
              orderData = JSON.parse(pendingOrderData);
              console.log(
                '🔍 [결제 성공 페이지] ✅ localStorage에서 주문 정보 가져옴:',
                {
                  hasOrderData: !!orderData,
                  itemsCount: orderData?.items?.length || 0,
                  userAuthId: orderData?.userAuthId || '(없음)',
                  userProfileId: orderData?.userProfileId || '(없음)',
                  projectName: orderData?.projectName || '(없음)',
                  draftDeliveryMethod:
                    orderData?.draftDeliveryMethod || '(없음)',
                  tempOrderId: orderData?.tempOrderId || '(없음)',
                  orderDataKeys: orderData ? Object.keys(orderData) : [],
                  itemsDetail:
                    orderData?.items?.map((item: unknown) => ({
                      id: (item as { id?: string })?.id,
                      panel_id: (item as { panel_id?: string })?.panel_id,
                      name: (item as { name?: string })?.name || '(없음)',
                      district:
                        (item as { district?: string })?.district || '(없음)',
                      price: (item as { price?: number })?.price || 0,
                      quantity: (item as { quantity?: number })?.quantity || 0,
                      projectName: (item as { projectName?: string })
                        ?.projectName,
                    })) || [],
                  fullOrderData: JSON.stringify(orderData, null, 2).substring(
                    0,
                    2000
                  ),
                }
              );
              // 사용 후 삭제
              localStorage.removeItem('pending_order_data');
            } catch (e) {
              console.error(
                '🔍 [결제 성공 페이지] ❌ localStorage 파싱 실패:',
                {
                  error: e,
                  rawData: pendingOrderData.substring(0, 200),
                }
              );
            }
          } else if (orderId.startsWith('temp_')) {
            // 임시 주문인데도 로컬 주문 정보가 없으면 오류
            console.error(
              '🔍 [결제 성공 페이지] ❌ localStorage에 주문 정보가 없습니다.',
              {
                orderId,
                localStorageKeys:
                  typeof window !== 'undefined'
                    ? Object.keys(localStorage)
                    : [],
                pendingOrderData:
                  typeof window !== 'undefined'
                    ? localStorage.getItem('pending_order_data')
                    : null,
              }
            );
            setError('주문 정보를 찾을 수 없습니다.');
            setIsProcessing(false);
            return;
          } else {
            console.log(
              '🔍 [결제 성공 페이지] 임시 orderId가 아니며, 추가 주문 데이터 없음 (기존 주문 정보만 사용)'
            );
          }

          // 🔍 디버깅: 결제 확인 API 호출 전 최종 확인
          const requestBody = {
            paymentKey,
            orderId,
            amount: parseInt(amount),
            orderData, // 주문 생성에 필요한 정보 (임시 orderId인 경우)
          };

          console.log('🔍 [결제 성공 페이지] 결제 확인 API 호출 시작:', {
            url: '/api/payment/toss/confirm',
            method: 'POST',
            requestBody: {
              paymentKey: paymentKey
                ? `${paymentKey.substring(0, 30)}...`
                : '(없음)',
              orderId,
              amount: parseInt(amount),
              hasOrderData: !!orderData,
              orderDataStructure: orderData
                ? {
                    itemsCount: orderData.items?.length || 0,
                    userAuthId: orderData.userAuthId || '(없음)',
                    userProfileId: orderData.userProfileId || '(없음)',
                    projectName: orderData.projectName || '(없음)',
                  }
                : null,
            },
            timestamp: new Date().toISOString(),
          });

          const response = await fetch('/api/payment/toss/confirm', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });

          console.log('🔍 [결제 성공 페이지] 결제 확인 API 응답 받음:', {
            ok: response.ok,
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            timestamp: new Date().toISOString(),
          });

          const data = await response.json();

          // 🔍 디버깅: 토스페이먼츠 결제 확인 API 응답 상세 로깅
          console.log(
            '🔍 [결제 성공 페이지] 결제 확인 API 응답 데이터 (토스페이먼츠에서 받은 정보):',
            {
              success: data.success,
              hasError: !!data.error,
              error: data.error || '(없음)',
              hasData: !!data.data,
              responseData: data.data
                ? {
                    // 토스페이먼츠에서 받은 결제 정보
                    orderId: data.data.orderId || '(없음)',
                    orderNumber: data.data.orderNumber || '(없음)',
                    paymentKey: data.data.paymentKey
                      ? `${data.data.paymentKey.substring(0, 30)}...`
                      : '(없음)',
                    amount: data.data.amount || '(없음)',
                    method: data.data.method || '(없음)',
                    paymentStatus: data.data.status || '(없음)',
                    requestedAt: data.data.requestedAt || '(없음)',
                    approvedAt: data.data.approvedAt || '(없음)',
                    // 전체 데이터 구조 확인
                    allKeys: Object.keys(data.data),
                  }
                : null,
              fullResponse: data,
              timestamp: new Date().toISOString(),
            }
          );

          if (!response.ok || !data.success) {
            console.error('🔍 [결제 성공 페이지] ❌ 결제 확인 실패:', {
              responseOk: response.ok,
              responseStatus: response.status,
              dataSuccess: data.success,
              error: data.error,
              code: data.code,
              fullErrorData: data,
              note:
                data.code === 'M006'
                  ? '토스페이먼츠 측 문제 - 업체 사정으로 결제 일시 중지. 카드에서 돈이 빠져나가지 않았습니다.'
                  : '결제 승인 실패',
            });

            // M006 에러는 토스페이먼츠 측 문제이므로 사용자에게 안내
            const errorMessage =
              data.code === 'M006'
                ? '토스페이먼츠 업체 사정으로 인해 결제를 일시 중지하였습니다. 카드에서 돈이 빠져나가지 않았으니 안심하시고, 잠시 후 다시 시도해주시거나 상점으로 문의해주세요.'
                : data.error || '결제 확인에 실패했습니다.';

            setError(errorMessage);
            setPaymentInfo({
              paymentId: paymentKey,
              orderId: orderId,
              amount: parseInt(amount),
              status: 'failed',
            });
            // 실패 시에는 hasCalledConfirm을 false로 유지하여 재시도 가능하도록
            hasCalledConfirm.current = false;
            return;
          }

          // ✅ 성공 시에만 호출 플래그 설정
          hasCalledConfirm.current = true;

          console.log('🔍 [결제 성공 페이지] ✅ 결제 확인 성공:', {
            orderId: data.data?.orderId || '(없음)',
            orderNumber: data.data?.orderNumber || '(없음)',
            paymentKey: data.data?.paymentKey
              ? `${data.data.paymentKey.substring(0, 30)}...`
              : '(없음)',
            amount: data.data?.amount || '(없음)',
            paymentStatus: data.data?.status || '(없음)',
            method: data.data?.method || '(없음)',
            fullResponseData: data.data,
          });

          // 결제 확인 성공 후 주문 정보 표시
          // 실제 주문이 생성되었으면 orderNumber를 사용, 아니면 임시 orderId 사용
          const finalOrderId =
            data.data?.orderNumber || data.data?.orderId || orderId;

          setPaymentInfo({
            paymentId: paymentKey,
            orderId: finalOrderId,
            amount: parseInt(amount),
            status: 'completed',
          });

          // 주문 완료 후 장바구니 초기화
          console.log('🔍 [결제 성공 페이지] 장바구니 초기화');
          cartDispatch({ type: 'CLEAR_CART' });
        } catch (error) {
          console.error('🔍 [결제 성공 페이지] ❌ 결제 확인 중 예외 발생:', {
            error,
            errorMessage:
              error instanceof Error ? error.message : String(error),
            errorStack: error instanceof Error ? error.stack : undefined,
            paymentKey: paymentKey
              ? `${paymentKey.substring(0, 30)}...`
              : '(없음)',
            orderId: orderId || '(없음)',
            amount: amount || '(없음)',
            timestamp: new Date().toISOString(),
          });
          setError('결제 확인 중 오류가 발생했습니다.');
          setPaymentInfo({
            paymentId: paymentKey || paymentId || '',
            orderId: orderId || '',
            amount: amount ? parseInt(amount) : 0,
            status: 'error',
          });
          // 예외 발생 시에도 재시도 가능하도록 플래그 리셋
          hasCalledConfirm.current = false;
        } finally {
          setIsProcessing(false);
        }
      };

      confirmPayment();
    } else if (paymentId && orderId && !hasCalledConfirm.current) {
      // 다른 결제 방식 (예: 계좌이체)의 경우
      console.log('🔍 [결제 성공 페이지] 다른 결제 방식 처리:', {
        paymentId,
        orderId,
      });
      hasCalledConfirm.current = true;
      setPaymentInfo({
        paymentId,
        orderId,
        amount: amount ? parseInt(amount) : 0,
        status: status || undefined,
      });
    }
  }, [searchParams, isProcessing]);

  const handleGoToOrders = () => {
    router.push('/mypage/orders');
  };

  const handleGoToHome = () => {
    router.push('/');
  };

  return (
    <main className="min-h-screen bg-white pt-[5.5rem] bg-gray-100 lg:px-[10rem]">
      <Nav variant="default" className="bg-white" />

      <div className="container mx-auto px-4 sm:px-1 py-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  결제 확인 중...
                </h1>
                <p className="text-gray-600 mb-6">
                  결제 정보를 확인하고 있습니다. 잠시만 기다려주세요.
                </p>
              </>
            ) : error ? (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-red-600 mb-2">
                  결제 확인 실패
                </h1>
                <p className="text-red-600 mb-6">{error}</p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {paymentInfo?.status === 'pending_deposit'
                    ? '입금 확인 중입니다'
                    : '결제가 완료되었습니다!'}
                </h1>

                <p className="text-gray-600 mb-6">
                  {paymentInfo?.status === 'pending_deposit'
                    ? '계좌이체 주문이 접수되었습니다. 입금 확인 후 주문이 처리됩니다.'
                    : '주문이 성공적으로 처리되었습니다.'}
                </p>
              </>
            )}

            {paymentInfo && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">주문번호:</span>
                    <span className="font-medium">{paymentInfo.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">결제번호:</span>
                    <span className="font-medium">{paymentInfo.paymentId}</span>
                  </div>
                  {paymentInfo.amount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">결제금액:</span>
                      <span className="font-medium">
                        {paymentInfo.amount.toLocaleString()}원
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleGoToOrders}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                주문 내역 보기
              </button>

              <button
                onClick={handleGoToHome}
                className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                홈으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
