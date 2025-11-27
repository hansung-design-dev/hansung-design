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

    if (
      !force &&
      !payload.targetYear &&
      !payload.targetMonth &&
      nowKst.getDate() !== 1
    ) {
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: 'Not the first day of the month in KST',
        currentKst: nowKst.toISOString(),
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

    const targetDate =
      payload.targetYear && payload.targetMonth
        ? new Date(payload.targetYear, payload.targetMonth - 1, 1)
        : new Date(nowKst.getFullYear(), nowKst.getMonth() + 1, 1);

    const targetYear = targetDate.getFullYear();
    const targetMonth = targetDate.getMonth() + 1;
    const yearMonth = `${targetYear}-${targetMonth.toString().padStart(2, '0')}`;

    console.log(`🔧 Generating banner periods for ${yearMonth} (force: ${force})`);

    const { data: displayType, error: displayTypeError } = await supabaseAdmin
      .from('display_types')
      .select('id')
      .eq('name', 'banner_display')
      .single();

    if (displayTypeError || !displayType) {
      throw new Error('Banner display type not found');
    }

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

    const periodsToInsert = regions.flatMap((region) => {
      const monthStr = months.currentMonth.toString().padStart(2, '0');
      const nextMonthStr = months.nextMonth.toString().padStart(2, '0');

      if (SPECIAL_PERIOD_GUS.has(region.name)) {
        return [
          {
            region_gu_id: region.id,
            display_type_id: displayType.id,
            year_month: yearMonth,
            period: 'first_half',
            period_from: `${months.currentYear}-${monthStr}-05`,
            period_to: `${months.currentYear}-${monthStr}-19`,
          },
          {
            region_gu_id: region.id,
            display_type_id: displayType.id,
            year_month: yearMonth,
            period: 'second_half',
            period_from: `${months.currentYear}-${monthStr}-20`,
            period_to: `${months.nextYear}-${nextMonthStr}-04`,
          },
        ];
      }

      const lastDay = new Date(
        months.currentYear,
        months.currentMonth,
        0
      ).getDate();

      return [
        {
          region_gu_id: region.id,
          display_type_id: displayType.id,
          year_month: yearMonth,
          period: 'first_half',
          period_from: `${months.currentYear}-${monthStr}-01`,
          period_to: `${months.currentYear}-${monthStr}-15`,
        },
        {
          region_gu_id: region.id,
          display_type_id: displayType.id,
          year_month: yearMonth,
          period: 'second_half',
          period_from: `${months.currentYear}-${monthStr}-16`,
          period_to: `${months.currentYear}-${monthStr}-${lastDay
            .toString()
            .padStart(2, '0')}`,
        },
      ];
    });

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
      `✅ Upserted ${upserted?.length ?? 0} banner periods for ${yearMonth}`
    );

    return NextResponse.json({
      success: true,
      message: `Generated banner periods for ${yearMonth}`,
      data: {
        yearMonth,
        insertedCount: upserted?.length ?? 0,
        regionsProcessed: regions.length,
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
