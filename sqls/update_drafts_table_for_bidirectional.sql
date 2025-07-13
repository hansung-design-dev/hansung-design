-- 시안 테이블 수정 (양방향 플로우 지원)

-- 1. 기존 drafts 테이블에 컬럼 추가
ALTER TABLE public.drafts 
ADD COLUMN direction text NOT NULL DEFAULT 'user_to_admin' CHECK (direction IN ('user_to_admin', 'admin_to_user')),
ADD COLUMN draft_category text DEFAULT 'initial' CHECK (draft_category IN ('initial', 'feedback', 'revision', 'final')),
ADD COLUMN admin_id uuid,
ADD COLUMN admin_notes text,
ADD COLUMN user_notes text,
ADD COLUMN is_approved boolean DEFAULT false;

-- 2. 어드민 테이블 참조 추가 (필요시)
-- ALTER TABLE public.drafts 
-- ADD CONSTRAINT drafts_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.admins(id);

-- 3. 인덱스 추가
CREATE INDEX idx_drafts_direction ON public.drafts(direction);
CREATE INDEX idx_drafts_draft_category ON public.drafts(draft_category);
CREATE INDEX idx_drafts_admin_id ON public.drafts(admin_id);

-- 4. 기존 데이터 업데이트 (모든 기존 데이터는 user_to_admin으로 설정)
UPDATE public.drafts 
SET direction = 'user_to_admin', draft_category = 'initial' 
WHERE direction IS NULL;

-- 5. 시안 상태 enum 타입 생성 (필요시)
-- CREATE TYPE draft_status_enum AS ENUM ('pending', 'uploaded', 'reviewed', 'approved', 'rejected', 'feedback_sent', 'revision_uploaded', 'final_approved');
-- ALTER TABLE public.drafts ALTER COLUMN upload_status TYPE draft_status_enum USING upload_status::draft_status_enum; 