import { useState } from 'react';
import { Button } from './button/button';
import GuidelineModal from './modal/GuidelineModal';

interface GuidelineButtonProps {
  district: string;
  guidelineType?: string;
  className?: string;
  children?: React.ReactNode;
}

export default function GuidelineButton({
  district,
  guidelineType = 'panel',
  className = '',
  children,
}: GuidelineButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button
        size="sm"
        variant="outlinedBlack"
        onClick={handleOpenModal}
        className={className}
      >
        {children || '가이드라인 보기'}
      </Button>

      <GuidelineModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        district={district}
        guidelineType={guidelineType}
      />
    </>
  );
}
