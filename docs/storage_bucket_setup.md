# Supabase Storage 버킷 설정 가이드

## 시안 업로드를 위한 버킷 생성

시안 관리 기능에서 파일을 업로드하기 위해서는 `design-drafts` 버킷이 필요합니다.

### 버킷 생성 방법

1. **Supabase Dashboard 접속**

   - 프로젝트의 Supabase Dashboard에 로그인합니다.

2. **Storage 메뉴로 이동**

   - 왼쪽 사이드바에서 `Storage` 메뉴를 클릭합니다.

3. **새 버킷 생성**

   - `Create a new bucket` 버튼을 클릭합니다.

4. **버킷 설정**

   - **버킷 이름**: `design-drafts` (정확히 이 이름으로 입력)
   - **Public bucket**: ✅ 체크 (공개 버킷으로 설정하여 파일 URL 접근 가능)
   - **File size limit**: 필요에 따라 설정 (기본값 사용 가능)
   - **Allowed MIME types**: 비워두거나 필요한 형식만 지정
     - 허용 형식: `image/jpeg`, `image/png`, `application/pdf`, `application/msword`, 등

5. **저장**
   - `Create bucket` 버튼을 클릭하여 버킷을 생성합니다.

### 버킷 권한 설정 (RLS Policy)

버킷을 생성한 후, 적절한 권한을 설정해야 합니다.

#### 업로드 권한 설정

Supabase Dashboard > Storage > Policies에서 다음 정책을 추가:

```sql
-- 모든 인증된 사용자가 파일 업로드 가능
CREATE POLICY "Users can upload design drafts"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'design-drafts');

-- 모든 인증된 사용자가 파일 조회 가능
CREATE POLICY "Users can view design drafts"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'design-drafts');

-- 자신이 업로드한 파일만 삭제 가능
CREATE POLICY "Users can delete own design drafts"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'design-drafts' AND auth.uid()::text = (storage.foldername(name))[1]);
```

또는 Supabase Dashboard의 UI를 통해:

1. Storage > Policies 메뉴로 이동
2. `design-drafts` 버킷 선택
3. `New Policy` 클릭
4. 위 정책들을 추가

### 사용 중인 다른 버킷들

현재 프로젝트에서 사용 중인 버킷 목록:

- `banner-installed`: 현수막 설치 사진 저장
- `ai-guidelines`: AI 가이드라인 파일 저장
- `design-drafts`: 시안 업로드 파일 저장 (생성 필요)

### 문제 해결

#### 버킷이 없다는 에러가 발생하는 경우

에러 메시지:

```
Bucket not found
Storage 버킷 'design-drafts'이 존재하지 않습니다.
```

**해결 방법**: 위 가이드를 따라 `design-drafts` 버킷을 생성해주세요.

#### 권한 오류가 발생하는 경우

에러 메시지:

```
new row violates row-level security policy
```

**해결 방법**: Storage Policies에서 위의 정책들을 추가해주세요.
