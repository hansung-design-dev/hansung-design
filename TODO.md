# TODO List

## DB 작업

- [x] LED 재고 테이블 값 추가
- [x] 상단광고 재고 테이블 값 추가
- [x] LED 캐시 테이블 생성 및 값 추가

## 프론트엔드 작업

- [x] 게시대가 마감됐을 때, 체크박스가 비활성화되면서 마감된 테이블 로우가 비활성화 text가 회색처리됨
- [x] 카드결제기능(토스), 카카오페이, 네이버페이 도입
- [x] 카카오 회원가입 도입

## dev/payment 브랜치 작업 완료 ✅

- [x] 결제 관련 타입 정의 (`src/types/payment.ts`)
- [x] 결제 수단 선택 컴포넌트 (`src/components/payment/PaymentMethodSelector.tsx`)
- [x] 결제 처리 유틸리티 (`src/lib/payment.ts`)
- [x] 토스페이먼츠 API 엔드포인트 (`src/app/api/payment/toss/route.ts`)
- [x] 카카오페이 API 엔드포인트 (`src/app/api/payment/kakao/route.ts`)
- [x] 네이버페이 API 엔드포인트 (`src/app/api/payment/naver/route.ts`)
- [x] 결제 성공/실패/취소 페이지
- [x] 기존 결제 페이지에 결제 수단 선택 기능 통합
- [x] 카트 페이지 무한로딩 문제 해결 (cartContext useEffect 의존성 배열 수정으로 무한루프 방지)

## 추가 작업 (선택사항)

- [ ] 실제 결제 서비스 연동 (API 키 설정)
- [ ] 카카오 개발자 콘솔 설정
- [ ] 환경 변수 실제 값 설정
- [ ] 결제 테스트 및 검증
- [ ] 사용자 시나리오 테스트

## 완료된 작업

✅ dev/payment 브랜치에서 결제 기능 구현 완료!
