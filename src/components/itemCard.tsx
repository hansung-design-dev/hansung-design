import Image from 'next/image';
import Link from 'next/link';

interface ItemCardProps {
  item: {
    id: string | number;
    title: string;
    tags: string[];
    src: string;
  };
}

export default function ItemCard({ item }: ItemCardProps) {
  return (
    <Link
      href={`/digital-signage/${item.id}`}
      className="bg-white flex flex-col items-center justify-center hover:opacity-80 transition-opacity"
    >
      <div className="flex flex-col items-start justify-center ">
        <Image
          src={item.src}
          alt={item.title}
          width={400}
          height={400}
          className="lg:w-[25rem] lg:h-[25rem] object-cover rounded-[1.25rem] md:w-[15rem] md:h-[15rem] sm:w-[15rem] sm:h-[15rem] "
        />
        <div className="flex flex-col flex-1 mt-4">
          <div className="flex gap-2 mb-2">
            {item.tags.map((tag, index) => (
              <span
                className="bg-black text-white text-xs rounded-[1.25rem] px-3 py-1"
                key={index}
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="text-xl font-bold text-black mt-2">{item.title}</div>
        </div>
      </div>
    </Link>
  );
}
