# 기간 자동 생성 가이드

## 📋 개요

매월 1일 00:05 (KST)에 자동으로 다음 달의 상·하반기 기간 데이터를 생성합니다.

## 🔧 설정 방법

### 1. 환경 변수 설정

`.env.local` 파일에 다음 변수를 추가하세요:

```bash
PERIOD_GENERATION_SECRET=your-secret-key-here
```

**보안 권장사항:**
- 강력한 랜덤 문자열 사용 (예: `openssl rand -hex 32`)
- Vercel 대시보드의 Environment Variables에도 동일하게 설정

### 2. Vercel 크론 설정

프로젝트 루트의 `vercel.json` 파일이 자동으로 크론을 등록합니다:

```json
{
  "crons": [
    {
      "path": "/api/schedule-period-generation",
      "schedule": "5 15 * * *"
    }
  ]
}
```

- `5 15 * * *`: 매일 15:05 UTC (한국시간 00:05)
- Vercel에 배포하면 자동으로 크론이 활성화됩니다

### 3. Vercel 대시보드에서 확인

1. Vercel 대시보드 → 프로젝트 선택
2. Settings → Cron Jobs 메뉴 확인
3. 등록된 크론이 표시되는지 확인

## 🧪 테스트 방법

### 방법 1: force 파라미터 사용 (권장)

12월 1일 전에 미리 테스트하려면 `force=true` 파라미터를 사용하세요:

```bash
# 로컬 테스트
curl -X POST http://localhost:3000/api/schedule-period-generation?force=true \
  -H "Content-Type: application/json" \
  -H "x-cron-secret: your-secret-key"

# 프로덕션 테스트
curl -X POST https://your-domain.com/api/schedule-period-generation?force=true \
  -H "Content-Type: application/json" \
  -H "x-cron-secret: your-secret-key"
```

### 방법 2: 특정 월 지정

특정 년월의 기간을 생성하려면:

```bash
curl -X POST https://your-domain.com/api/schedule-period-generation?force=true \
  -H "Content-Type: application/json" \
  -H "x-cron-secret: your-secret-key" \
  -d '{
    "targetYear": 2026,
    "targetMonth": 1
  }'
```

### 방법 3: Dry Run (미리보기)

실제로 데이터를 생성하지 않고 미리보기만 하려면:

```bash
curl -X POST https://your-domain.com/api/schedule-period-generation?force=true \
  -H "Content-Type: application/json" \
  -H "x-cron-secret: your-secret-key" \
  -d '{
    "targetYear": 2026,
    "targetMonth": 1,
    "dryRun": true
  }'
```

## 📊 응답 예시

### 성공 응답

```json
{
  "success": true,
  "message": "Generated banner periods for 2026-01",
  "data": {
    "yearMonth": "2026-01",
    "insertedCount": 20,
    "regionsProcessed": 10
  }
}
```

### Dry Run 응답

```json
{
  "success": true,
  "dryRun": true,
  "target": "2026-01",
  "previewCount": 20,
  "sample": [
    {
      "region_gu_id": "...",
      "display_type_id": "...",
      "year_month": "2026-01",
      "period": "first_half",
      "period_from": "2026-01-01",
      "period_to": "2026-01-15"
    }
  ]
}
```

### 스킵 응답 (1일이 아닐 때)

```json
{
  "success": true,
  "skipped": true,
  "reason": "Not the first day of the month in KST",
  "currentKst": "2025-11-27T15:00:00.000Z"
}
```

## 🔍 생성되는 기간 규칙

### 일반 구 (송파, 관악, 용산, 서대문 등)
- **상반기**: 1일 ~ 15일
- **하반기**: 16일 ~ 말일

### 특수 구 (마포구, 강북구)
- **상반기**: 5일 ~ 19일
- **하반기**: 20일 ~ 다음달 4일

## ⚠️ 주의사항

1. **중복 방지**: 같은 `display_type_id + region_gu_id + year_month + period` 조합은 자동으로 업데이트됩니다 (upsert)
2. **보안**: `PERIOD_GENERATION_SECRET` 없이는 API 호출이 거부됩니다
3. **타임존**: 모든 날짜 계산은 KST 기준입니다

## 🐛 문제 해결

### 크론이 실행되지 않을 때

1. Vercel 대시보드에서 Cron Jobs 확인
2. 배포 로그에서 에러 확인
3. 환경 변수 `PERIOD_GENERATION_SECRET` 설정 확인

### 데이터가 생성되지 않을 때

1. API 응답 로그 확인
2. Supabase에서 `region_gu_display_periods` 테이블 확인
3. `is_active = true`인 구가 있는지 확인

## 📝 수동 실행 스크립트

로컬에서 테스트할 때 사용할 수 있는 스크립트:

```bash
#!/bin/bash
# test-period-generation.sh

SECRET="your-secret-key"
DOMAIN="http://localhost:3000"  # 또는 프로덕션 URL

curl -X POST "${DOMAIN}/api/schedule-period-generation?force=true" \
  -H "Content-Type: application/json" \
  -H "x-cron-secret: ${SECRET}" \
  -d '{
    "targetYear": 2026,
    "targetMonth": 1
  }' | jq
```

