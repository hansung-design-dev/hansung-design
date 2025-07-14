// 간단한 메모리 캐시 시스템
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class MemoryCache {
  private cache = new Map<string, CacheItem<unknown>>();

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const isExpired = Date.now() - item.timestamp > item.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // 만료된 항목들 정리
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// 전역 캐시 인스턴스
export const cache = new MemoryCache();

// 주기적으로 만료된 항목 정리 (5분마다)
if (typeof window !== 'undefined') {
  setInterval(() => {
    cache.cleanup();
  }, 5 * 60 * 1000);
}

// 캐시 키 생성 함수들
export const cacheKeys = {
  bannerDisplays: (district?: string) =>
    district ? `banner_displays_${district}` : 'banner_displays_all',
  ledDisplays: (district?: string) =>
    district ? `led_displays_${district}` : 'led_displays_all',
  bankInfo: (district: string) => `bank_info_${district}`,
  displayPeriods: (district: string) => `display_periods_${district}`,
  userProfile: (userId: string) => `user_profile_${userId}`,
  orders: (userId: string) => `orders_${userId}`,
};
