import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetWind3,
} from 'unocss';

interface Theme {
  lineHeight?: Record<string, string>;
  fontWeight?: Record<string, string>;
}

export default defineConfig({
  presets: [
    presetWind3(),
    presetAttributify(),
    presetIcons({
      extraProperties: {
        display: 'inline-block',
        'vertical-align': 'middle',
      },
    }),
  ],
  theme: {
    fontFamily: {
      pretendard: ['Pretendard', 'sans-serif'],
      gmarket: ['Gmarket Sans', 'sans-serif'],
    },
    safelist: [
      'hidden',
      'sm:inline',
      'md:hidden',
      'lg:hidden',
      'font-gmarket',
      // 필요한 모든 조합을 여기에 추가
    ],
    fontSize: {
      '4.375': '4.375rem',
      '3.75': '3.75rem',
      '3.5': '3.5rem',
      '3.25': '3.25rem',
      '3': '3rem',
      '2.375': '2.375rem',
      '2.25': '2.25rem',
      '2.265': '2.265rem',
      '2.5': '2.5rem',
      '2': '2rem',
      '1.875': '1.875rem',
      '1.75': '1.75rem',
      '1.7': '1.7rem',
      '1.6': '1.6rem',
      '1.5': '1.5rem',
      '1.375': '1.375rem',
      '1.25': '1.25rem',
      '1.125': '1.125rem',
      '1': '1rem',
      '0.875': '0.875rem',
      '0.75': '0.75rem',
      '0.625': '0.625rem',
    },
    fontWeight: {
      '900': '900',
      '700': '700',
      '600': '600',
      '500': '500',
      '400': '400',
      '300': '300',
      '200': '200',
      '100': '100',
    },
    lineHeight: {
      '1.125': '1.125rem',
      '1.375': '1.375rem',
    },

    colors: {
      background: 'var(--color-background)',
      foreground: 'var(--color-foreground)',
      black: '#000',
      white: '#fff',
      red: '#D61919',
      gray: {
        DEFAULT: '#625C5C',
        1: '#EDEDED',
        2: '#2E2E2E',
        3: '#E0E0E0',
        4: '#F6F6F6',
        5: '#676767',
        6: '#9E9E9E',
        7: '#848484',
        8: '#D9D9D9',
        9: '#D8D8D8',
        10: '#AEAEAE',
        11: '#EFEFEF',
        12: '#A4A4A4',
        13: '#E1E1E1;',
        14: '#7D7D7D',
      },
    },
    breakpoints: {
      sm: '320px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
  },
  shortcuts: {
    'animate-shimmer': 'animate-[shimmer_1.5s_ease-in-out_infinite]',
  },
  rules: [
    [
      'animate-slide-in-left',
      { animation: 'slide-in-left 0.3s cubic-bezier(.4,0,.2,1) both' },
    ],
    ['animate-shimmer', { animation: 'shimmer 1.5s ease-in-out infinite' }],

    // lineHeight 유틸리티 추가 (lh-body, lh-display 등 사용 가능)
    [
      /^line-height-(\w+)$/,
      ([, key], { theme }: { theme: Theme }) => {
        if (theme.lineHeight?.[key]) {
          return { 'line-height': theme.lineHeight[key] };
        }
      },
    ],
    // fontWeight 유틸리티 추가 (fw-body, fw-display 등 사용 가능)
    [
      /^font-weight-(\w+)$/,
      ([, key], { theme }: { theme: Theme }) => {
        if (theme.fontWeight?.[key]) {
          return { 'font-weight': theme.fontWeight[key] };
        }
      },
    ],
  ],
  variants: [
    // ✅ 미디어 쿼리 추가
    (matcher) => {
      if (matcher.startsWith('sm:')) {
        return {
          matcher: matcher.slice(3),
          parent: `@media (min-width: 320px)`,
        };
      }
      if (matcher.startsWith('md:')) {
        return {
          matcher: matcher.slice(3),
          parent: `@media (min-width: 768px)`,
        };
      }
      if (matcher.startsWith('lg:')) {
        return {
          matcher: matcher.slice(3),
          parent: `@media (min-width: 1024px)`,
        };
      }
      if (matcher.startsWith('xl:')) {
        return {
          matcher: matcher.slice(3),
          parent: `@media (min-width: 1280px)`,
        };
      }
    },
  ],
});
