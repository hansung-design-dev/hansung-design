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

const ItemList = ({ items }: { items: ListItem[] }) => (
  <div className="border-t border-gray-200">
    {items.map((item) => (
      <div
        key={item.id}
        className="grid grid-cols-10 py-4 px-6 border-b border-gray-200 items-center"
      >
        <div className="col-span-4">
          <div className="flex gap-3 font-500 text-1.25 text-black">
            <div>{item.title}</div>
            {item.subtitle && <div>{item.subtitle}</div>}
          </div>
        </div>
        <div className="col-span-2 text-center font-500 text-1.25 text-black">
          {item.location}
        </div>
        <div className="col-span-2 text-center font-500 text-1.25 text-black">
          {item.status}
        </div>
        <div className="col-span-2 text-center">
          <button className="border border-solid border-black w-[7.5rem] py-2 text-sm font-medium text-black rounded-full">
            신청 취소
          </button>
        </div>
      </div>
    ))}
  </div>
);

export default ItemList;
