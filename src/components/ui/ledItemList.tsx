import { useState } from 'react';
import ArrowLeft from '@/src/icons/arrow-left.svg';
import ArrowRight from '@/src/icons/arrow-right.svg';
import Image from 'next/image';
import { LEDBillboard } from '@/src/types/leddetail';

const statusColorMap: Record<string, string> = {
  진행중: 'text-[#109251]',
  마감: 'text-[#7D7D7D]',
  active: 'text-[#109251]',
  inactive: 'text-[#7D7D7D]',
};

const statusDisplayMap: { [key: string]: string } = {
  active: '진행중',
  inactive: '마감',
};

const getStatusClass = (status: string) => {
  return statusColorMap[status] || 'text-black';
};

interface LEDItemTableProps {
  items: LEDBillboard[];
  showHeader?: boolean;
  showCheckbox?: boolean;
  renderAction?: (item: LEDBillboard) => React.ReactNode;
  onItemSelect?: (id: string, checked: boolean) => void;
  selectedIds?: string[];
  enableRowClick?: boolean;
  isAllDistrictsView?: boolean;
}

const ITEMS_PER_PAGE = 20;

const LEDItemList: React.FC<LEDItemTableProps> = ({
  items,
  showHeader = true,
  showCheckbox = false,
  renderAction,
  onItemSelect,
  selectedIds = [],
  enableRowClick = true,
  // isAllDistrictsView = false,
}) => {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const paginatedItems = items.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handleItemClick = (itemId: string) => {
    if (onItemSelect) {
      const isSelected = selectedIds.includes(itemId);
      onItemSelect(itemId, !isSelected);
    }
  };

  const handleRowClick = (e: React.MouseEvent, itemId: string) => {
    if ((e.target as HTMLElement).tagName === 'INPUT') {
      return;
    }

    // 아이콘 버튼 영역 클릭 시 아이템 선택 방지
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.tagName === 'BUTTON') {
      return;
    }

    handleItemClick(itemId.toString());
  };

  // // LED 전용 구분 컬럼에 표시할 값 계산 함수
  // const getLEDPanelTypeLabel = (panelType?: string) => {
  //   if (!panelType) return 'LED전자게시대';
  //   return 'LED전자게시대';
  // };

  return (
    <>
      {/* ✅ 데스크탑/tablet 이상: table로 표시 */}
      <div className="overflow-x-auto hidden lg:block">
        <table className="w-full  border-collapse border-t border-gray-200 text-0.875">
          {showHeader && (
            <thead>
              <tr className="border-b border-gray-200 h-[3rem] text-gray-500 font-medium">
                {showCheckbox && <th className="w-10"></th>}
                <th className="text-center pl-4">No</th>
                <th className="text-left pl-4">게시대 명</th>
                <th className="text-center pl-4"></th>
                <th className="text-center pl-4">규격(px)</th>
                <th className="text-center pl-4">최대배너수</th>
                <th className="text-center pl-4">상태</th>
                {renderAction && <th className="text-center">작업</th>}
              </tr>
            </thead>
          )}
          <tbody>
            {paginatedItems.map((item, index) => {
              const displayStatus =
                statusDisplayMap[item.status] || item.status;
              // const categoryDisplay = getLEDPanelTypeLabel(item.panel_type);
              const uniqueKey = item.id || `led-${index}`; // fallback key
              return (
                <tr
                  key={uniqueKey}
                  className={`border-b border-gray-200 h-[3.5rem] hover:bg-gray-50 ${
                    enableRowClick ? 'cursor-pointer' : ''
                  }`}
                  onClick={(e) => handleRowClick(e, item.id)}
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
                  <td className="text-center pl-4">
                    {item.panel_code || item.id}
                  </td>
                  <td className="pl-4">
                    <div
                      className="font-medium text-black cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleItemClick(item.id);
                      }}
                    >
                      {item.nickname && <span> {item.nickname} - </span>}
                      {item.address ? <span>{item.address}</span> : <></>}
                      {item.neighborhood && (
                        <span className="ml-1 text-gray-500">
                          {item.neighborhood}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="">
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('camera');
                        }}
                        title={`${item.nickname && item.nickname + ' - '}${
                          item.address || ''
                        }${item.neighborhood ? ' ' + item.neighborhood : ''}`}
                      >
                        <Image
                          src={'/svg/list/camera.svg'}
                          alt="camera"
                          width={300}
                          height={300}
                          className="w-[0.7rem] h-[0.7rem] rounded-md bg-black p-1"
                        />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('map');
                        }}
                        title={`${item.nickname && item.nickname + ' - '}${
                          item.address || ''
                        }${item.neighborhood ? ' ' + item.neighborhood : ''}`}
                      >
                        <Image
                          src={'/svg/list/map.svg'}
                          alt="map"
                          width={300}
                          height={300}
                          className="w-[0.7rem] h-[0.7rem] rounded-md bg-black p-1"
                        />
                      </button>
                    </div>
                  </td>
                  <td className="text-center pl-4">
                    {item.slot_width_px} x {item.slot_height_px}
                  </td>
                  <td className="text-center pl-4">{item.max_banners}</td>
                  <td
                    className={`text-center pl-4 ${getStatusClass(
                      displayStatus
                    )}`}
                  >
                    {displayStatus}
                  </td>
                  {renderAction && (
                    <td className="text-center">{renderAction(item)}</td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ✅ 모바일: 카드 형태로 표시 */}
      <div className="lg:hidden">
        {paginatedItems.map((item, index) => {
          const displayStatus = statusDisplayMap[item.status] || item.status;
          // const categoryDisplay = getLEDPanelTypeLabel(item.panel_type);
          const uniqueKey = item.id || `led-mobile-${index}`; // fallback key
          return (
            <div
              key={uniqueKey}
              className={`border-b border-gray-200 p-4 ${
                enableRowClick ? 'cursor-pointer' : ''
              }`}
              onClick={() => handleItemClick(item.id)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {showCheckbox && (
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={(e) =>
                          onItemSelect?.(item.id, e.target.checked)
                        }
                        onClick={(e) => e.stopPropagation()}
                        className="mr-2"
                      />
                    )}
                    <span className="text-sm text-gray-500 font-medium">
                      No. {item.panel_code || item.id}
                    </span>
                  </div>
                  <div className="font-medium text-black">
                    {item.nickname && <span> {item.nickname} - </span>}
                    {item.address ? <span>{item.address}</span> : <></>}
                    {item.neighborhood && (
                      <span className="ml-1 text-gray-500">
                        {item.neighborhood}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                <div>
                  규격: {item.slot_width_px} x {item.slot_height_px}px
                </div>
                <div>최대배너수: {item.max_banners}</div>
                <div>
                  상태:{' '}
                  <span className={getStatusClass(displayStatus)}>
                    {displayStatus}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="p-2 disabled:opacity-50"
          >
            <Image src={ArrowLeft} alt="Previous" width={20} height={20} />
          </button>
          <span className="text-sm">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="p-2 disabled:opacity-50"
          >
            <Image src={ArrowRight} alt="Next" width={20} height={20} />
          </button>
        </div>
      )}
    </>
  );
};

export default LEDItemList;
