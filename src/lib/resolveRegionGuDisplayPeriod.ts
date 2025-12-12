import { supabase } from '@/src/lib/supabase';

export type HalfPeriod = 'first_half' | 'second_half';

export type RegionGuDisplayPeriodRange = {
  from: string;
  to: string;
};

export type RegionGuDisplayPeriodResolverCache = {
  panelInfoByPanelId: Map<
    string,
    { region_gu_id: string; display_type_id: string } | null
  >;
  periodRangeByKey: Map<string, RegionGuDisplayPeriodRange | null>;
};

const pad2 = (value: number) => String(value).padStart(2, '0');

function toYearMonth(year: number, month: number) {
  return `${year}-${pad2(month)}`;
}

export async function resolveRegionGuDisplayPeriodRangeByPanel(params: {
  panelId: string;
  year: number;
  month: number;
  halfPeriod: HalfPeriod;
  cache?: RegionGuDisplayPeriodResolverCache;
}): Promise<RegionGuDisplayPeriodRange | null> {
  const { panelId, year, month, halfPeriod, cache } = params;

  if (!panelId) return null;
  if (!Number.isFinite(year) || !Number.isFinite(month)) return null;
  if (month < 1 || month > 12) return null;

  const yearMonth = toYearMonth(year, month);
  const periodCacheKey = `${panelId}|${yearMonth}|${halfPeriod}`;
  const cachedPeriod = cache?.periodRangeByKey.get(periodCacheKey);
  if (cachedPeriod !== undefined) return cachedPeriod;

  let panelInfo = cache?.panelInfoByPanelId.get(panelId);
  if (panelInfo === undefined) {
    const { data, error } = await supabase
      .from('panels')
      .select('region_gu_id, display_type_id')
      .eq('id', panelId)
      .maybeSingle();

    panelInfo =
      !error && data?.region_gu_id && data?.display_type_id ? data : null;
    cache?.panelInfoByPanelId.set(panelId, panelInfo);
  }

  if (!panelInfo) {
    cache?.periodRangeByKey.set(periodCacheKey, null);
    return null;
  }

  const { data: periodRow, error: periodError } = await supabase
    .from('region_gu_display_periods')
    .select('period_from, period_to')
    .eq('region_gu_id', panelInfo.region_gu_id)
    .eq('display_type_id', panelInfo.display_type_id)
    .eq('year_month', yearMonth)
    .eq('period', halfPeriod)
    .maybeSingle();

  if (periodError || !periodRow?.period_from || !periodRow?.period_to) {
    cache?.periodRangeByKey.set(periodCacheKey, null);
    return null;
  }

  const result = { from: periodRow.period_from, to: periodRow.period_to };
  cache?.periodRangeByKey.set(periodCacheKey, result);
  return result;
}
