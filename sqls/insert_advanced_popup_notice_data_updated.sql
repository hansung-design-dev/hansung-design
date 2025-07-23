-- 고급 팝업 공지사항 목데이터 (JSON 구조) - popup_width, popup_height 컬럼 제거됨

-- 1. 체크리스트 형태의 팝업 (이미지의 첫 번째 팝업과 유사)
INSERT INTO public.panel_popup_notices (
  display_category_id,
  title,
  content,
  start_date,
  end_date,
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
        "type": "text",
        "content": "아래 단계를 따라 신청해주세요!"
      },
      {
        "type": "checklist",
        "content": {
          "items": [
            {
              "text": "1단계: 원하는 게시대 선택",
              "subItems": [
                "현수막, LED, 디지털사인, 공공디자인 중 선택"
              ]
            },
            {
              "text": "2단계: 지역 및 기간 선택",
              "subItems": [
                "서울시 25개 구 중 원하는 지역 선택",
                "게시 기간 설정 (최소 1주일)"
              ]
            },
            {
              "text": "3단계: 디자인 업로드",
              "subItems": [
                "가이드라인에 맞는 디자인 파일 업로드",
                "JPG, PNG, PDF 형식 지원"
              ]
            },
            {
              "text": "4단계: 결제 및 확인",
              "subItems": [
                "신용카드 또는 계좌이체로 결제",
                "신청 완료 후 확인 이메일 발송"
              ]
            }
          ]
        }
      },
      {
        "type": "button",
        "content": {
          "text": "가이드라인 보기",
          "url": "/guidelines",
          "style": "primary"
        }
      }
    ],
    "footer": {
      "text": "문의사항이 있으시면 언제든 연락주세요!",
      "contact": "고객센터: 02-1234-5678",
      "links": [
        {
          "text": "자주 묻는 질문",
          "url": "/faq"
        },
        {
          "text": "1:1 문의",
          "url": "/contact"
        }
      ]
    }
  }'::jsonb,
  '2024-12-01',
  '2024-12-31',
  false
);

-- 3. 공지사항 형태의 팝업
INSERT INTO public.panel_popup_notices (
  display_category_id,
  title,
  content,
  start_date,
  end_date,
  hide_oneday
) VALUES (
  (SELECT id FROM public.display_types WHERE name = 'digital_signage' LIMIT 1),
  '디지털사인 신청 주의사항',
  '{
    "title": "디지털사인 신청 주의사항",
    "contentType": "notice",
    "style": {
      "headerColor": "#059669",
      "accentColor": "#047857"
    },
    "sections": [
      {
        "type": "text",
        "content": "디지털사인 신청 시 다음 사항을 꼭 확인해주세요."
      },
      {
        "type": "divider",
        "content": {
          "height": 2,
          "color": "#10B981"
        }
      },
      {
        "type": "checklist",
        "content": {
          "items": [
            {
              "text": "디지털사인은 실시간 콘텐츠 업데이트가 가능합니다",
              "highlighted": ["실시간 콘텐츠 업데이트"]
            },
            {
              "text": "동영상 파일은 MP4 형식만 지원됩니다",
              "highlighted": ["MP4 형식만"]
            },
            {
              "text": "파일 크기는 최대 100MB까지 업로드 가능합니다",
              "highlighted": ["100MB까지"]
            },
            {
              "text": "게시 시간은 24시간 운영됩니다",
              "highlighted": ["24시간 운영"]
            }
          ]
        }
      },
      {
        "type": "highlight",
        "content": {
          "highlights": [
            {
              "text": "중요: ",
              "color": "red",
              "bold": true
            },
            {
              "text": "디지털사인은 콘텐츠 승인 후 24시간 내에 게시됩니다."
            }
          ]
        }
      }
    ],
    "footer": {
      "text": "디지털사인 문의: 02-1234-5678",
      "links": [
        {
          "text": "디지털사인 가이드라인",
          "url": "/digital-signage/guidelines"
        }
      ]
    }
  }'::jsonb,
  '2024-12-01',
  '2024-12-31',
  false
);

-- 4. 커스텀 형태의 팝업
INSERT INTO public.panel_popup_notices (
  display_category_id,
  title,
  content,
  start_date,
  end_date,
  hide_oneday
) VALUES (
  (SELECT id FROM public.display_types WHERE name = 'public_design' LIMIT 1),
  '공공디자인 프로젝트 안내',
  '{
    "title": "공공디자인 프로젝트 안내",
    "contentType": "custom",
    "style": {
      "headerColor": "#7C3AED",
      "accentColor": "#5B21B6"
    },
    "sections": [
      {
        "type": "text",
        "content": "공공디자인은 도시의 아름다움을 만드는 중요한 요소입니다."
      },
      {
        "type": "highlight",
        "content": {
          "highlights": [
            {
              "text": "2024년 공공디자인 프로젝트",
              "color": "purple",
              "bold": true
            }
          ]
        }
      },
      {
        "type": "checklist",
        "content": {
          "items": [
            {
              "text": "공공디자인은 도시미관 향상을 위한 프로젝트입니다",
              "subItems": [
                "도시의 정체성과 특성을 반영한 디자인",
                "시민들의 삶의 질 향상에 기여"
              ]
            },
            {
              "text": "신청 자격: 서울시 소재 기업 및 단체",
              "highlighted": ["서울시 소재"]
            },
            {
              "text": "지원 내용: 디자인 제작비 및 설치비 지원",
              "highlighted": ["디자인 제작비", "설치비 지원"]
            },
            {
              "text": "심사 기준: 창의성, 실현가능성, 공공성",
              "subItems": [
                "창의성: 독창적이고 혁신적인 아이디어",
                "실현가능성: 기술적, 경제적 실현 가능성",
                "공공성: 공공의 이익과 가치 창출"
              ]
            }
          ]
        }
      },
      {
        "type": "button",
        "content": {
          "text": "프로젝트 신청하기",
          "url": "/public-design/apply",
          "style": "primary"
        }
      },
      {
        "type": "button",
        "content": {
          "text": "기존 프로젝트 보기",
          "url": "/public-design/projects",
          "style": "secondary"
        }
      }
    ],
    "footer": {
      "text": "공공디자인으로 더 아름다운 서울을 만들어가요!",
      "contact": "공공디자인팀: 02-1234-5678",
      "links": [
        {
          "text": "공공디자인 가이드라인",
          "url": "/public-design/guidelines"
        },
        {
          "text": "성공사례",
          "url": "/public-design/cases"
        }
      ]
    }
  }'::jsonb,
  '2024-12-01',
  '2024-12-31',
  false
); 