'use client';

import Image from 'next/image';

export interface ProjectCardProps {
  imageSrc: string;
  title: string;
  subtitle?: string;
  description?: string;
  gridRowSpan?: boolean;
  isLarge?: boolean;
  className?: string;
}

export default function ProjectCard({
  imageSrc,
  title,
  subtitle,
  description,
  gridRowSpan = false,
  isLarge = false,
  className = '',
}: ProjectCardProps) {
  return (
    <div
      className={`
        relative group rounded-2xl overflow-hidden w-full 
        ${gridRowSpan ? 'row-span-2' : ''}
        ${isLarge ? 'col-span-2' : ''}
        ${className}
      `}
    >
      <div className="relative w-full h-full">
        <Image
          src={imageSrc}
          alt={title}
          fill
          sizes={isLarge ? '66vw' : '33vw'}
          priority={isLarge}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30 transition-opacity">
          <div className="absolute bottom-8 left-8 text-white">
            {subtitle && (
              <span className="text-sm mb-2 block opacity-80">{subtitle}</span>
            )}
            <h3
              className={`${
                isLarge ? 'text-2xl' : 'text-xl'
              } font-bold mb-2 gmarket`}
            >
              {title}
            </h3>
            {description && (
              <p className={`${isLarge ? 'text-lg' : 'text-base'} opacity-80`}>
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
