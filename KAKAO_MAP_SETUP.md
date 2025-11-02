# 카카오맵 설정 가이드

## 문제 해결 완료 사항

✅ 카카오맵 로더 로직 개선
✅ 로드뷰 라이브러리 로딩 문제 해결  
✅ Next.js CSP 설정 추가
✅ 에러 처리 및 로깅 개선

## 환경변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```bash
# 카카오맵 설정 - 실제 카카오맵 JavaScript API 키를 입력하세요
NEXT_PUBLIC_KAKAO_KEY=your_kakao_map_javascript_key

# 기타 필요한 환경변수들...
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
# ... 기타 설정들
```

## 카카오맵 API 키 발급 방법

1. [카카오 개발자 콘솔](https://developers.kakao.com/) 접속
2. 애플리케이션 생성 또는 기존 애플리케이션 선택
3. 플랫폼 설정에서 Web 플랫폼 추가
4. 사이트 도메인 등록:
   - 로컬: `http://localhost:3000`
   - 배포: 실제 도메인 (예: `https://yourdomain.com`)
5. JavaScript 키 복사하여 `NEXT_PUBLIC_KAKAO_KEY`에 설정

## 개선된 기능

### 1. 로더 개선

- 자동 로딩 실패 시 수동 로딩 시도
- 로딩 상태 추적 및 반환
- 타임아웃 관리 개선

### 2. 로드뷰 지원

- `roadview` 라이브러리 자동 로딩
- 로드뷰 생성 전 SDK 상태 확인
- 에러 처리 강화

### 3. Next.js 설정

- CSP 헤더에 카카오 도메인 허용
- iframe 및 스크립트 로딩 허용

### 4. 개발 환경 최적화

- 개발 환경에서만 상세 로그 출력
- 프로덕션 환경에서 불필요한 로그 제거

## 사용법

```tsx
import useKakaoLoader from './hooks/use-kakao-loader';

function MyComponent() {
  const { isLoaded, isLoading } = useKakaoLoader();

  if (isLoading) {
    return <div>카카오맵 로딩 중...</div>;
  }

  if (!isLoaded) {
    return <div>카카오맵 로딩 실패</div>;
  }

  return <div>카카오맵 사용 가능</div>;
}
```

## 문제 해결

### 로컬에서 맵이 안 보이는 경우

1. `.env.local` 파일에 올바른 API 키가 설정되었는지 확인
2. 카카오 개발자 콘솔에서 `http://localhost:3000` 도메인이 등록되었는지 확인
3. 브라우저 개발자 도구에서 네트워크 탭 확인

### 배포 후 로드뷰가 안 보이는 경우

1. 배포 도메인이 카카오 개발자 콘솔에 등록되었는지 확인
2. HTTPS 사용 여부 확인 (카카오맵은 HTTPS 권장)
3. CSP 설정이 올바른지 확인

## 참고사항

- 카카오맵 API는 무료 사용량 제한이 있습니다
- 로드뷰는 일부 지역에서 지원되지 않을 수 있습니다
- API 키는 절대 공개 저장소에 커밋하지 마세요
