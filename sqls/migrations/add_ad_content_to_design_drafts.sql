-- design_drafts 테이블에 ad_content (광고 내용) 컬럼 추가
-- 주문 시 작업이름(project_name) 외에 광고 내용을 별도로 저장하기 위함

ALTER TABLE public.design_drafts
ADD COLUMN IF NOT EXISTS ad_content text;

COMMENT ON COLUMN public.design_drafts.ad_content IS '광고 내용 - 유저 또는 담당 직원이 입력';
