import Link from 'next/link';
import { Button } from './button';

interface ListItem {
  id: number;
  title: string;
  subtitle?: string;
  location?: string;
  status: string;
  date?: string;
  category?: string;
  price?: number;
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

const ItemList = ({ items }: { items: ListItem[] }) => (
  <div className="border-t border-gray-200 py-[2rem]">
    {items.map((item) => (
      <Link
        href={`/mypage/orders/${item.id}`}
        key={item.id}
        className="border-b border-gray-200 px-6 py-4"
      >
        {/* ✅ 데스크탑 / 태블릿 (768px 이상부터) */}
        <div className="hidden lg:grid lg:grid-cols-9 lg:items-center">
          {/* 타이틀 */}
          <div className="col-span-5 font-500 text-black text-1.25">
            {item.title}&nbsp;
            {item.subtitle && <span>{item.subtitle}</span>}
          </div>

          {/* 위치 */}
          <div className="col-span-1 text-center font-500 text-black text-1.25">
            {item.location}
          </div>

          {/* 상태 */}
          <div
            className={`col-span-1 text-center font-500 text-1.25 ${getStatusClass(
              item.status
            )}`}
          >
            {item.status}
          </div>

          {/* 버튼 */}
          <div className="col-span-2 text-center">
            <button
              className={`border ${
                item.status === '송출중'
                  ? 'border-[#DADADA] text-[#DADADA]'
                  : 'border-black text-black'
              } border-solid border-[1px] w-[7.5rem] py-2 text-sm font-medium rounded-full`}
              disabled={item.status === '송출중'}
            >
              신청 취소
            </button>
          </div>
        </div>

        {/* ✅ 모바일 (768px 미만) */}
        <div className="flex flex-col gap-5 items-center lg:hidden border-b-solid border-b-gray-13 border-b-[0.1rem] pb-5 w-full">
          {/* 타이틀 */}
          <div className="font-500 text-black text-1.25">
            {item.title}&nbsp;
            {item.subtitle && <span>{item.subtitle}</span>}
          </div>

          {/* 아래 줄: 위치, 상태, 버튼 */}
          <div className="flex gap-10 items-center">
            <div className="font-500 text-black text-0.875">
              {item.location}
            </div>
            <div
              className={`font-500 text-0.875 ${getStatusClass(item.status)}`}
            >
              {item.status}
            </div>
            <Button
              variant="outline"
              size="sm"
              className={`border ${
                item.status === '송출중'
                  ? 'border-[#DADADA] text-[#DADADA]'
                  : 'border-black text-black'
              } border-solid border-[1px]  sm:text-0.875  rounded-full`}
              disabled={item.status === '송출중'}
            >
              신청 취소
            </Button>
          </div>
        </div>
      </Link>
    ))}
  </div>
);

export default ItemList;
