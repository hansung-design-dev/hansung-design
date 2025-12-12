type FixupInput = {
  districtName?: string | null;
  startDate?: string | null;
  endDate?: string | null;
};

type FixupOutput = {
  startDate: string | null;
  endDate: string | null;
  changed: boolean;
};

const SPECIAL_GUS = new Set(['마포구', '강북구']);

const pad2 = (value: number) => String(value).padStart(2, '0');

function parseYmd(iso: string): { y: number; m: number; d: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d))
    return null;
  return { y, m: mo, d };
}

function ymd(y: number, m: number, d: number) {
  return `${y}-${pad2(m)}-${pad2(d)}`;
}

function lastDayOfMonth(y: number, m: number) {
  return new Date(y, m, 0).getDate();
}

function nextMonth(y: number, m: number) {
  if (m === 12) return { y: y + 1, m: 1 };
  return { y, m: m + 1 };
}

/**
 * 과거 레거시 저장값(1~15 / 16~말일)을
 * 마포구/강북구 규칙(5~19 / 20~다음달4)로 화면 표시용으로만 보정합니다.
 *
 * - 신규 주문(이미 5~19 / 20~4로 저장된 데이터)에는 영향 없음
 */
export function applySpecialHalfPeriodFixup(input: FixupInput): FixupOutput {
  const district = input.districtName ?? null;
  const start = input.startDate ?? null;
  const end = input.endDate ?? null;

  if (!district || !SPECIAL_GUS.has(district)) {
    return { startDate: start, endDate: end, changed: false };
  }
  if (!start || !end) return { startDate: start, endDate: end, changed: false };

  const s = parseYmd(start);
  const e = parseYmd(end);
  if (!s || !e) return { startDate: start, endDate: end, changed: false };

  // 레거시 상반기: 01~15 => 05~19
  if (s.y === e.y && s.m === e.m && s.d === 1 && e.d === 15) {
    return {
      startDate: ymd(s.y, s.m, 5),
      endDate: ymd(s.y, s.m, 19),
      changed: true,
    };
  }

  // 레거시 하반기: 16~말일 => 20~다음달4
  const lastDay = lastDayOfMonth(s.y, s.m);
  if (s.y === e.y && s.m === e.m && s.d === 16 && e.d === lastDay) {
    const nm = nextMonth(s.y, s.m);
    return {
      startDate: ymd(s.y, s.m, 20),
      endDate: ymd(nm.y, nm.m, 4),
      changed: true,
    };
  }

  return { startDate: start, endDate: end, changed: false };
}


