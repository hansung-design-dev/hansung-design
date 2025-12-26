import { useState } from 'react';
import ArrowLeft from '@/src/icons/arrow-left.svg';
import ArrowRight from '@/src/icons/arrow-right.svg';
import { DisplayBillboard } from '@/src/types/displaydetail';
// PhotoModal is temporarily disabled
// import PhotoModal from '@/src/components/modal/PhotoModal';

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
  semi_auto: '반자동',
  with_lighting: '조명용',
  no_lighting: '비조명용',
  top_fixed: '상단광고',
};

const getStatusClass = (status: string) => {
  return statusColorMap[status] || 'text-black';
};

const getEffectiveIsClosed = (item: DisplayBillboard) =>
  (item as DisplayBillboard & { effectiveIsClosed?: boolean })
    .effectiveIsClosed ?? item.is_closed;

const getEffectiveStatusKey = (item: DisplayBillboard) =>
  (item as DisplayBillboard & { effectiveStatus?: string }).effectiveStatus ||
  item.status;

interface ItemTableProps {
  items: DisplayBillboard[];
  showHeader?: boolean;
  showCheckbox?: boolean;
  renderAction?: (item: DisplayBillboard) => React.ReactNode;
  onItemSelect?: (id: string, checked: boolean) => void;
  selectedIds?: string[];
  enableRowClick?: boolean;
  hideQuantityColumns?: boolean; // 상단광고 탭에서 면수/수량 컬럼 숨김
  hideStatusColumn?: boolean; // 시민게시대 탭에서 상태 컬럼 숨김
  district?: string; // 구 이름 추가
  isCitizenBoardTab?: boolean; // 시민게시대 탭 여부
}

const ITEMS_PER_PAGE = 40;

