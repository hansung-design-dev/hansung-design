'use client';

import React from 'react';
import ProjectCard from './projectCard';

// Define the project item structure
export interface ProjectItem {
  id: number;
  imageSrc: string;
  title: string;
  subtitle?: string;
  description?: string;
}

// Define the props for the ProjectRow component
export interface ProjectRowProps {
  projects: ProjectItem[];
  largeCardFirst?: boolean;
  splitSmallSection?: boolean;
  className?: string;
  showTitleOnLargeOnly?: boolean;
}

export default function ProjectRow({
  projects,
  largeCardFirst = true,
  splitSmallSection = false,
  className = '',
  showTitleOnLargeOnly = false,
}: ProjectRowProps) {
  // 프로젝트가 없으면 렌더링하지 않음
  if (projects.length === 0) {
    return null;
  }

  // 프로젝트가 1개만 있으면 큰 카드로만 표시
  if (projects.length === 1) {
    return (
      <div
        className={`grid grid-cols-3 gap-6 ${className} lg:h-[32rem] sm:h-[23rem]`}
      >
        <div className="col-span-2 lg:h-[32rem] sm:h-[23rem]">
          <ProjectCard
            imageSrc={projects[0].imageSrc}
            title={projects[0].title}
            subtitle={projects[0].subtitle}
            description={projects[0].description}
            isLarge
            className="h-full"
          />
        </div>
        <div className="col-span-1 lg:h-[32rem] sm:h-[23rem]">
          <ProjectCard
            imageSrc={projects[0].imageSrc}
            title=""
            subtitle=""
            description=""
            className="h-full"
          />
        </div>
      </div>
    );
  }

  // Render the row with large card first
  if (largeCardFirst) {
    return (
      <div
        className={`grid grid-cols-3 gap-6 ${className} lg:h-[32rem] sm:h-[23rem]`}
      >
        <div className="col-span-2 lg:h-[32rem] sm:h-[23rem]">
          <ProjectCard
            imageSrc={projects[0].imageSrc}
            title={projects[0].title}
            subtitle={projects[0].subtitle}
            description={projects[0].description}
            isLarge
            className="h-full"
          />
        </div>

        <div
          className={`col-span-1 ${
            splitSmallSection ? 'grid grid-rows-2 gap-6' : ''
          } lg:h-[32rem] sm:h-[23rem]`}
        >
          {splitSmallSection ? (
            <>
              <ProjectCard
                imageSrc={projects[1].imageSrc}
                title={showTitleOnLargeOnly ? '' : projects[1].title}
                subtitle={showTitleOnLargeOnly ? '' : projects[1].subtitle}
                description={
                  showTitleOnLargeOnly ? '' : projects[1].description
                }
                className="lg:h-full sm:h-[23rem]"
              />
              <ProjectCard
                imageSrc={projects[2].imageSrc}
                title={showTitleOnLargeOnly ? '' : projects[2].title}
                subtitle={showTitleOnLargeOnly ? '' : projects[2].subtitle}
                description={
                  showTitleOnLargeOnly ? '' : projects[2].description
                }
                className="lg:h-full sm:h-[23rem]"
              />
            </>
          ) : (
            <ProjectCard
              imageSrc={projects[1].imageSrc}
              title={showTitleOnLargeOnly ? '' : projects[1].title}
              subtitle={showTitleOnLargeOnly ? '' : projects[1].subtitle}
              description={showTitleOnLargeOnly ? '' : projects[1].description}
              gridRowSpan
              className="lg:h-full sm:h-[23rem]"
            />
          )}
        </div>
      </div>
    );
  }

  // Render the row with small card first
  return (
    <div
      className={`grid grid-cols-3 gap-6 ${className} lg:h-[32rem] sm:h-[23rem]`}
    >
      <div
        className={`col-span-1 ${
          splitSmallSection ? 'grid grid-rows-2 gap-6' : ''
        } lg:h-[32rem] sm:h-[23rem]`}
      >
        {splitSmallSection ? (
          <>
            <ProjectCard
              imageSrc={projects[0].imageSrc}
              title={showTitleOnLargeOnly ? '' : projects[0].title}
              subtitle={showTitleOnLargeOnly ? '' : projects[0].subtitle}
              description={showTitleOnLargeOnly ? '' : projects[0].description}
              className="h-full"
            />
            <ProjectCard
              imageSrc={projects[1].imageSrc}
              title={showTitleOnLargeOnly ? '' : projects[1].title}
              subtitle={showTitleOnLargeOnly ? '' : projects[1].subtitle}
              description={showTitleOnLargeOnly ? '' : projects[1].description}
              className="h-full"
            />
          </>
        ) : (
          <ProjectCard
            imageSrc={projects[0].imageSrc}
            title={showTitleOnLargeOnly ? '' : projects[0].title}
            subtitle={showTitleOnLargeOnly ? '' : projects[0].subtitle}
            description={showTitleOnLargeOnly ? '' : projects[0].description}
            gridRowSpan
            className="h-full"
          />
        )}
      </div>

      <div className="col-span-2 lg:h-[32rem] sm:h-[23rem]">
        <ProjectCard
          imageSrc={
            splitSmallSection ? projects[2].imageSrc : projects[1].imageSrc
          }
          title={splitSmallSection ? projects[2].title : projects[1].title}
          subtitle={
            splitSmallSection ? projects[2].subtitle : projects[1].subtitle
          }
          description={
            splitSmallSection
              ? projects[2].description
              : projects[1].description
          }
          isLarge
          className="h-full"
        />
      </div>
    </div>
  );
}
