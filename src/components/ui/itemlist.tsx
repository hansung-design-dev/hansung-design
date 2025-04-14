import React from 'react';

interface ListItem {
  id: number;
  title: string;
  subtitle?: string;
  location?: string;
  status: string;
  quantity?: number;
}

const statusColorMap: Record<string, string> = {
  추가결제: 'text-[#D61919]',
  파일오류: 'text-[#D61919]',
  송출중: 'text-[#109251]',
  진행중: 'text-[#000000]',
  마감: 'text-[#7D7D7D]',
};

const getStatusClass = (status: string) => {
  return statusColorMap[status] || 'text-black';
};

interface ItemTableProps {
  items: ListItem[];
  showHeader?: boolean;
  showCheckbox?: boolean;
  renderAction?: (item: ListItem) => React.ReactNode;
  onItemSelect?: (id: number, checked: boolean) => void;
}

const ItemList: React.FC<ItemTableProps> = ({
  items,
  showHeader = true,
  showCheckbox = false,
  renderAction,
  onItemSelect,
}) => {
  return (
    <>
      {/* ✅ 데스크탑/tablet 이상: table로 표시 */}
      <div className="overflow-x-auto hidden sm:hidden">
        <table className="w-full text-left border-t border-gray-200 text-0.875">
          {showHeader && (
            <thead>
              <tr className="border-b border-gray-200 h-[3rem] text-gray-500 font-medium">
                {showCheckbox && <th className="w-10 px-4">no</th>}
                <th>게시대 명</th>
                <th className="text-center">행정동</th>
                <th className="text-center">마감여부</th>
                <th className="text-center">남은수량</th>
                {renderAction && <th className="text-center">작업</th>}
              </tr>
            </thead>
          )}
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className="border-b border-gray-200 h-[3.5rem] hover:bg-gray-50"
              >
                {showCheckbox && (
                  <td className="text-center px-4">
                    <input
                      type="checkbox"
                      onChange={(e) =>
                        onItemSelect?.(item.id, e.target.checked)
                      }
                    />
                  </td>
                )}
                <td className="px-4">
                  <span className="font-medium text-black">
                    {item.title}
                    {item.subtitle && (
                      <span className="ml-1 text-gray-500">
                        {item.subtitle}
                      </span>
                    )}
                  </span>
                </td>
                <td className="text-center">{item.location}</td>
                <td
                  className={`text-center font-semibold ${getStatusClass(
                    item.status
                  )}`}
                >
                  {item.status}
                </td>
                <td className="text-center">{item.quantity ?? '-'}</td>
                {renderAction && (
                  <td className="text-center">{renderAction(item)}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ 모바일(sm): 카드형으로 표시 */}
      <div className="flex flex-col gap-4 sm:block">
        {items.map((item) => (
          <div
            key={item.id}
            className="border border-gray-200 rounded-lg p-4 flex flex-col gap-2"
          >
            {showCheckbox && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  onChange={(e) => onItemSelect?.(item.id, e.target.checked)}
                />
                <div className="font-medium text-black">{item.title}</div>
              </div>
            )}
            {!showCheckbox && (
              <div className="font-medium text-black">{item.title}</div>
            )}

            {item.subtitle && (
              <div className="text-gray-500">{item.subtitle}</div>
            )}
            <div className="text-0.875">행정동: {item.location}</div>
            <div
              className={`text-0.875 ${getStatusClass(
                item.status
              )} font-medium`}
            >
              상태: {item.status}
            </div>
            <div className="text-0.875">남은 수량: {item.quantity ?? '-'}</div>
            {renderAction && <div>{renderAction(item)}</div>}
          </div>
        ))}
      </div>
    </>
  );
};

export default ItemList;
