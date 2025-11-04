'use client';

import Image from 'next/image';
import { JSX } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface SectionProps {
  title: JSX.Element;
  subtitle?: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  reverse?: boolean;
  buttonText?: string;
  href?: string;
  list: string[];
}

const fadeInUp = {
  initial: {
    y: 60,
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
    },
  },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const Section = ({
  title,
  subtitle,
  description,
  imageSrc,
  imageAlt,
  reverse = false,
  buttonText = '자세히 보기',
  href = '#',
  list,
}: SectionProps) => {
  return (
    <section className="h-screen scroll-container sm:pb-[4rem]">
      <motion.div
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: false, amount: 0.2 }}
        className={`flex items-center justify-center lg:flex-row sm:flex-col md:flex-col ${
          reverse && 'lg:flex-row-reverse md:flex-row-reverse text-right '
        }  `}
      >
        <motion.div
          variants={fadeInUp}
          className={`flex-1  lg:min-w-[25rem] px-[5rem] sm:px-[1rem] sm:min-w-[22rem] md:min-w-[45rem] md:px-[2rem] pt-[2rem] sm:pt-[1rem] md:pt-[5rem] ${
            reverse && 'items-end justify-between '
          }`}
        >
          <div
            className={`flex lg:flex-col gap-[2rem] md:gap-[2rem] md:pb-3 md:items-start sm:flex-col sm:pb-6 sm:gap-[2.5rem] items-start text-left mr-[1rem] ${
              reverse && 'items-end text-right md:items-end '
            }`}
          >
            <div
              className={`flex flex-col lg:gap-[5rem] sm:gap-[2rem] md:gap-[1.25rem] ${
                reverse ? 'items-end text-right' : 'items-start text-left'
              }`}
            >
              <div className="flex flex-col gap-[0.75rem] sm:gap-[0.75rem] md:gap-[1.25rem]">
                {subtitle && (
                  <motion.div
                    variants={fadeInUp}
                    className="lg:text-2.25 sm:text-1 sm:font-weight-500 md:text-1.75 font-500"
                  >
                    {subtitle}
                  </motion.div>
                )}

                <motion.div
                  variants={fadeInUp}
                  className={`lg:text-4.375  font-bold font-gmarket flex flex-col  sm:text-1.75 md:text-3 font-weight-700 sm:line-height-[2.25rem]  ${
                    reverse ? 'text-right' : 'text-left'
                  }`}
                >
                  {title}
                </motion.div>
                <motion.div
                  variants={fadeInUp}
                  className="lg:text-2.25 sm:text-1 md:text-1.75 font-weight-500 text-gray-700 whitespace-nowrap"
                >
                  {description}
                </motion.div>
              </div>
              <motion.div
                variants={fadeInUp}
                className={`md:pb-[5rem] ${reverse ? 'self-end' : ''}`}
              >
                <Link
                  href={href}
                  className="bg-black text-white w-[8rem] lg:h-[1.75rem] md:h-[2rem] md:w-[10rem] sm:h-[1.7rem] sm:w-[6rem] lg:py-[1.625rem] md:py-[1.5rem] sm:py-[0.75rem] lg:w-[11rem] md:px-[6rem] sm:px-[2rem] rounded-full transition-colors mobile-subtitle font-bold lg:text-1.5 md:text-1.5 sm:text-1 sm:font-weight-500 underline-none flex justify-center items-center"
                >
                  {buttonText}
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
        {/* 이미지와 리스트 */}
        <motion.div
          variants={fadeInUp}
          className={`flex-1 lg:min-w-[25rem] px-[5rem] sm:px-[1rem] sm:min-w-[17rem] md:min-w-[45rem] md:px-[2rem] pt-[2rem] sm:pt-[1rem] md:pt-[1rem] ${
            reverse ? ' justify-between ' : ''
          }`}
        >
          <div className={`flex flex-col space-y-6 `}>
            <motion.div
              variants={fadeInUp}
              className="relative h-64 sm:h-56 md:h-80 sm:min-w-[23rem]"
            >
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover md:object-contain"
              />
            </motion.div>
            <motion.div
              variants={fadeInUp}
              className={`sm:w-full sm:pl-0 text-start lg:ml-[2rem]`}
            >
              {list.map((item, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="lg:text-1.125 sm:text-0.75 md:text-1 md:mb-[1rem] lg:line-height-[1.5rem] sm:line-height-[1.3rem] sm:font-weight-500"
                >
                  {item}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Section;