const ItemList: React.FC<ItemTableProps> = ({
  items,
  showHeader = true,
  showCheckbox = false,
  renderAction,
  onItemSelect,
  selectedIds = [],
  enableRowClick = true,
  hideQuantityColumns = false,
  hideStatusColumn = false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  district,
  isCitizenBoardTab = false,
}) => {
  const [page, setPage] = useState(1);
  // PhotoModal related states are temporarily disabled
  // const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  // const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  // const [currentItemIndex, setCurrentItemIndex] = useState(0);

  const itemsPerPage = ITEMS_PER_PAGE;

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const paginatedItems = items.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
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

    const clickedItem = items.find((entry) => entry.id === itemId);
    if (clickedItem) {
      const isClosed = getEffectiveIsClosed(clickedItem);
      const statusKey = getEffectiveStatusKey(clickedItem);
      if (isClosed) {
        console.log('[ItemList] 마감여부 클릭', {
          id: itemId,
          statusKey,
          isClosed,
        });
        return;
      }
    }

    handleItemClick(itemId.toString());
  };

  // 사진 모달 관련 함수들 (임시 비활성화)
  /*
  const openPhotoModal = (itemIndex: number) => {
    setCurrentItemIndex(itemIndex);
    setCurrentPhotoIndex(0);
    setIsPhotoModalOpen(true);
  };

  const closePhotoModal = () => {
    setIsPhotoModalOpen(false);
  };

  const handlePhotoChange = (index: number) => {
    setCurrentPhotoIndex(index);
  };

  const getCurrentItemPhotos = (): string[] => {
    if (currentItemIndex >= 0 && currentItemIndex < items.length) {
      const item = items[currentItemIndex];
      return item.photo_url ? [item.photo_url] : [];
    }
    return [];
  };

  const getCurrentItemName = (): string => {
    if (currentItemIndex >= 0 && currentItemIndex < items.length) {
      const item = items[currentItemIndex];
      return item.nickname || item.name || '';
    }
    return '';
  };
  */

  // 구분 컬럼에 표시할 값 계산 함수
  const getPanelTypeLabel = (panelType?: string, district?: string) => {
    if (!panelType) return '현수막게시대';

    switch (panelType) {
      case 'multi_panel':
        return '패널형게시대';
      case 'lower_panel':
        return '현수막게시대';
      case 'bulletin_board':
        return '시민게시대';
      case 'cultural_board':
        return '시민/문화게시대';
      case 'with_lighting':
        return '패널형게시대';
      case 'no_lighting':
        return '현수막게시대';
      case 'semi_auto':
        return '현수막게시대';
      case 'panel':
        // 관악구의 패널형은 현수막게시대로, 나머지는 패널형게시대로
        return district === '관악구' ? '현수막게시대' : '패널형게시대';
      case 'top_fixed':
        return '상단광고';
      default:
        return '현수막게시대';
    }
  };

  const getCategoryDisplay = (item: DisplayBillboard) => {
    // 마포구의 경우 panel_type을 우선 사용
    if (item.panel_type) {
      return getPanelTypeLabel(item.panel_type, item.district);
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
      <div className="hidden lg:block overflow-x-auto">
        <div className="min-w-full border border-gray-200/70 rounded-xl overflow-hidden bg-white [&_th]:border-l [&_td]:border-l [&_th]:border-gray-200/50 [&_td]:border-gray-200/50 [&_th:first-child]:border-l-0 [&_td:first-child]:border-l-0">
          <table className="w-full border-collapse text-0.875">
            {showHeader && (
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200/70 h-[3rem] text-gray-600 font-medium">
                  {showCheckbox && <th className="w-10"></th>}
                  <th className="text-center pl-4">No</th>
                  <th className="text-left pl-4">게시대 명</th>
                  {isCitizenBoardTab ? (
                    <>
                      <th className="text-center pl-4">시민게시대 규격</th>
                      <th className="text-center pl-4">시민게시대 기간</th>
                      <th className="text-center pl-4">중앙광고 규격</th>
                      <th className="text-center pl-4">중앙광고 기간</th>
                      <th className="text-center pl-4">중앙광고 상태</th>
                    </>
                  ) : (
                    <>
                      <th className="text-center pl-4">규격(cm)</th>
                      {!hideQuantityColumns && (
                        <th className="text-center pl-4">면수</th>
                      )}
                      <th className="text-center pl-4">가격</th>
                      <th className="text-center pl-4">기간</th>
                      <th className="text-center pl-4">구분</th>
                      {!hideQuantityColumns && (
                        <th className="text-center pl-4">남은수량</th>
                      )}
                      {!hideStatusColumn && (
                        <th className="text-center pl-4">상태</th>
                      )}
                    </>
                  )}
                  {renderAction && <th className="text-center">작업</th>}
                </tr>
              </thead>
            )}
            <tbody>
              {paginatedItems.map((item) => {
                const isClosed = getEffectiveIsClosed(item);
                const statusKey = getEffectiveStatusKey(item);
                const displayStatus = statusDisplayMap[statusKey] || statusKey;
                const categoryDisplay = getCategoryDisplay(item);
                const isSpecialDistrict =
                  item.district === '송파구' || item.district === '용산구';
                return (
                  <tr
                    key={item.id}
                    className={`border-b border-gray-200/70 h-[3.5rem] hover:bg-gray-50 ${
                      enableRowClick ? 'cursor-pointer' : ''
                    } ${
                      item.type === 'banner' && item.is_for_admin
                        ? 'bg-yellow-100 hover:bg-yellow-200'
                        : ''
                    } ${
                      isClosed ? 'bg-gray-100 text-gray-500 opacity-60' : ''
                    }`}
                    onClick={(e) => handleRowClick(e, item.id)}
                  >
                    {showCheckbox && (
                      <td
                        className="text-center px-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {item.district === '마포구' &&
                        (item.panel_type === 'bulletin_board' ||
                          item.panel_type === 'cultural_board') ? (
                          <span></span>
                        ) : (
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(item.id)}
                            onChange={(e) =>
                              onItemSelect?.(item.id, e.target.checked)
                            }
                            disabled={isClosed}
                            className={`hover:cursor-pointer ${
                              isClosed ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          />
                        )}
                      </td>
                    )}
                    <td className="text-center pl-4">
                      <span className={item.is_closed ? 'text-gray-500' : ''}>
                        {item.panel_code || item.id}
                      </span>
                    </td>
                    <td className="pl-4">
                      <div
                        className={`font-medium cursor-pointer ${
                          item.is_closed ? 'text-gray-500' : 'text-black'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleItemClick(item.id);
                        }}
                      >
                        {item.nickname && <span> {item.nickname} - </span>}
                        {item.address ? <span>{item.address}</span> : <></>}

                        {item.neighborhood && (
                          <span
                            className={`ml-1 ${
                              item.is_closed ? 'text-gray-400' : 'text-gray-500'
                            }`}
                          >
                            {item.neighborhood}
                          </span>
                        )}
                        {item.maintenance_notes && (
                          <span className="text-pink-500 text-sm ml-2">
                            ({item.maintenance_notes})
                          </span>
                        )}
                      </div>
                    </td>

                    {isCitizenBoardTab ? (
                      <>
                        <td className="text-center pl-4">
                          {item.panel_width && item.panel_height
                            ? `${item.panel_width} x ${item.panel_height}`
                            : '-'}
                        </td>
                        <td className="text-center pl-4">
                          {(() => {
                            // 시민게시대 기간 (일반 슬롯들의 기간)
                            const regularSlots = item.banner_slots?.filter(
                              (slot) => slot.slot_number !== 0
                            );
                            if (regularSlots && regularSlots.length > 0) {
                              const firstSlot = regularSlots[0];
                              if ('price_unit' in firstSlot) {
                                const priceUnit = (
                                  firstSlot as { price_unit?: string }
                                ).price_unit;
                                return priceUnit === '15 days'
                                  ? '15일'
                                  : priceUnit || '15일';
                              }
                            }
                            return '15일';
                          })()}
                        </td>
                        <td className="text-center pl-4">
                          {(() => {
                            const centerSlot = item.banner_slots?.find(
                              (slot) => slot.slot_number === 0
                            );
                            if (
                              centerSlot?.max_width &&
                              centerSlot?.max_height
                            ) {
                              return `${centerSlot.max_width} x ${centerSlot.max_height}`;
                            }
                            return '840 x 1650';
                          })()}
                        </td>
                        <td className="text-center pl-4">
                          {(() => {
                            const centerSlot = item.banner_slots?.find(
                              (slot) => slot.slot_number === 0
                            );
                            if (centerSlot && 'price_unit' in centerSlot) {
                              const priceUnit = (
                                centerSlot as { price_unit?: string }
                              ).price_unit;
                              return priceUnit === '1 month'
                                ? '1개월'
                                : priceUnit || '1개월';
                            }
                            return '1개월';
                          })()}
                        </td>
                        <td className="text-center pl-4">
                          <span
                            className={
                              item.center_ad_inventory?.is_occupied
                                ? 'text-red-500'
                                : 'text-[#109251]'
                            }
                          >
                            {item.center_ad_inventory?.is_occupied
                              ? '마감'
                              : '진행중'}
                          </span>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="text-center pl-4">
                          {item.panel_width && item.panel_height
                            ? `${item.panel_width} x ${item.panel_height}`
                            : '-'}
                        </td>
                        {!hideQuantityColumns && (
                          <td className="text-center pl-4">
                            {/* 면수: 총 면수 */}
                            {item.faces ? `${item.faces}` : '-'}
                          </td>
                        )}
                        <td className="text-center pl-4">
                          {isSpecialDistrict &&
                          item.type === 'banner' &&
                          item.banner_type === 'top_fixed'
                            ? '상담문의'
                            : item.price}
                        </td>
                        <td className="text-center pl-4">
                          {isSpecialDistrict &&
                          item.type === 'banner' &&
                          item.banner_type === 'top_fixed'
                            ? '1년'
                            : item.period || '15일'}
                        </td>
                        <td className="text-center pl-4">{categoryDisplay}</td>
                        {!hideQuantityColumns && (
                          <td className="text-center pl-4">
                            {/* 남은수량: available_faces가 있으면 사용, 없으면 faces */}
                            {typeof item.available_faces === 'number'
                              ? `${item.available_faces}`
                              : item.inventory_info?.current_period
                              ? `${item.inventory_info.current_period.available_slots}`
                              : item.inventory_info?.first_half
                              ? `${item.inventory_info.first_half.available_slots}`
                              : item.inventory_info?.second_half
                              ? `${item.inventory_info.second_half.available_slots}`
                              : item.faces
                              ? `${item.faces}`
                              : '-'}
                          </td>
                        )}
                        {!hideStatusColumn && (
                          <td
                            className={`text-center font-semibold pl-4 ${getStatusClass(
                              displayStatus
                            )}`}
                          >
                            {displayStatus}
                          </td>
                        )}
                      </>
                    )}
                    {renderAction && (
                      <td className="text-center">{renderAction(item)}</td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ 모바일(sm, md): 카드형으로 표시 */}
      <div className="flex flex-col gap-4 lg:hidden items-center ">
        {paginatedItems.map((item) => {
          const displayStatus = statusDisplayMap[item.status] || item.status;
          const categoryDisplay = getCategoryDisplay(item);
          const isSpecialDistrict =
            item.district === '송파구' || item.district === '용산구';
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
              <div className="flex items-center gap-2 mb-1">
                {showCheckbox &&
                  (item.district === '마포구' &&
                  (item.panel_type === 'bulletin_board' ||
                    item.panel_type === 'cultural_board') ? (
                    <span className="mr-2"></span>
                  ) : (
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={(e) =>
                        onItemSelect?.(item.id, e.target.checked)
                      }
                      onClick={(e) => e.stopPropagation()}
                      disabled={item.is_closed}
                      className={`mr-2 ${
                        item.is_closed ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    />
                  ))}
                <span
                  className={`text-sm font-medium ${
                    item.is_closed ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  No. {item.panel_code || item.id}
                </span>
              </div>
              {showCheckbox && (
                <div
                  className="flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    className={`font-medium ${
                      item.is_closed ? 'text-gray-500' : 'text-black'
                    }`}
                  >
                    {item.nickname && <span>{item.nickname} - </span>}
                    {item.address ? <span>{item.address}</span> : <></>}

                    {item.neighborhood && (
                      <span
                        className={`ml-1 ${
                          item.is_closed ? 'text-gray-400' : 'text-gray-500'
                        }`}
                      >
                        {item.neighborhood}
                      </span>
                    )}
                    {item.maintenance_notes && (
                      <span className="text-pink-500 text-sm ml-2">
                        ({item.maintenance_notes})
                      </span>
                    )}
                  </div>
                </div>
              )}
              {!showCheckbox && (
                <div
                  className={`font-medium ${
                    item.is_closed ? 'text-gray-500' : 'text-black'
                  }`}
                >
                  {item.nickname && <span>{item.nickname} - </span>}
                  {item.address ? <span>{item.address}</span> : <></>}
                  {item.neighborhood && (
                    <span
                      className={`ml-1 ${
                        item.is_closed ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      {item.neighborhood}
                    </span>
                  )}
                  {item.maintenance_notes && (
                    <span className="text-pink-500 text-sm ml-2">
                      ({item.maintenance_notes})
                    </span>
                  )}
                </div>
              )}

              {item.neighborhood && (
                <div className="text-gray-500">{item.neighborhood}</div>
              )}
              <div className="text-0.875">행정동: {item.neighborhood}</div>

              {isCitizenBoardTab ? (
                <>
                  <div className="text-0.875">
                    시민게시대 규격:{' '}
                    {item.panel_width && item.panel_height
                      ? `${item.panel_width} x ${item.panel_height}`
                      : '-'}
                  </div>
                  <div className="text-0.875">
                    시민게시대 기간:{' '}
                    {(() => {
                      // 시민게시대 기간 (일반 슬롯들의 기간)
                      const regularSlots = item.banner_slots?.filter(
                        (slot) => slot.slot_number !== 0
                      );
                      if (regularSlots && regularSlots.length > 0) {
                        const firstSlot = regularSlots[0];
                        if ('price_unit' in firstSlot) {
                          const priceUnit = (
                            firstSlot as { price_unit?: string }
                          ).price_unit;
                          return priceUnit === '15 days'
                            ? '15일'
                            : priceUnit || '15일';
                        }
                      }
                      return '15일';
                    })()}
                  </div>
                  <div className="text-0.875">
                    중앙광고 규격:{' '}
                    {(() => {
                      const centerSlot = item.banner_slots?.find(
                        (slot) => slot.slot_number === 0
                      );
                      if (centerSlot?.max_width && centerSlot?.max_height) {
                        return `${centerSlot.max_width} x ${centerSlot.max_height}`;
                      }
                      return '840 x 1650';
                    })()}
                  </div>
                  <div className="text-0.875">
                    중앙광고 기간:{' '}
                    {(() => {
                      const centerSlot = item.banner_slots?.find(
                        (slot) => slot.slot_number === 0
                      );
                      if (centerSlot && 'price_unit' in centerSlot) {
                        const priceUnit = (
                          centerSlot as { price_unit?: string }
                        ).price_unit;
                        return priceUnit === '1 month'
                          ? '1개월'
                          : priceUnit || '1개월';
                      }
                      return '1개월';
                    })()}
                  </div>
                  <div className="text-0.875">
                    중앙광고 상태:{' '}
                    <span
                      className={
                        item.center_ad_inventory?.is_occupied
                          ? 'text-red-500'
                          : 'text-[#109251]'
                      }
                    >
                      {item.center_ad_inventory?.is_occupied
                        ? '마감'
                        : '진행중'}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-0.875">구분: {categoryDisplay}</div>
                  <div className="text-0.875">
                    기간:{' '}
                    {isSpecialDistrict &&
                    item.type === 'banner' &&
                    item.banner_type === 'top_fixed'
                      ? '1년'
                      : item.period || '15일'}
                  </div>
                  {!hideQuantityColumns && (
                    <div className="text-0.875">
                      남은수량:{' '}
                      {typeof item.available_faces === 'number'
                        ? item.available_faces
                        : item.inventory_info?.current_period
                        ? item.inventory_info.current_period.available_slots
                        : item.inventory_info?.first_half
                        ? item.inventory_info.first_half.available_slots
                        : item.inventory_info?.second_half
                        ? item.inventory_info.second_half.available_slots
                        : item.faces ?? '-'}
                    </div>
                  )}
                  {!hideStatusColumn && (
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
                  )}
                </>
              )}
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

      {/* 사진 모달 */}
      {/* PhotoModal is temporarily disabled
   <PhotoModal
        isOpen={isPhotoModalOpen}
        onClose={closePhotoModal}
        photos={getCurrentItemPhotos()}
        currentIndex={currentPhotoIndex}
        onPhotoChange={handlePhotoChange}
        currentItemName={getCurrentItemName()}
      />
   */}
    </>
  );
};

export default ItemList;
