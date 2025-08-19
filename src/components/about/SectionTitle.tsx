interface SectionTitleProps {
  title: string;
}

export default function SectionTitle({ title }: SectionTitleProps) {
  return (
    <div className="flex justify-center mb-12">
      <div className="text-[#7D7D7D] lg:text-[1.5rem] md:text-[1rem] sm:text-[0.8rem] font-500 lg:w-[11.125rem] md:w-[8rem] sm:w-[5rem] rounded-full border-solid border-[0.1rem] border-[#D9D9D9] text-center py-2">
        {title}
      </div>
    </div>
  );
}
