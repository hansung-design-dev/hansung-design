import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/src/components/button/button';
import { applySpecialHalfPeriodFixup } from '@/src/lib/specialHalfPeriodFixup';
import PaymentSummarySection from '@/src/components/PaymentSummarySection';

type BankAccountInfo = {
  bankName: string;
  accountNumber: string;
  owner: string;
};

type DisplayTypeForBank = 'banner_display' | 'led_display';

type Payment = {
  depositor_name?: string | null;
  payment_methods?: {
    name?: string | null;
    method_code?: string | null;
  } | null;
};

type OrderDetailRow = {
  id: string;
  slot_order_quantity?: number;
  display_start_date?: string | null;
  display_end_date?: string | null;
  price?: number;
  panels?: {
    nickname?: string | null;
    address?: string | null;
    region_gu?: { name?: string | null } | null;
    region_dong?: { name?: string | null } | null;
    display_types?: { name?: string | null } | null;
  } | null;
  panel_slot_usage?: {
    slot_number?: number | null;
    usage_type?: string | null;
    banner_slots?: {
      max_width?: number | null;
      max_height?: number | null;
    } | null;
  } | null;
  design_draft?: {
    project_name?: string | null;
  } | null;
};

type OrderDetailResponse = {
  order: {
    id?: string;
    created_at?: string;
    projectName?: string;
    user_profiles?: {
      contact_person_name?: string | null;
      company_name?: string | null;
      phone?: string | null;
      email?: string | null;
    } | null;
  };
  orderDetails: OrderDetailRow[];
  payments: Payment[];
  customerInfo?: {
    name?: string;
    phone?: string;
    company?: string;
  };
  priceInfo?: {
    finalPrice?: number;
  };
};

const pad2 = (value: number) => String(value).padStart(2, '0');

