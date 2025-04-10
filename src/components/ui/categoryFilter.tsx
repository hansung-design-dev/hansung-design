import { Button } from './button';
type Category =
  | '전체'
  | '공공디자인'
  | 'LED전자게시대'
  | '현수막'
  | '디지털사이니지';

interface CategoryFilterProps {
  selectedCategory: Category;
  setSelectedCategory: (category: Category) => void;
}
const CategoryFilter = ({
  selectedCategory,
  setSelectedCategory,
}: CategoryFilterProps) => {
  const categories = [
    '전체',
    '공공디자인',
    'LED전자게시대',
    '현수막',
    '디지털사이니지',
  ];
  return (
    <div className="flex flex-wrap gap-2 mb-6 text-1 font-500 border-1 border-gray-200 rounded-lg w-full">
      <div className="flex gap-2">
        {categories.map((category) => (
          <Button
            variant="outlineGray"
            size="sm"
            key={category}
            onClick={() => setSelectedCategory(category as Category)}
            className={`px-4 py-2 rounded-full border  shadow-none ${
              selectedCategory === category
                ? 'bg-black text-white border-black w-[7.5rem] py-[1rem]'
                : 'border-gray-200 text-gray-600 hover:border-gray-400 w-[7.5rem] py-[1rem] border-[0.1rem]'
            }`}
          >
            {category}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
