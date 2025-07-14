# 🚀 성능 최적화 체크리스트

## 즉시 적용 가능한 최적화 (1-2시간)

### 1. 이미지 최적화

- [ ] Next.js Image 컴포넌트 사용 확인
- [ ] 이미지 압축 (WebP 포맷 사용)
- [ ] Lazy loading 적용

### 2. API 응답 최적화

- [ ] 필요한 필드만 SELECT (SELECT \* 제거)
- [ ] 페이지네이션 적용
- [ ] 캐싱 헤더 설정

### 3. 프론트엔드 최적화

- [ ] React.memo 사용
- [ ] useMemo, useCallback 적절히 사용
- [ ] 불필요한 리렌더링 방지

## 중기 최적화 (1-2일)

### 1. 데이터베이스 최적화

- [ ] 인덱스 추가
- [ ] 쿼리 최적화
- [ ] Connection pooling 설정

### 2. 캐싱 전략

- [ ] Redis 도입 검토
- [ ] CDN 설정
- [ ] 브라우저 캐싱 최적화

### 3. 코드 스플리팅

- [ ] 동적 import 사용
- [ ] 라우트별 코드 스플리팅
- [ ] 번들 크기 최적화

## 장기 최적화 (1주)

### 1. 인프라 최적화

- [ ] 서버 스케일링
- [ ] 로드 밸런서 설정
- [ ] 모니터링 도구 도입

### 2. 고급 최적화

- [ ] SSR/SSG 적용
- [ ] Service Worker 설정
- [ ] PWA 기능 추가

## 현재 우선순위

### 🔥 긴급 (오늘)

1. 결제플로우 완성
2. 기본 캐싱 적용
3. 이미지 최적화

### ⚡ 중요 (내일)

1. API 응답 최적화
2. 데이터베이스 쿼리 최적화
3. 프론트엔드 성능 개선

### 📈 개선 (이번 주)

1. 모니터링 설정
2. 성능 테스트
3. 사용자 피드백 수집

## 성능 측정 도구

### 프론트엔드

- Chrome DevTools Performance
- Lighthouse
- WebPageTest

### 백엔드

- PostgreSQL EXPLAIN ANALYZE
- API 응답 시간 모니터링
- 서버 리소스 사용량

### 전체

- Google Analytics
- Real User Monitoring (RUM)
- Error tracking (Sentry)

## 목표 성능 지표

- **First Contentful Paint (FCP)**: < 1.5초
- **Largest Contentful Paint (LCP)**: < 2.5초
- **Cumulative Layout Shift (CLS)**: < 0.1
- **API 응답 시간**: < 500ms
- **데이터베이스 쿼리**: < 100ms

## 트래픽 대비 준비사항

### 동시 접속자 100명

- 현재 설정으로 충분

### 동시 접속자 500명

- 캐싱 필수
- 데이터베이스 최적화 필요

### 동시 접속자 1000명+

- Redis 도입
- 로드 밸런서 필요
- 서버 스케일링 필요
