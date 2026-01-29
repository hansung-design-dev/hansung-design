import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase';

type PeriodGenerationPayload = {
  targetYear?: number;
  targetMonth?: number;
  dryRun?: boolean;
};

const SPECIAL_PERIOD_GUS = new Set(['마포구', '강북구']);
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const CRON_SECRET = process.env.PERIOD_GENERATION_SECRET;

const toKst = (date: Date) => new Date(date.getTime() + KST_OFFSET_MS);

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const force = url.searchParams.get('force') === 'true';
    const providedSecret =
      req.headers.get('x-cron-secret') ?? url.searchParams.get('cron_secret');

    if (CRON_SECRET && providedSecret !== CRON_SECRET) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized cron access',
        },
        { status: 401 }
      );
    }

    let payload: PeriodGenerationPayload = {};
    try {
      payload = (await req.json()) ?? {};
    } catch {
      // 빈 바디 허용
    }

    const nowKst = toKst(new Date());
    const currentDay = nowKst.getDate();

    // 구별 오픈 날짜 규칙:
    // - 1일: 일반 구 상반기 기간 생성
    // - 5일: 마포구/강북구 상반기 기간 생성
    // - 16일: 일반 구 하반기 기간 생성
    // - 20일: 마포구/강북구 하반기 기간 생성
    const VALID_DAYS = [1, 5, 16, 20];

    if (
      !force &&
      !payload.targetYear &&
      !payload.targetMonth &&
      !VALID_DAYS.includes(currentDay)
    ) {
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: `Not a period generation day (valid days: ${VALID_DAYS.join(', ')})`,
        currentKst: nowKst.toISOString(),
        currentDay,
      });
    }

    if (
      payload.targetMonth !== undefined &&
      (payload.targetMonth < 1 || payload.targetMonth > 12)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: 'targetMonth must be between 1 and 12',
        },
        { status: 400 }
      );
    }

    // 날짜에 따라 생성할 기간 타입과 대상 구 결정
    let periodsToGenerate: ('first_half' | 'second_half')[] = [];
    let targetRegionFilter: 'special' | 'normal' | 'all' = 'all';

    if (!force && !payload.targetYear && !payload.targetMonth) {
      // 자동 실행: 날짜에 따라 대상 결정
      if (currentDay === 1) {
        periodsToGenerate = ['first_half'];
        targetRegionFilter = 'normal'; // 일반 구만
      } else if (currentDay === 5) {
        periodsToGenerate = ['first_half'];
        targetRegionFilter = 'special'; // 마포구/강북구만
      } else if (currentDay === 16) {
        periodsToGenerate = ['second_half'];
        targetRegionFilter = 'normal'; // 일반 구만
      } else if (currentDay === 20) {
        periodsToGenerate = ['second_half'];
        targetRegionFilter = 'special'; // 마포구/강북구만
      }
    } else {
      // 수동 실행 또는 force: 모든 기간, 모든 구
      periodsToGenerate = ['first_half', 'second_half'];
      targetRegionFilter = 'all';
    }

    const targetDate =
      payload.targetYear && payload.targetMonth
        ? new Date(payload.targetYear, payload.targetMonth - 1, 1)
        : new Date(nowKst.getFullYear(), nowKst.getMonth() + 1, 1);

    const targetYear = targetDate.getFullYear();
    const targetMonth = targetDate.getMonth() + 1;
    const yearMonth = `${targetYear}-${targetMonth.toString().padStart(2, '0')}`;

    console.log(`🔧 Generating periods for ${yearMonth} (force: ${force}, day: ${currentDay}, filter: ${targetRegionFilter}, periods: ${periodsToGenerate.join(', ')})`);

    // banner_display와 led_display 모두 가져오기
    const { data: displayTypes, error: displayTypeError } = await supabaseAdmin
      .from('display_types')
      .select('id, name')
      .in('name', ['banner_display', 'led_display']);

    if (displayTypeError || !displayTypes || displayTypes.length === 0) {
      throw new Error('Display types not found');
    }

    console.log(`🔧 Found ${displayTypes.length} display types:`, displayTypes.map(dt => dt.name));

    const { data: regions, error: regionsError } = await supabaseAdmin
      .from('region_gu')
      .select('id, name, code')
      .eq('is_active', true);

    if (regionsError) {
      throw new Error('Failed to fetch active regions');
    }

    if (!regions || regions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'No active regions found',
        },
        { status: 404 }
      );
    }

    const months = {
      currentYear: targetYear,
      currentMonth: targetMonth,
      nextMonth: targetMonth === 12 ? 1 : targetMonth + 1,
      nextYear: targetMonth === 12 ? targetYear + 1 : targetYear,
    };

    // 대상 구 필터링
    const filteredRegions = regions.filter((region) => {
      if (targetRegionFilter === 'all') return true;
      if (targetRegionFilter === 'special') return SPECIAL_PERIOD_GUS.has(region.name);
      if (targetRegionFilter === 'normal') return !SPECIAL_PERIOD_GUS.has(region.name);
      return true;
    });

    console.log(`🔧 Target regions: ${filteredRegions.map(r => r.name).join(', ')}`);

    // 각 display_type과 region 조합으로 기간 생성
    const periodsToInsert = displayTypes.flatMap((displayType) =>
      filteredRegions.flatMap((region) => {
        const monthStr = months.currentMonth.toString().padStart(2, '0');
        const nextMonthStr = months.nextMonth.toString().padStart(2, '0');
        const isSpecial = SPECIAL_PERIOD_GUS.has(region.name);

        const allPeriods: {
          region_gu_id: string;
          display_type_id: string;
          year_month: string;
          period: string;
          period_from: string;
          period_to: string;
        }[] = [];

        if (isSpecial) {
          // 마포구/강북구: 5-19일, 20일-다음달 4일
          if (periodsToGenerate.includes('first_half')) {
            allPeriods.push({
              region_gu_id: region.id,
              display_type_id: displayType.id,
              year_month: yearMonth,
              period: 'first_half',
              period_from: `${months.currentYear}-${monthStr}-05`,
              period_to: `${months.currentYear}-${monthStr}-19`,
            });
          }
          if (periodsToGenerate.includes('second_half')) {
            allPeriods.push({
              region_gu_id: region.id,
              display_type_id: displayType.id,
              year_month: yearMonth,
              period: 'second_half',
              period_from: `${months.currentYear}-${monthStr}-20`,
              period_to: `${months.nextYear}-${nextMonthStr}-04`,
            });
          }
        } else {
          // 일반 구: 1-15일, 16-말일
          const lastDay = new Date(
            months.currentYear,
            months.currentMonth,
            0
          ).getDate();

          if (periodsToGenerate.includes('first_half')) {
            allPeriods.push({
              region_gu_id: region.id,
              display_type_id: displayType.id,
              year_month: yearMonth,
              period: 'first_half',
              period_from: `${months.currentYear}-${monthStr}-01`,
              period_to: `${months.currentYear}-${monthStr}-15`,
            });
          }
          if (periodsToGenerate.includes('second_half')) {
            allPeriods.push({
              region_gu_id: region.id,
              display_type_id: displayType.id,
              year_month: yearMonth,
              period: 'second_half',
              period_from: `${months.currentYear}-${monthStr}-16`,
              period_to: `${months.currentYear}-${monthStr}-${lastDay
                .toString()
                .padStart(2, '0')}`,
            });
          }
        }

        return allPeriods;
      })
    );

    if (payload.dryRun) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        target: yearMonth,
        previewCount: periodsToInsert.length,
        sample: periodsToInsert.slice(0, 5),
      });
    }

    const { data: upserted, error: upsertError } = await supabaseAdmin
      .from('region_gu_display_periods')
      .upsert(periodsToInsert, {
        onConflict: 'display_type_id,region_gu_id,year_month,period',
      })
      .select();

    if (upsertError) {
      console.error('❌ Error upserting periods:', upsertError);
      throw new Error('Failed to upsert banner periods');
    }

    console.log(
      `✅ Upserted ${upserted?.length ?? 0} periods for ${yearMonth}`
    );

    // display_type별로 카운트
    const countByDisplayType = displayTypes.reduce((acc, dt) => {
      acc[dt.name] = upserted?.filter(p => p.display_type_id === dt.id).length ?? 0;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      success: true,
      message: `Generated periods for ${yearMonth}`,
      data: {
        yearMonth,
        insertedCount: upserted?.length ?? 0,
        regionsProcessed: regions.length,
        displayTypesProcessed: displayTypes.length,
        countByDisplayType,
      },
    });
  } catch (error) {
    console.error('❌ Error in scheduled period generation:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
