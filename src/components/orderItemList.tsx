import React, { useState } from 'react';
import ArrowLeft from '@/src/icons/arrow-left.svg';
import ArrowRight from '@/src/icons/arrow-right.svg';
import { useRouter } from 'next/navigation';
import { Button } from './button/button';

interface ListItem {
  id: number;
  title: string;
  subtitle?: string;
  location?: string;
  status: string;
  quantity?: number;
  orderId?: string;
}

const statusColorMap: Record<string, string> = {
  추가결제: 'text-[#D61919]',
  파일오류: 'text-[#D61919]',
  송출중: 'text-[#109251]',
  진행중: 'text-[#109251]',
  마감: 'text-[#7D7D7D]',
};

const getStatusClass = (status: string) => {
  return statusColorMap[status] || 'text-black';
};

interface ItemTableProps {
  items: ListItem[];
  showHeader?: boolean;
  showCheckbox?: boolean;
  onItemSelect?: (id: number, checked: boolean) => void;
  selectedIds?: number[];
  enableRowClick?: boolean;
}

const ITEMS_PER_PAGE = 10;

const OrderItemList: React.FC<ItemTableProps> = ({
  items,
  showHeader = true,
  showCheckbox = false,
  onItemSelect,
  selectedIds = [],
  enableRowClick = true,
}) => {
  const [page, setPage] = useState(1);
  const router = useRouter();
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const paginatedItems = items.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handleItemClick = (itemId: number, orderId?: string) => {
    if (onItemSelect) {
      const isSelected = selectedIds.includes(itemId);
      onItemSelect(itemId, !isSelected);
    } else {
      if (orderId) {
        router.push(`/mypage/orders/${orderId}`);
      } else {
        router.push(`/mypage/orders/${itemId}`);
      }
    }
  };

  const handleRowClick = (
    e: React.MouseEvent,
    itemId: number,
    orderId?: string
  ) => {
    if ((e.target as HTMLElement).tagName === 'INPUT') {
      return;
    }
    handleItemClick(itemId, orderId);
  };

  return (
    <>
      {/* ✅ 데스크탑/tablet 이상: table로 표시 */}
      <div className="overflow-x-auto hidden lg:block">
        <table className="w-full border-collapse border-t border-gray-200 text-1.25 font-500">
          {showHeader && (
            <thead>
              <tr className="border-b border-gray-200 h-[3rem] text-gray-500 font-medium">
                {showCheckbox && <th className="w-10">no</th>}
                <th className="text-left pl-10">게시대 명</th>
                <th className="text-center">행정동</th>
                <th className="text-center">마감여부</th>
                <th className="text-center">&nbsp;</th>
              </tr>
            </thead>
          )}
          <tbody>
            {paginatedItems.map((item) => (
              <tr
                key={item.id}
                className={`border-b border-gray-200 h-[3.5rem] hover:bg-gray-50 ${
                  enableRowClick ? 'cursor-pointer' : ''
                }`}
                onClick={(e) => handleRowClick(e, item.id, item.orderId)}
              >
                {showCheckbox && (
                  <td
                    className="text-center px-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={(e) =>
                        onItemSelect?.(item.id, e.target.checked)
                      }
                    />
                  </td>
                )}
                <td className="px-4 text-left pl-10 text-1.25 font-500">
                  <span className="font-medium text-black">
                    {item.title}
                    {item.subtitle && (
                      <span className="ml-1 text-gray-500">
                        {item.subtitle}
                      </span>
                    )}
                  </span>
                </td>
                <td className="text-center text-1.25 font-500">
                  {item.location}
                </td>
                <td
                  className={`text-center font-semibold text-1.25 font-500 ${getStatusClass(
                    item.status
                  )}`}
                >
                  {item.status}
                </td>
                <td className="text-center">
                  <Button
                    size="xs"
                    variant="outlinedGray"
                    className={` px-4 py-1 rounded-full text-gray-700 font-200`}
                    disabled={
                      item.status === '마감' || item.status === '송출중'
                    }
                  >
                    신청 취소
                  </Button>
                </td>
              </tr>
            ))}
            {/* 빈 row로 높이 맞추기 */}
            {Array.from({ length: ITEMS_PER_PAGE - paginatedItems.length }).map(
              (_, i) => (
                <tr key={`empty-${i}`} className="h-[3.5rem]">
                  <td colSpan={showCheckbox ? 5 : 4} />
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ 모바일(sm, md): 카드형으로 표시 */}
      <div className="flex flex-col gap-4 lg:hidden items-center ">
        {paginatedItems.map((item) => (
          <div
            key={item.id}
            className={`border-solid border-gray-200 rounded-lg p-12 flex flex-col gap-2 shadow-sm hover:bg-gray-50 ${
              enableRowClick ? 'cursor-pointer' : ''
            }`}
            onClick={() => {
              if (enableRowClick && !showCheckbox) {
                handleItemClick(item.id, item.orderId);
              }
            }}
          >
            <div className="font-medium text-black text-1.25 font-500">
              {item.title}
            </div>
            {item.subtitle && (
              <div className="text-gray-500">{item.subtitle}</div>
            )}
            <div className="text-1.25 font-500">행정동: {item.location}</div>
            <div className="text-1.25 font-500">
              상태:&nbsp;
              <span
                className={`text-1.25 font-500 ${getStatusClass(
                  item.status
                )} font-medium`}
              >
                {item.status}
              </span>
            </div>
            <button
              className={`border px-4 py-1 rounded mt-2 ${
                item.status === '마감' || item.status === '송출중'
                  ? 'text-gray-400 border-gray-200 bg-gray-100 cursor-not-allowed'
                  : 'text-black border-black hover:bg-gray-100'
              }`}
              disabled={item.status === '마감' || item.status === '송출중'}
            >
              신청 취소
            </button>
          </div>
        ))}
      </div>
      {/* 페이지네이션 UI */}
      <div className="flex justify-center items-center gap-1 mt-4 pb-10">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="w-7 h-7 flex items-center justify-center"
        >
          <ArrowLeft className="w-4 h-4 text-gray-14" />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
          <button
            key={num}
            onClick={() => setPage(num)}
            className={`w-7 h-7 flex items-center justify-center text-1.25 font-500 rounded ${
              page === num ? 'text-black' : 'text-gray-14'
            }`}
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="w-7 h-7 flex items-center justify-center"
        >
          <ArrowRight className="w-4 h-4 text-gray-14" />
        </button>
      </div>
    </>
  );
};

export default OrderItemList;
