import { useState } from 'react';
import ArrowLeft from '@/src/icons/arrow-left.svg';
import ArrowRight from '@/src/icons/arrow-right.svg';
import Image from 'next/image';
import { DisplayBillboard } from '@/src/types/displaydetail';

const statusColorMap: Record<string, string> = {
  진행중: 'text-[#109251]',
  마감: 'text-[#7D7D7D]',
};

const statusDisplayMap: { [key: string]: string } = {
  active: '진행중',
  inactive: '마감',
};

const bannerTypeDisplayMap: { [key: string]: string } = {
  panel: '판넬형',
  'semi-auto': '반자동',
  with_lighting: '조명용',
  no_lighting: '비조명용',
  top_fixed: '상단고정',
};

const getStatusClass = (status: string) => {
  return statusColorMap[status] || 'text-black';
};

interface ItemTableProps {
  items: DisplayBillboard[];
  showHeader?: boolean;
  showCheckbox?: boolean;
  renderAction?: (item: DisplayBillboard) => React.ReactNode;
  onItemSelect?: (id: number, checked: boolean) => void;
  selectedIds?: number[];
  enableRowClick?: boolean;
}

const ITEMS_PER_PAGE = 20;

const ItemList: React.FC<ItemTableProps> = ({
  items,
  showHeader = true,
  showCheckbox = false,
  renderAction,
  onItemSelect,
  selectedIds = [],
  enableRowClick = true,
}) => {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const paginatedItems = items.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handleItemClick = (itemId: number) => {
    if (onItemSelect) {
      const isSelected = selectedIds.includes(itemId);
      onItemSelect(itemId, !isSelected);
    }
  };

  const handleRowClick = (e: React.MouseEvent, itemId: number) => {
    if ((e.target as HTMLElement).tagName === 'INPUT') {
      return;
    }

    // 아이콘 버튼 영역 클릭 시 아이템 선택 방지
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.tagName === 'BUTTON') {
      return;
    }

    handleItemClick(itemId);
  };

  // 구분 컬럼에 표시할 값 계산 함수
  const getPanelTypeLabel = (panelType?: string) => {
    if (!panelType) return '현수막게시대';

    switch (panelType) {
      case 'multi-panel':
        return '연립형';
      case 'lower-panel':
        return '저단형';
      case 'bulletin-board':
        return '시민/문화게시판';
      default:
        return '현수막게시대';
    }
  };

  const getCategoryDisplay = (item: DisplayBillboard) => {
    // 마포구의 경우 panel_type을 우선 사용
    if (item.panel_type) {
      return getPanelTypeLabel(item.panel_type);
    }

    // BannerBillboard인지 확인 후 banner_type 접근
    if (item.type === 'banner') {
      const displayBannerType = item.banner_type
        ? bannerTypeDisplayMap[item.banner_type] || item.banner_type
        : '';
      const category = item.is_for_admin ? '행정' : '상업';
      const fullCategory =
        displayBannerType && displayBannerType.trim() !== ''
          ? `${category} / ${displayBannerType}`
          : category;

      return fullCategory;
    }

    // LED의 경우 기본값 반환
    return 'LED전자게시대';
  };

  return (
    <>
      {/* ✅ 데스크탑/tablet 이상: table로 표시 */}
      <div className="overflow-x-auto hidden lg:block">
        <table className="w-full  border-collapse border-t border-gray-200 text-0.875">
          {showHeader && (
            <thead>
              <tr className="border-b border-gray-200 h-[3rem] text-gray-500 font-medium">
                {showCheckbox && <th className="w-10">no</th>}
                <th className="text-left pl-4">게시대 명</th>
                <th className="text-center pl-4"></th>
                <th className="text-center pl-4">규격(cm)</th>
                <th className="text-center pl-4">면수</th>
                <th className="text-center pl-4">가격</th>
                <th className="text-center pl-4">구분</th>
                <th className="text-center pl-4">수량</th>
                <th className="text-center pl-4">상태</th>
                {renderAction && <th className="text-center">작업</th>}
              </tr>
            </thead>
          )}
          <tbody>
            {paginatedItems.map((item) => {
              const displayStatus =
                statusDisplayMap[item.status] || item.status;
              const categoryDisplay = getCategoryDisplay(item);
              const isSpecialDistrict =
                item.district === '송파구' || item.district === '용산구';
              return (
                <tr
                  key={item.id}
                  className={`border-b border-gray-200 h-[3.5rem] hover:bg-gray-50 ${
                    enableRowClick ? 'cursor-pointer' : ''
                  } ${
                    item.type === 'banner' && item.is_for_admin
                      ? 'bg-yellow-100 hover:bg-yellow-200'
                      : ''
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
                      >
                        <Image
                          src={'/svg/list/map.svg'}
                          alt="map"
                          width={300}
                          height={300}
                          className="w-[0.7rem] h-[0.7rem] rounded-md bg-black p-1"
                        />{' '}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('navigation');
                        }}
                      >
                        <Image
                          src={'/svg/list/navigation.svg'}
                          alt="navi"
                          width={300}
                          height={300}
                          className="w-[0.7rem] h-[0.7rem] rounded-md bg-black p-1"
                        />
                      </button>
                    </div>
                  </td>
                  <td className="text-center pl-4">
                    {item.panel_width && item.panel_height
                      ? `${item.panel_width} x ${item.panel_height}`
                      : '-'}
                  </td>
                  <td className="text-center pl-4">
                    {item.faces ? `${item.faces}` : '-'}
                  </td>
                  <td className="text-center pl-4">
                    {isSpecialDistrict ? '-' : item.price}
                  </td>
                  <td className="text-center pl-4">{categoryDisplay}</td>
                  <td className="text-center pl-4">
                    {item.faces ? `${item.faces}` : '-'}
                  </td>
                  <td
                    className={`text-center font-semibold pl-4 ${getStatusClass(
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
            {/* 빈 row로 높이 맞추기 */}
            {Array.from({ length: ITEMS_PER_PAGE - paginatedItems.length }).map(
              (_, i) => (
                <tr key={`empty-${i}`} className="h-[3.5rem]">
                  <td colSpan={showCheckbox ? 9 : 8} />
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ 모바일(sm, md): 카드형으로 표시 */}
      <div className="flex flex-col gap-4 lg:hidden items-center ">
        {paginatedItems.map((item) => {
          const displayStatus = statusDisplayMap[item.status] || item.status;
          const categoryDisplay = getCategoryDisplay(item);
          return (
            <div
              key={item.id}
              className={`md:w-full sm:w-[70%] border-solid border-gray-200 rounded-lg p-12 flex flex-col gap-2 shadow-sm hover:bg-gray-50 ${
                enableRowClick ? 'cursor-pointer' : ''
              }`}
              onClick={() => {
                if (enableRowClick && !showCheckbox) {
                  handleItemClick(item.id);
                }
              }}
            >
              {showCheckbox && (
                <div
                  className="flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.id)}
                    onChange={(e) => onItemSelect?.(item.id, e.target.checked)}
                  />
                  <div className="font-medium text-black">{item.name}</div>
                </div>
              )}
              {!showCheckbox && (
                <div className="font-medium text-black">{item.name}</div>
              )}

              {item.neighborhood && (
                <div className="text-gray-500">{item.neighborhood}</div>
              )}
              <div className="text-0.875">행정동: {item.neighborhood}</div>
              <div className="text-0.875">
                상태:&nbsp;
                <span
                  className={`text-0.875 ${getStatusClass(
                    displayStatus
                  )} font-medium`}
                >
                  {displayStatus}
                </span>
              </div>

              <div className="text-0.875">구분: {categoryDisplay}</div>
              <div className="text-0.875">수량: {item.faces ?? '-'}</div>
              {renderAction && <div>{renderAction(item)}</div>}
            </div>
          );
        })}
      </div>
      {/* 페이지네이션 UI */}
      <div className="flex justify-center items-center gap-4 mt-4 pb-10">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="w-3 h-3 flex items-center justify-center"
        >
          <ArrowLeft className="w-4 h-4 text-gray-14" />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
          <button
            key={num}
            onClick={() => setPage(num)}
            className={`w-3 h-3 flex items-center justify-center text-1.25 font-500 rounded ${
              page === num ? 'text-black' : 'text-gray-14'
            }`}
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="w-3 h-3 flex items-center justify-center"
        >
          <ArrowRight className="w-4 h-4 text-gray-14" />
        </button>
      </div>
    </>
  );
};

export default ItemList;