const formatYmd = (dateString?: string | null) => {
  if (!dateString) return '-';
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return '-';
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

// 표에서 폭을 줄이기 위한 짧은 날짜 포맷 (예: 25.02.16)
const formatYyDotMmDotDd = (dateString?: string | null) => {
  if (!dateString) return '-';
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return '-';
  const yy = String(d.getFullYear()).slice(-2);
  return `${yy}.${pad2(d.getMonth() + 1)}.${pad2(d.getDate())}`;
};

const formatTodayKorean = () => {
  const d = new Date();
  return `${d.getFullYear()}년 ${pad2(d.getMonth() + 1)}월 ${pad2(
    d.getDate()
  )}일`;
};

const getDisplayTypeForBank = (detail: OrderDetailRow): DisplayTypeForBank => {
  const displayTypeName = detail.panels?.display_types?.name || '';
  const usageType = detail.panel_slot_usage?.usage_type || '';

  const normalized = `${displayTypeName}|${usageType}`.toLowerCase();
  if (normalized.includes('led')) return 'led_display';
  return 'banner_display';
};

async function fetchBankAccountForDistrict(
  district: string,
  displayType: DisplayTypeForBank
): Promise<BankAccountInfo | null> {
  try {
    const params = new URLSearchParams({
      action: 'getBankData',
      district,
      displayType,
    });
    const res = await fetch(`/api/region-gu?${params.toString()}`);
    const json = await res.json();
    if (!res.ok || !json.success || !json.data) return null;
    return {
      bankName: json.data.bank_name as string,
      accountNumber: json.data.account_number as string,
      owner: json.data.depositor as string,
    };
  } catch {
    return null;
  }
}

export default function OrderApplicationForm({
  data,
  onClose,

  onCancelDetail,
  onResendFile,
  onReceiptClick,
  onPayment,
  showPaymentButton,
}: {
  data: OrderDetailResponse;
  onClose?: () => void;
  onCancelDetail?: (orderDetailId: string) => void;
  onResendFile?: () => void;
  onReceiptClick?: () => void;
  onPayment?: () => void;
  showPaymentButton?: boolean;
}) {
  const order = data.order || ({} as OrderDetailResponse['order']);
  const details = useMemo(
    () => (Array.isArray(data.orderDetails) ? data.orderDetails : []),
    [data.orderDetails]
  );
  const payments = Array.isArray(data.payments) ? data.payments : [];
  const latestPayment = payments.length > 0 ? payments[0] : null;

  const applicantName =
    order.user_profiles?.contact_person_name || data.customerInfo?.name || '-';
  const companyName =
    order.user_profiles?.company_name || data.customerInfo?.company || '-';
  const phone =
    order.user_profiles?.phone || data.customerInfo?.phone || '전화번호 없음';
  const email = order.user_profiles?.email || '-';
  const depositorName = latestPayment?.depositor_name || '-';

  const adContent =
    order.projectName ||
    details.find((d) => d.design_draft?.project_name)?.design_draft
      ?.project_name ||
    '-';

  const totalQuantity = details.reduce(
    (sum, d) => sum + Number(d.slot_order_quantity || 1),
    0
  );

  const totalAmount = details.reduce(
    (sum, d) => sum + Number(d.price || 0),
    0
  );

  const districtDisplayKeys = useMemo(() => {
    const keys = new Set<string>();
    details.forEach((d) => {
      const district = d.panels?.region_gu?.name;
      if (!district) return;
      const displayType = getDisplayTypeForBank(d);
      keys.add(`${district}|${displayType}`);
    });
    return Array.from(keys);
  }, [details]);

  const districtTitle = useMemo(() => {
    const districts = Array.from(
      new Set(
        details
          .map((d) => d.panels?.region_gu?.name)
          .filter((v): v is string => Boolean(v && v.trim()))
      )
    );
    if (districts.length === 0) return '신청';
    return districts.join(', ');
  }, [details]);

  const [bankAccounts, setBankAccounts] = useState<
    Record<string, BankAccountInfo | null | undefined>
  >({});
  const [bankAccountsLoading, setBankAccountsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (districtDisplayKeys.length === 0) return;
      setBankAccountsLoading(true);
      const results = await Promise.all(
        districtDisplayKeys.map(async (key) => {
          const [district, displayType] = key.split('|') as [
            string,
            DisplayTypeForBank
          ];
          const account = await fetchBankAccountForDistrict(
            district,
            displayType
          );
          return [key, account] as const;
        })
      );
      if (cancelled) return;
      const next: Record<string, BankAccountInfo | null> = {};
      results.forEach(([key, account]) => {
        next[key] = account;
      });
      setBankAccounts(next);
      setBankAccountsLoading(false);
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [districtDisplayKeys]);

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="text-center">
          <div className="text-2xl font-bold">
            옥외광고물 등 표시허가 신청서
          </div>
          <div className="text-sm text-gray-600 mt-1">
            (신청일자:{' '}
            <span className="font-medium">{formatYmd(order.created_at)}</span>)
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Table 1: 신청정보 */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="text-sm font-semibold text-gray-900">
              ■ 신청정보
            </div>
          </div>
          <div className="border border-gray-300">
            <div className="grid grid-cols-[140px_1fr_140px_1fr] text-sm">
              <div className="bg-gray-50 border-b border-r border-gray-300 px-3 py-2 font-medium">
                신청자
              </div>
              <div className="border-b border-r border-gray-300 px-3 py-2">
                {applicantName}
              </div>
              <div className="bg-gray-50 border-b border-r border-gray-300 px-3 py-2 font-medium">
                입금자명
              </div>
              <div className="border-b border-gray-300 px-3 py-2">
                {depositorName}
              </div>

              <div className="bg-gray-50 border-b border-r border-gray-300 px-3 py-2 font-medium">
                업체명
              </div>
              <div className="border-b border-r border-gray-300 px-3 py-2">
                {companyName}
              </div>
              <div className="bg-gray-50 border-b border-r border-gray-300 px-3 py-2 font-medium">
                전화번호
              </div>
              <div className="border-b border-gray-300 px-3 py-2">{phone}</div>

              <div className="bg-gray-50 border-b border-r border-gray-300 px-3 py-2 font-medium">
                주소
              </div>
              <div className="border-b border-gray-300 px-3 py-2 col-span-3">
                -
              </div>

              <div className="bg-gray-50 border-b border-r border-gray-300 px-3 py-2 font-medium">
                광고내용
              </div>
              <div className="border-b border-gray-300 px-3 py-2 col-span-3">
                {adContent}
              </div>

              <div className="bg-gray-50 border-r border-gray-300 px-3 py-2 font-medium">
                이메일
              </div>
              <div className="border-r border-gray-300 px-3 py-2">{email}</div>
              <div className="bg-gray-50 border-r border-gray-300 px-3 py-2 font-medium">
                핸드폰번호
              </div>
              <div className="px-3 py-2">{phone}</div>
            </div>
          </div>
        </div>

        {/* Table 2: 구별 신청내역 */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="text-sm font-semibold text-gray-900">
              ■ {districtTitle} 신청내역
            </div>
          </div>
          {/* 스크롤 없이 화면에 들어가도록: min-width 제거 + % 기반 컬럼 + 고정 레이아웃 */}
          <div className="border border-gray-300 overflow-hidden">
            <table className="w-full text-xs border-collapse table-fixed">
              <colgroup>
                <col className="w-[5%]" />
                <col className="w-[28%]" />
                <col className="w-[8%]" />
                <col className="w-[8%]" />
                <col className="w-[8%]" />
                <col className="w-[9%]" />
                <col className="w-[10%]" />
                <col className="w-[10%]" />
                <col className="w-[10%]" />
                {onCancelDetail ? <col className="w-[9%]" /> : null}
              </colgroup>
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-1 py-2">No.</th>
                  <th className="border border-gray-300 px-2 py-2">게시대명</th>
                  <th className="border border-gray-300 px-1 py-2">면수</th>
                  <th className="border border-gray-300 px-1 py-2">행정구</th>
                  <th className="border border-gray-300 px-1 py-2">행정동</th>
                  <th className="border border-gray-300 px-1 py-2">규격</th>
                  <th className="border border-gray-300 px-1 py-2">시작일자</th>
                  <th className="border border-gray-300 px-1 py-2">종료일자</th>
                  <th className="border border-gray-300 px-1 py-2">금액</th>
                  {onCancelDetail ? (
                    <th className="border border-gray-300 px-1 py-2">
                      부분취소
                    </th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {details.length === 0 ? (
                  <tr>
                    <td
                      className="border border-gray-300 px-2 py-4 text-center text-gray-500"
                      colSpan={onCancelDetail ? 10 : 9}
                    >
                      신청 내역이 없습니다.
                    </td>
                  </tr>
                ) : (
                  details.map((d, idx) => {
                    const nickname = d.panels?.nickname || '';
                    const address = d.panels?.address || '';
                    const boardName =
                      nickname && address
                        ? `${nickname} (${address})`
                        : address || nickname || '-';
                    const slotNumber = d.panel_slot_usage?.slot_number;
                    const district = d.panels?.region_gu?.name || '-';
                    const dong = d.panels?.region_dong?.name || '-';
                    const w = d.panel_slot_usage?.banner_slots?.max_width;
                    const h = d.panel_slot_usage?.banner_slots?.max_height;
                    const size =
                      typeof w === 'number' && typeof h === 'number'
                        ? `${w}×${h}`
                        : '-';
                    const fixedPeriod = applySpecialHalfPeriodFixup({
                      districtName: district,
                      startDate: d.display_start_date ?? null,
                      endDate: d.display_end_date ?? null,
                    });
                    const start = formatYyDotMmDotDd(fixedPeriod.startDate);
                    const end = formatYyDotMmDotDd(fixedPeriod.endDate);
                    const price = Number(d.price || 0);

                    return (
                      <tr key={d.id || `${idx}`}>
                        <td className="border border-gray-300 px-1 py-2 text-center whitespace-nowrap">
                          {idx + 1}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 whitespace-normal break-words">
                          {boardName}
                        </td>
                        <td className="border border-gray-300 px-1 py-2 text-center whitespace-nowrap">
                          {typeof slotNumber === 'number'
                            ? `${slotNumber}번면`
                            : '-'}
                        </td>
                        <td className="border border-gray-300 px-1 py-2 text-center whitespace-nowrap">
                          {district}
                        </td>
                        <td className="border border-gray-300 px-1 py-2 text-center whitespace-nowrap">
                          {dong}
                        </td>
                        <td className="border border-gray-300 px-1 py-2 text-center whitespace-nowrap">
                          {size}
                        </td>
                        <td className="border border-gray-300 px-1 py-2 text-center whitespace-nowrap">
                          {start}
                        </td>
                        <td className="border border-gray-300 px-1 py-2 text-center whitespace-nowrap">
                          {end}
                        </td>
                        <td className="border border-gray-300 px-1 py-2 text-right whitespace-nowrap">
                          {price.toLocaleString()}원
                        </td>
                        {onCancelDetail ? (
                          <td className="border border-gray-300 px-1 py-2 text-center whitespace-nowrap">
                            <Button
                              size="xs"
                              variant="outlinedGray"
                              className="px-2 py-1 text-xs"
                              onClick={() => onCancelDetail(d.id)}
                            >
                              취소
                            </Button>
                          </td>
                        ) : null}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-2 flex items-center justify-end gap-6 text-sm">
            <div>
              신청 총 수량:{' '}
              <span className="font-semibold">{totalQuantity}</span>장
            </div>
            <div>
              총금액:{' '}
              <span className="font-semibold">
                {totalAmount.toLocaleString()}
              </span>
              원
            </div>
          </div>
        </div>

        {/* 결제 요약 (환불/추가결제 내역 포함) */}
        {order.id && <PaymentSummarySection orderId={order.id} />}

        {/* 결제수단 / 입금계좌 */}
        <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-semibold text-gray-900">결제수단:</div>
            <div>{latestPayment?.payment_methods?.name || '-'}</div>
          </div>

          <div className="space-y-1">
            <div className="font-semibold text-gray-900">입금계좌</div>
            {districtDisplayKeys.length === 0 ? (
              <div className="text-gray-500">표시할 입금계좌가 없습니다.</div>
            ) : bankAccountsLoading ? (
              <div className="text-gray-500">
                입금계좌 정보를 불러오는 중...
              </div>
            ) : (
              <div className="space-y-1">
                {districtDisplayKeys.map((key) => {
                  const [district, displayType] = key.split('|') as [
                    string,
                    DisplayTypeForBank
                  ];
                  const account = bankAccounts[key];
                  const displayTypeLabel =
                    displayType === 'led_display'
                      ? '전자게시대'
                      : '현수막게시대';
                  return (
                    <div key={key} className="text-gray-800">
                      <span className="font-medium">{district}</span> (
                      {displayTypeLabel}) :{' '}
                      {account
                        ? `${account.bankName} ${account.accountNumber} 예금주:${account.owner}`
                        : '계좌정보 없음'}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer date */}
        <div className="pt-4 text-center text-sm text-gray-700">
          {formatTodayKorean()}
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
          {showPaymentButton && onPayment && (
            <Button variant="outlinedGray" size="xs" onClick={onPayment}>
              결제 페이지로 이동
            </Button>
          )}
          {onResendFile && (
            <Button variant="outlinedGray" size="xs" onClick={onResendFile}>
              파일재전송
            </Button>
          )}
          {onReceiptClick && (
            <Button variant="outlinedGray" size="xs" onClick={onReceiptClick}>
              영수증
            </Button>
          )}
          {onClose && (
            <Button variant="outlinedGray" size="xs" onClick={onClose}>
              목록
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
