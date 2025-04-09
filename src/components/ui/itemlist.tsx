import Link from 'next/link';

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
        className="grid grid-cols-9 py-4 px-6 border-b border-gray-200 items-center"
      >
        <div className="col-span-5">
          <div className="flex lg:font-500 lg:text-1.25 lg:font-500 text-black">
            <div>{item.title}&nbsp;</div>
            {item.subtitle && <div>{item.subtitle}</div>}
          </div>
        </div>
        <div className="col-span-1 text-center font-500 text-1.25 text-black">
          {item.location}
        </div>
        <div
          className={`col-span-1 text-center font-500 text-1.25 ${getStatusClass(
            item.status
          )}`}
        >
          {item.status}
        </div>
        <div className="col-span-2 text-center">
          <button className="border border-solid border-black border-[1px] w-[7.5rem] py-2 text-sm font-medium text-black rounded-full">
            신청 취소
          </button>
        </div>
      </Link>
    ))}
  </div>
);

export default ItemList;
