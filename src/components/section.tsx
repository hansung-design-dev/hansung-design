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
      ease: 'easeOut',
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
    <section className="h-screen w-full flex items-center justify-center scroll-container sm:px-[4rem] sm:w-[90%] md:w-[90%] md:px-[2rem] ">
      <motion.div
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: false, amount: 0.2 }}
        className={`scroll-area px-[1.25rem] sm:px-[1rem] md:px-[2rem] lg:flex flex-col ${
          reverse ? 'md:flex-row-reverse' : 'md:flex-row'
        } items-start gap-[2.5rem] sm:gap-[2rem] `}
      >
        <motion.div
          variants={fadeInUp}
          className="flex-1 w-full px-[5rem] sm:px-[2rem] md:px-[3rem] pt-[2rem] sm:pt-[1rem] md:pt-[1rem]"
        >
          <div className="flex lg:flex-col gap-[2rem] sm:gap-[1.5rem] md:gap-[2rem] max-w-xl md:pb-3 md:items-start sm:flex-col sm:pb-6">
            <div className="flex flex-col gap-[0.75rem] sm:gap-[0.75rem] md:gap-[1.25rem]">
              {subtitle && (
                <motion.div
                  variants={fadeInUp}
                  className="lg:text-2.25 sm:text-1.25 md:text-1.75 font-weight-500t"
                >
                  {subtitle}
                </motion.div>
              )}
              <motion.div
                variants={fadeInUp}
                className="lg:text-4.375 sm:text-2 md:text-3.5 font-bold"
              >
                {title}
              </motion.div>
              <motion.div
                variants={fadeInUp}
                className="lg:text-2.25 sm:text-1 md:text-1.75 font-weight-500 text-gray-700"
              >
                {description}
              </motion.div>
            </div>
            <motion.div variants={fadeInUp}>
              <Link
                href={href}
                className="bg-black text-white w-[8rem] lg:h-[1.75rem] md:h-[2rem] sm:h-[2rem] lg:py-[1.625rem] md:py-[1.5rem] sm:py-[0.75rem] lg:px-[8rem] md:px-[6rem] sm:px-[3rem] rounded-full hover:bg-gray-800 transition-colors mobile-subtitle font-bold lg:text-1.5 md:text-1.5 sm:text-1 underline-none flex justify-center items-center"
              >
                {buttonText}
              </Link>
            </motion.div>
          </div>
        </motion.div>
        <motion.div variants={fadeInUp} className="flex-1 w-full  ">
          <div className="flex flex-col space-y-6">
            <motion.div
              variants={fadeInUp}
              className="relative w-[52rem] sm:w-[30rem] md:w-[45rem] h-64 sm:h-56 md:h-80 "
            >
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                className="object-cover"
              />
            </motion.div>
            <motion.div
              variants={fadeInUp}
              className="space-y-3 sm:w-[80%] pl-5 sm:space-y-1"
            >
              {list.map((item, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="lg:text-1.125 sm:text-0.75 md:text-1 md:mb-[1rem] leading-[1.5] lg:line-height-1.125 sm:line-height-1.375"
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
