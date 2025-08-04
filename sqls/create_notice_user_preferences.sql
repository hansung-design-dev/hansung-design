-- 사용자별 공지사항 숨김 설정 테이블 생성

CREATE TABLE public.notice_user_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  notice_id uuid NOT NULL,
  hide_until_date date, -- 하루보지않기: 내일 날짜, 다시보이지 않기: NULL
  hide_permanently boolean DEFAULT false, -- 다시보이지 않기
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notice_user_preferences_pkey PRIMARY KEY (id),
  CONSTRAINT notice_user_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_auth(id) ON DELETE CASCADE,
  CONSTRAINT notice_user_preferences_notice_id_fkey FOREIGN KEY (notice_id) REFERENCES public.panel_popup_notices(id) ON DELETE CASCADE,
  CONSTRAINT notice_user_preferences_unique UNIQUE (user_id, notice_id)
);

-- 인덱스 생성
CREATE INDEX idx_notice_user_preferences_user_id ON public.notice_user_preferences(user_id);
CREATE INDEX idx_notice_user_preferences_notice_id ON public.notice_user_preferences(notice_id);
CREATE INDEX idx_notice_user_preferences_hide_until_date ON public.notice_user_preferences(hide_until_date);

-- 권한 설정
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notice_user_preferences TO authenticated;

-- 샘플 데이터 (테스트용)
INSERT INTO public.notice_user_preferences (user_id, notice_id, hide_until_date, hide_permanently) VALUES
-- 하루보지않기 예시 (내일까지 숨김)
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', CURRENT_DATE + INTERVAL '1 day', false),
-- 다시보이지 않기 예시
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', NULL, true); 