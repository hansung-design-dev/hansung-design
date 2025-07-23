-- 고급 팝업 공지사항 목데이터 (JSON 구조)

-- 1. 체크리스트 형태의 팝업 (이미지의 첫 번째 팝업과 유사)
INSERT INTO public.panel_popup_notices (
  display_category_id,
  title,
  content,
  start_date,
  end_date,
  popup_width,
  popup_height,
  hide_oneday
) VALUES (
  (SELECT id FROM public.display_types WHERE name = 'banner_display' LIMIT 1),
  '꼭 확인해주세요!',
  '{
    "title": "꼭 확인해주세요!",
    "contentType": "checklist",
    "style": {
      "headerColor": "#8B4513",
      "accentColor": "#654321"
    },
    "sections": [
      {
        "type": "checklist",
        "content": {
          "items": [
            {
              "text": "신청 후 3일이내로 입금해주세요!",
              "highlighted": ["3일이내로"],
              "subItems": [
                "미입금시 통보 후 취소될 수 있습니다.",
                "신청 업체명과 입금자명이 다를경우 연락부탁드립니다."
              ]
            },
            {
              "text": "각 구게시대의 가이드라인 확인!",
              "highlighted": ["가이드라인"],
              "subItems": [
                "각 구의 게시대마다 가이드라인과 사이즈를 확인해주세요"
              ]
            },
            {
              "text": "게시한 사진은 웹하드에서 확인하실 수 있습니다.(공지확인)",
              "highlighted": ["웹하드"]
            },
            {
              "text": "카드결제는 공지확인 후 별도로 연락주세요."
            }
          ]
        }
      }
    ],
    "footer": {
      "text": "웹하드 hansungad / 23252325"
    }
  }'::jsonb,
  '2024-12-01',
  '2024-12-31',
  false
);

-- 2. 가이드 형태의 팝업 (이미지의 두 번째 팝업과 유사)
INSERT INTO public.panel_popup_notices (
  display_category_id,
  title,
  content,
  start_date,
  end_date,
  popup_width,
  popup_height,
  hide_oneday
) VALUES (
  (SELECT id FROM public.display_types WHERE name = 'led_display' LIMIT 1),
  '초보자 신청 가이드 안내',
  '{
    "title": "초보자 신청 가이드 안내",
    "contentType": "guide",
    "style": {
      "headerColor": "#1E40AF",
      "accentColor": "#DC2626"
    },
    "sections": [
      {
        "type": "highlight",
        "content": {
          "text": "게시대 신청 처음이세요?",
          "highlights": [
            {
              "text": "게시대 신청 처음이세요?",
              "color": "red",
              "bold": true
            }
          ]
        },
        "style": {
          "backgroundColor": "#FEE2E2",
          "textColor": "#DC2626"
        }
      },
      {
        "type": "button",
        "content": {
          "text": "신청방법 알아보기!",
          "action": "guide",
          "style": "primary"
        }
      },
      {
        "type": "divider",
        "content": {
          "color": "#E5E7EB",
          "height": 2
        }
      },
      {
        "type": "highlight",
        "content": {
          "text": "게시대 규격 및 디자인 가이드라인 보기",
          "highlights": [
            {
              "text": "게시대 규격 및 디자인 가이드라인",
              "color": "blue",
              "bold": true
            }
          ]
        },
        "style": {
          "backgroundColor": "#DBEAFE",
          "textColor": "#1E40AF"
        }
      },
      {
        "type": "button",
        "content": {
          "text": "클릭해주세요!",
          "action": "guideline",
          "style": "secondary"
        }
      }
    ]
  }'::jsonb,
  '2024-12-01',
  '2024-12-31',
  450,
  400,
  false
);

-- 3. 공지사항 형태의 팝업
INSERT INTO public.panel_popup_notices (
  display_category_id,
  title,
  content,
  start_date,
  end_date,
  popup_width,
  popup_height,
  hide_oneday
) VALUES (
  (SELECT id FROM public.display_types WHERE name = 'digital_signage' LIMIT 1),
  '시스템 점검 안내',
  '{
    "title": "시스템 점검 안내",
    "contentType": "notice",
    "style": {
      "headerColor": "#059669",
      "accentColor": "#047857"
    },
    "sections": [
      {
        "type": "text",
        "content": "안녕하세요! 디지털사이니지 시스템 점검을 안내드립니다."
      },
      {
        "type": "highlight",
        "content": {
          "text": "점검일시: 2024년 12월 15일 (일) 02:00 ~ 06:00",
          "highlights": [
            {
              "text": "2024년 12월 15일 (일) 02:00 ~ 06:00",
              "color": "red",
              "bold": true
            }
          ]
        }
      },
      {
        "type": "text",
        "content": "점검 시간 동안 서비스 이용이 일시 중단됩니다. 고객님들의 양해 부탁드립니다."
      },
      {
        "type": "divider",
        "content": {
          "color": "#E5E7EB",
          "height": 1
        }
      },
      {
        "type": "text",
        "content": "문의: 02-1234-5678"
      }
    ],
    "footer": {
      "text": "더 나은 서비스를 위해 노력하겠습니다.",
      "contact": "고객센터: 02-1234-5678"
    }
  }'::jsonb,
  '2024-12-10',
  '2024-12-20',
  550,
  400,
  false
);

-- 4. 공공디자인 프로젝트 안내 팝업
INSERT INTO public.panel_popup_notices (
  display_category_id,
  title,
  content,
  start_date,
  end_date,
  popup_width,
  popup_height,
  hide_oneday
) VALUES (
  (SELECT id FROM public.display_types WHERE name = 'public_design' LIMIT 1),
  '공공디자인 프로젝트 수주 완료',
  '{
    "title": "공공디자인 프로젝트 수주 완료",
    "contentType": "custom",
    "style": {
      "headerColor": "#7C3AED",
      "accentColor": "#5B21B6"
    },
    "sections": [
      {
        "type": "highlight",
        "content": {
          "text": "서울시 강남구 공공디자인 프로젝트를 성공적으로 수주했습니다!",
          "highlights": [
            {
              "text": "성공적으로 수주",
              "color": "purple",
              "bold": true
            }
          ]
        }
      },
      {
        "type": "text",
        "content": "프로젝트 내용:"
      },
      {
        "type": "checklist",
        "content": {
          "items": [
            {
              "text": "도시 경관 개선",
              "important": true
            },
            {
              "text": "브랜드 아이덴티티 개발",
              "important": true
            },
            {
              "text": "스마트 시티 인프라 구축",
              "important": true
            }
          ]
        }
      },
      {
        "type": "text",
        "content": "프로젝트 진행 상황은 홈페이지에서 실시간으로 확인하실 수 있습니다."
      }
    ],
    "footer": {
      "text": "더 아름다운 도시를 만들어가겠습니다.",
      "links": [
        {
          "text": "프로젝트 상세보기",
          "action": "view_project"
        },
        {
          "text": "문의하기",
          "action": "contact"
        }
      ]
    }
  }'::jsonb,
  '2024-12-05',
  '2024-12-25',
  600,
  500,
  false
); 