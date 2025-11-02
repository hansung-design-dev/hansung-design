import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'eklijrstdcgsxtbjxjra.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'eklijrstdcgsxtbjxjra.supabase.co',
        port: '',
        pathname: '/storage/v1/object/sign/**',
      },
    ],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },
  // 카카오맵 및 토스페이먼츠를 위한 헤더 설정
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Content-Security-Policy',
            value:
              "frame-src 'self' https://*.kakao.com https://*.kakao.co.kr https://*.tosspayments.com; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.kakao.com https://*.kakao.co.kr https://*.tosspayments.com; connect-src 'self' https://*.kakao.com https://*.kakao.co.kr https://*.tosspayments.com https://api.tosspayments.com;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
