# Supabase 데이터베이스 백업 및 안전한 실행 가이드

## 🔒 1. 백업 받기

### 방법 1: Supabase Dashboard에서 백업

1. Supabase 프로젝트 대시보드 접속
2. Settings → Database → Backups
3. "Download backup" 클릭
4. SQL 파일로 다운로드

### 방법 2: pg_dump 사용 (로컬에서)

```bash
# 환경변수 설정
export SUPABASE_DB_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# 전체 데이터베이스 백업
pg_dump $SUPABASE_DB_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# 스키마만 백업
pg_dump --schema-only $SUPABASE_DB_URL > schema_backup_$(date +%Y%m%d_%H%M%S).sql
```

## 🧪 2. 테스트 환경 설정

### 방법 1: Supabase 새 프로젝트 생성

1. Supabase에서 새 프로젝트 생성
2. 기존 데이터를 복사 (선택사항)
3. 테스트 환경에서 먼저 실행

### 방법 2: 로컬 PostgreSQL 사용

```bash
# 로컬 PostgreSQL 설치 후
psql -U postgres -d test_db -f backup.sql
psql -U postgres -d test_db -f rename_info_tables_safe.sql
```

## ⚡ 3. 실제 실행

### 단계별 실행 (권장)

```sql
-- 1단계: 현재 상태 확인
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('bank_info', 'panel_info', 'banner_slot_info', 'led_slot_info');

-- 2단계: 안전한 스크립트 실행
-- rename_info_tables_safe.sql 파일의 내용을 Supabase SQL Editor에 붙여넣기

-- 3단계: 변경 확인
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('bank_accounts', 'panels', 'banner_slots', 'led_slots');
```

## 🚨 4. 주의사항

### 실행 전 체크리스트

- [ ] 백업 완료
- [ ] 테스트 환경에서 성공 확인
- [ ] 애플리케이션 코드 업데이트 완료
- [ ] 팀원들에게 공지
- [ ] 서비스 중단 시간 계획

### 롤백 방법

```sql
-- 만약 문제가 생기면 백업에서 복원
-- 1. Supabase Dashboard → Database → SQL Editor
-- 2. 백업 파일의 내용을 실행
```

## 📋 5. 실행 순서

1. **백업 생성**
2. **테스트 환경에서 실행**
3. **애플리케이션 코드 업데이트**
4. **실제 환경에서 실행**
5. **변경사항 확인**

## 🔍 6. 확인 쿼리

```sql
-- 테이블명 변경 확인
SELECT
  'Tables' as type,
  table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('bank_accounts', 'panels', 'banner_slots', 'led_slots');

-- 컬럼명 변경 확인
SELECT
  table_name,
  column_name
FROM information_schema.columns
WHERE table_schema = 'public'
AND column_name IN ('panel_id', 'banner_slot_id')
ORDER BY table_name, column_name;
```
