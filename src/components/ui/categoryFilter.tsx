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
    { id: 'pending', name: '대기중' },
    { id: 'inProgress', name: '진행중' },
    { id: 'completed', name: '완료' },
    { id: 'cancelled', name: '취소' },
  ];

  return (
    <div className="w-full mb-6">
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            variant="outlineGray"
            size="sm"
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`px-4 py-2 text-sm ${
              selectedCategory === category.id
                ? 'bg-black text-white'
                : ' hover:bg-gray-200'
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
