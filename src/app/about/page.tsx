'use client';

import { useState, useEffect } from 'react';
import MainHero from '../../components/about/MainHero';
import Navigation from '../../components/about/Navigation';
import MovingSmartCity from '../../components/about/MovingSmartCity';
import Statistics from '../../components/about/Statistics';
import Greetings from '../../components/about/Greetings';
import Strengths from '../../components/about/Strengths';
import Patents from '../../components/about/Patents';
import Performance from '../../components/about/Performance';
import Organization from '../../components/about/Organization';
import Directions from '../../components/about/Directions';

export default function AboutPage() {
  const [activeSection, setActiveSection] = useState('greetings');

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        'greetings',
        'strengths',
        'patents',
        'certifications',
        'performance',
        'organization',
        'directions',
      ];
      const scrollPosition = window.scrollY + 100;

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;

          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen">
      <MainHero />
      <Navigation
        activeSection={activeSection}
        scrollToSection={scrollToSection}
      />
      <MovingSmartCity />
      <Statistics />
      <Greetings />
      <Strengths />
      <Patents />
      <Performance />
      <Organization />
      <Directions />
    </div>
  );
}
