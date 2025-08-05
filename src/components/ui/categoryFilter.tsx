import { Button } from '../button/button';
interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryFilter = ({
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) => {
  const categories = [
    { id: 'all', name: '전체' },
    { id: '공공디자인', name: '공공디자인' },
    { id: 'LED전자게시대', name: 'LED전자게시대' },
    { id: '현수막', name: '현수막' },
    { id: '디지털미디어', name: '디지털미디어' },
  ];

  return (
    <div className="w-full mb-6">
      <div className="flex lg:flex-wrap sm:flex-nowrap overflow-x-auto gap-2 sm:px-2">
        {categories.map((category) => (
          <Button
            variant="outlineGray"
            size="sm"
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`px-4 py-2 text-sm whitespace-nowrap  sm:text-0.875 ${
              selectedCategory === category.id
                ? 'bg-black text-white hover:bg-gray-800'
                : 'hover:bg-gray-200'
            }`}
          >
            {category.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
