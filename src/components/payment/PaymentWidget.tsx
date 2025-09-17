'use client';

import React, {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  forwardRef,
} from 'react';
import { loadPaymentWidget, ANONYMOUS } from '@tosspayments/payment-widget-sdk';

export type PaymentWidgetProps = {
  amount: number;
  orderId: string;
  orderName: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  onReady?: () => void;
};

export type PaymentWidgetHandle = {
  requestPayment: (params: {
    successUrl: string;
    failUrl: string;
  }) => Promise<void>;
};

function PaymentWidgetComponent(
  {
    amount,
    orderId,
    orderName,
    customerName,
    customerEmail,
    customerPhone,
    onReady,
  }: PaymentWidgetProps,
  ref: React.Ref<PaymentWidgetHandle>
) {
  const widgetContainerId = `payment-methods-${orderId}`;
  const agreementContainerId = `payment-agreement-${orderId}`;
  const [isMounted, setIsMounted] = useState(false);
  const paymentWidgetRef = useRef<any>(null);
  const paymentMethodsWidgetRef = useRef<any>(null);
  const agreementWidgetRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const init = async () => {
      if (!isMounted) return;
      const widgetSelector = `#${widgetContainerId}`;
      const agreementSelector = `#${agreementContainerId}`;
      const widgetContainer = document.querySelector(widgetSelector);
      const agreementContainer = document.querySelector(agreementSelector);
      if (!widgetContainer || !agreementContainer) return;
      const clientKey = process.env
        .NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY as string;
      if (!clientKey) {
        // eslint-disable-next-line no-console
        console.error('Missing NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY');
        return;
      }

      const loaded = await loadPaymentWidget(clientKey, ANONYMOUS);
      paymentWidgetRef.current = loaded as unknown as any;

      paymentMethodsWidgetRef.current = loaded.renderPaymentMethods(
        widgetSelector,
        { value: amount },
        { variantKey: 'DEFAULT' }
      );

      agreementWidgetRef.current = loaded.renderAgreement(agreementSelector, {
        variantKey: 'AGREEMENT',
      });

      setIsReady(true);
      onReady?.();
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted, amount]);

  useEffect(() => {
    if (paymentMethodsWidgetRef.current) {
      paymentMethodsWidgetRef.current.updateAmount(amount);
    }
  }, [amount]);

  useImperativeHandle(ref, () => ({
    requestPayment: async ({
      successUrl,
      failUrl,
    }: {
      successUrl: string;
      failUrl: string;
    }) => {
      if (!paymentWidgetRef.current || !isReady)
        throw new Error('PaymentWidget is not ready');
      await paymentWidgetRef.current.requestPayment({
        orderId,
        orderName,
        successUrl,
        failUrl,
        customerEmail,
        customerName,
        customerMobilePhone: customerPhone,
        amount: { currency: 'KRW', value: amount },
      });
    },
  }));

  return (
    <div className="space-y-4">
      <div id={widgetContainerId} />
      <div id={agreementContainerId} />
      {!isReady && (
        <div className="text-sm text-gray-500">결제 위젯을 불러오는 중...</div>
      )}
      {/* Hidden inputs to pass order info on requestPayment */}
      <input type="hidden" value={orderId} readOnly />
      <input type="hidden" value={orderName} readOnly />
      <input type="hidden" value={customerName} readOnly />
      <input type="hidden" value={customerEmail} readOnly />
      {customerPhone && <input type="hidden" value={customerPhone} readOnly />}
    </div>
  );
}

export default forwardRef(PaymentWidgetComponent);
