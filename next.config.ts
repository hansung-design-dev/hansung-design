import type { NextConfig } from 'next';
import type { RemotePattern } from 'next/dist/shared/lib/image-config';

// Derive Supabase hostname from env to avoid hardcoding per environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: ((): RemotePattern[] => {
      if (!supabaseHost) return [];
      const patterns: RemotePattern[] = [
        {
          protocol: 'https',
          hostname: supabaseHost,
          port: '',
          pathname: '/storage/v1/object/public/**',
        },
        {
          protocol: 'https',
          hostname: supabaseHost,
          port: '',
          pathname: '/storage/v1/object/sign/**',
        },
      ];
      return patterns;
    })(),
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
              "frame-src 'self' http://*.kakao.com https://*.kakao.com http://*.kakao.co.kr https://*.kakao.co.kr https://*.tosspayments.com; script-src 'self' 'unsafe-eval' 'unsafe-inline' http://*.kakao.com https://*.kakao.com http://*.kakao.co.kr https://*.kakao.co.kr https://*.tosspayments.com http://*.daumcdn.net https://*.daumcdn.net http://t1.daumcdn.net https://t1.daumcdn.net; connect-src 'self' http://*.kakao.com https://*.kakao.com http://*.kakao.co.kr https://*.kakao.co.kr https://*.tosspayments.com https://api.tosspayments.com;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
