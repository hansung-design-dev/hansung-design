import { supabase } from '@/src/lib/supabase';

export interface SlotResolverItem {
  panel_id?: string;
  panel_slot_usage_id?: string | null;
  panel_slot_snapshot?: {
    slot_number?: number | null;
    banner_type?: string | null;
    banner_slot_id?: string | null;
  };
  panel_type?: string | null;
  itemType?: string | null;
}

export interface SlotResolutionResult {
  panelSlotUsageId: string | null;
  slotNumber: number | null;
  slotCategory: 'banner' | 'led';
}

export interface SlotResolverCache {
  panelInfoAndPeriod?: Map<
    string,
    {
      panelInfo: { display_type_id: string; region_gu_id: string } | null;
      periodId: string | null;
    }
  >;
  bannerSlotsByPanel?: Map<
    string,
    {
      bannerSlots: { id: string; slot_number: number }[];
      slotMap: Map<string, number>;
    }
  >;
  inventoryByPeriodPanel?: Map<
    string,
    Map<string, { is_closed: boolean; is_available: boolean }>
  >;
  slotUsageByPanelDate?: Map<string, Set<string>>;
}

const LED_TRIGGERS = ['led', 'electronic', 'edp', 'lcd', 'display'];

function detectSlotCategory(item: SlotResolverItem): 'banner' | 'led' {
  const candidates = [
    item.panel_slot_snapshot?.banner_type,
    item.panel_type,
    item.itemType,
  ];

  for (const raw of candidates) {
    if (!raw) continue;
    const value = raw.toLowerCase();
    if (LED_TRIGGERS.some((trigger) => value.includes(trigger))) {
      return 'led';
    }
  }

  return 'banner';
}

async function getPanelInfoAndPeriod(
  panelId: string,
  displayStartDate: string,
  displayEndDate: string,
  cache?: SlotResolverCache
) {
  const cacheKey = `${panelId}|${displayStartDate}|${displayEndDate}`;
  const cached = cache?.panelInfoAndPeriod?.get(cacheKey);
  if (cached) return cached;

  const { data: panelInfo, error: panelError } = await supabase
    .from('panels')
    .select('display_type_id, region_gu_id')
    .eq('id', panelId)
    .single();

  if (panelError || !panelInfo) {
    console.warn(
      '[slot resolver] panel 조회 실패:',
      panelId,
      panelError?.message
    );
    const result = { panelInfo: null, periodId: null };
    if (cache?.panelInfoAndPeriod)
      cache.panelInfoAndPeriod.set(cacheKey, result);
    return result;
  }

  const orFilter = `and(period_from.lte.${displayStartDate},period_to.gte.${displayEndDate}),and(period_to.gte.${displayStartDate},period_from.lte.${displayEndDate})`;

  const { data: periodRow, error: periodError } = await supabase
    .from('region_gu_display_periods')
    .select('id')
    .eq('region_gu_id', panelInfo.region_gu_id)
    .eq('display_type_id', panelInfo.display_type_id)
    .or(orFilter)
    .limit(1)
    .maybeSingle();

  if (periodError) {
    console.warn(
      '[slot resolver] period 조회 오류:',
      panelId,
      periodError.message
    );
    const result = { panelInfo, periodId: null };
    if (cache?.panelInfoAndPeriod)
      cache.panelInfoAndPeriod.set(cacheKey, result);
    return result;
  }

  if (!periodRow) {
    console.warn(
      '[slot resolver] 해당 기간을 찾을 수 없음:',
      panelId,
      displayStartDate,
      displayEndDate
    );
  }

  const result = { panelInfo, periodId: periodRow?.id ?? null };
  if (cache?.panelInfoAndPeriod) cache.panelInfoAndPeriod.set(cacheKey, result);
  return result;
}

async function findAvailableBannerSlot(
  panelId: string,
  periodId: string | null,
  displayStartDate: string,
  preferredSlotNumber?: number,
  currentBannerSlotId?: string,
  cache?: SlotResolverCache
) {
  let bannerSlots: { id: string; slot_number: number }[] | null | undefined =
    cache?.bannerSlotsByPanel?.get(panelId)?.bannerSlots;
  let slotMap: Map<string, number> | undefined =
    cache?.bannerSlotsByPanel?.get(panelId)?.slotMap;

  if (!bannerSlots || !slotMap) {
    const { data, error: slotsError } = await supabase
      .from('banner_slots')
      .select('id, slot_number')
      .eq('panel_id', panelId)
      .order('slot_number', { ascending: true });

    bannerSlots = data;

    if (slotsError || !bannerSlots || bannerSlots.length === 0) {
      console.warn(
        '[slot resolver] banner_slots 조회 실패:',
        panelId,
        slotsError?.message
      );
      return null;
    }

    slotMap = new Map(bannerSlots.map((slot) => [slot.id, slot.slot_number]));
    if (cache?.bannerSlotsByPanel) {
      cache.bannerSlotsByPanel.set(panelId, { bannerSlots, slotMap });
    }
  }

  const slotIds = bannerSlots.map((slot) => slot.id);
  let inventoryMap = new Map<
    string,
    { is_closed: boolean; is_available: boolean }
  >();

  if (periodId) {
    const inventoryCacheKey = `${periodId}|${panelId}`;
    const cachedInventory =
      cache?.inventoryByPeriodPanel?.get(inventoryCacheKey);
    if (cachedInventory) {
      inventoryMap = cachedInventory;
    } else {
      const { data: inventoryRows } = await supabase
        .from('banner_slot_inventory')
        .select('banner_slot_id, is_closed, is_available')
        .eq('region_gu_display_period_id', periodId)
        .in('banner_slot_id', slotIds);

      inventoryRows?.forEach((row) => {
        inventoryMap.set(row.banner_slot_id, {
          is_closed: row.is_closed,
          is_available: row.is_available,
        });
      });

      if (cache?.inventoryByPeriodPanel) {
        cache.inventoryByPeriodPanel.set(inventoryCacheKey, inventoryMap);
      }
    }
  }

  const isSlotOpen = (slotId: string) => {
    const inventory = inventoryMap.get(slotId);
    // 재고 레코드가 없으면 닫힘 처리 (재고 생성 전에는 신청 불가)
    if (!inventory) return false;
    if (inventory.is_closed) return false;
    if (inventory.is_available === false) return false;
    return true;
  };

  const usageCacheKey = `${panelId}|${displayStartDate}`;
  let occupiedSlotIds: Set<string> | undefined =
    cache?.slotUsageByPanelDate?.get(usageCacheKey);

  if (!occupiedSlotIds) {
    const { data: usageRows, error: usageError } = await supabase
      .from('panel_slot_usage')
      .select('banner_slot_id')
      .eq('panel_id', panelId)
      .eq('attach_date_from', displayStartDate)
      .eq('is_active', true)
      .in('banner_slot_id', slotIds);

    if (usageError) {
      console.warn(
        '[slot resolver] panel_slot_usage 점유 슬롯 조회 실패:',
        panelId,
        displayStartDate,
        usageError.message
      );
      occupiedSlotIds = new Set<string>();
    } else {
      occupiedSlotIds = new Set(
        (usageRows || [])
          .map((row: { banner_slot_id?: string | null }) => row.banner_slot_id)
          .filter((id): id is string => Boolean(id))
      );
    }

    if (cache?.slotUsageByPanelDate) {
      cache.slotUsageByPanelDate.set(usageCacheKey, occupiedSlotIds);
    }
  }

  const preferredSlot = preferredSlotNumber
    ? bannerSlots.find((slot) => slot.slot_number === preferredSlotNumber)
    : undefined;

  const orderedSlots: { id: string; slot_number: number }[] = [];

  if (preferredSlot) {
    orderedSlots.push(preferredSlot);
  }

  bannerSlots.forEach((slot) => {
    if (!orderedSlots.some((ordered) => ordered.id === slot.id)) {
      orderedSlots.push(slot);
    }
  });

  if (currentBannerSlotId && isSlotOpen(currentBannerSlotId)) {
    return {
      bannerSlotId: currentBannerSlotId,
      slotNumber: slotMap.get(currentBannerSlotId) ?? preferredSlotNumber ?? 1,
    };
  }

  for (const slot of orderedSlots) {
    // 이미 점유된 슬롯은 제외 (동일 시작일 기준)
    if (occupiedSlotIds?.has(slot.id)) continue;
    if (isSlotOpen(slot.id)) {
      return {
        bannerSlotId: slot.id,
        slotNumber: slot.slot_number,
      };
    }
  }

  return null;
}

export async function ensurePanelSlotUsageForItem({
  item,
  existingPanelSlotUsageId,
  displayStartDate,
  displayEndDate,
  cache,
}: {
  item: SlotResolverItem;
  existingPanelSlotUsageId?: string | null;
  displayStartDate: string;
  displayEndDate: string;
  cache?: SlotResolverCache;
}): Promise<SlotResolutionResult> {
  const slotCategory = detectSlotCategory(item);
  const panelId = item.panel_id;
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/de0826ba-4e91-43eb-b001-5614ace69b75', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: 'debug-session',
      runId: 'pre-fix',
      hypothesisId: 'H1',
      location: 'src/lib/slotResolver.ts:ensurePanelSlotUsageForItem:entry',
      message: 'ensurePanelSlotUsageForItem entry',
      data: {
        hasPanelId: !!panelId,
        slotCategory,
        existingPanelSlotUsageId: existingPanelSlotUsageId ?? null,
        snapshotSlotNumber: item.panel_slot_snapshot?.slot_number ?? null,
        snapshotBannerType: item.panel_slot_snapshot?.banner_type ?? null,
        hasSnapshotBannerSlotId: !!item.panel_slot_snapshot?.banner_slot_id,
        displayStartDate,
        displayEndDate,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  if (!panelId) {
    return {
      panelSlotUsageId: existingPanelSlotUsageId ?? null,
      slotNumber: item.panel_slot_snapshot?.slot_number ?? null,
      slotCategory,
    };
  }

  const { panelInfo, periodId } = await getPanelInfoAndPeriod(
    panelId,
    displayStartDate,
    displayEndDate,
    cache
  );

  let existingUsage: {
    id: string;
    banner_slot_id?: string;
    slot_number?: number;
  } | null = null;

  if (existingPanelSlotUsageId) {
    const { data: usage, error: usageError } = await supabase
      .from('panel_slot_usage')
      .select('id, banner_slot_id, slot_number')
      .eq('id', existingPanelSlotUsageId)
      .single();

    if (usageError) {
      console.warn(
        '[slot resolver] panel_slot_usage 조회 실패:',
        existingPanelSlotUsageId,
        usageError.message
      );
    }

    existingUsage = usage || null;
  }

  const preferredSlotNumber =
    existingUsage?.slot_number ?? item.panel_slot_snapshot?.slot_number ?? 1;
  const preferredBannerSlotId = existingUsage?.banner_slot_id;

  const availableSlot = await findAvailableBannerSlot(
    panelId,
    periodId,
    displayStartDate,
    preferredSlotNumber,
    preferredBannerSlotId,
    cache
  );

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/de0826ba-4e91-43eb-b001-5614ace69b75', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: 'debug-session',
      runId: 'pre-fix',
      hypothesisId: 'H1',
      location:
        'src/lib/slotResolver.ts:ensurePanelSlotUsageForItem:availableSlot',
      message: 'availableSlot resolved',
      data: {
        panelId,
        periodId,
        preferredSlotNumber,
        preferredBannerSlotId: preferredBannerSlotId ?? null,
        availableBannerSlotId: availableSlot?.bannerSlotId ?? null,
        availableSlotNumber: availableSlot?.slotNumber ?? null,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  if (!availableSlot) {
    throw new Error('사용 가능한 슬롯이 없습니다. 잠시 후 다시 시도해주세요.');
  }

  if (
    existingUsage &&
    existingUsage.banner_slot_id === availableSlot.bannerSlotId
  ) {
    return {
      panelSlotUsageId: existingUsage.id,
      slotNumber: existingUsage.slot_number ?? availableSlot.slotNumber,
      slotCategory,
    };
  }

  const { data: existingSlotUsage } = await supabase
    .from('panel_slot_usage')
    .select('id, slot_number, attach_date_from')
    .eq('panel_id', panelId)
    .eq('slot_number', availableSlot.slotNumber)
    .eq('banner_slot_id', availableSlot.bannerSlotId)
    .eq('attach_date_from', displayStartDate)
    .maybeSingle();

  if (existingSlotUsage && existingSlotUsage.id) {
    return {
      panelSlotUsageId: existingSlotUsage.id,
      slotNumber: existingSlotUsage.slot_number ?? availableSlot.slotNumber,
      slotCategory,
    };
  }

  if (!panelInfo?.display_type_id) {
    return {
      panelSlotUsageId: existingUsage?.id ?? null,
      slotNumber: availableSlot.slotNumber,
      slotCategory,
    };
  }

  const usageType = slotCategory === 'led' ? 'led_display' : 'banner_display';
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/de0826ba-4e91-43eb-b001-5614ace69b75', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: 'debug-session',
      runId: 'pre-fix',
      hypothesisId: 'H1',
      location:
        'src/lib/slotResolver.ts:ensurePanelSlotUsageForItem:insert:before',
      message: 'inserting panel_slot_usage',
      data: {
        panelId,
        periodId,
        slotNumber: availableSlot.slotNumber,
        bannerSlotId: availableSlot.bannerSlotId,
        usageType,
        bannerType: item.panel_slot_snapshot?.banner_type ?? 'panel',
        attachDateFrom: displayStartDate,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  const { data: newUsage, error: newUsageError } = await supabase
    .from('panel_slot_usage')
    .insert({
      display_type_id: panelInfo.display_type_id,
      panel_id: panelId,
      slot_number: availableSlot.slotNumber,
      banner_slot_id: availableSlot.bannerSlotId,
      usage_type: usageType,
      attach_date_from: displayStartDate,
      is_active: true,
      is_closed: false,
      banner_type: item.panel_slot_snapshot?.banner_type || 'panel',
    })
    .select('id')
    .single();

  if (newUsageError || !newUsage) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/de0826ba-4e91-43eb-b001-5614ace69b75', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'debug-session',
        runId: 'pre-fix',
        hypothesisId: 'H2',
        location:
          'src/lib/slotResolver.ts:ensurePanelSlotUsageForItem:insert:error',
        message: 'panel_slot_usage insert failed',
        data: {
          panelId,
          slotNumber: availableSlot?.slotNumber ?? null,
          bannerSlotId: availableSlot?.bannerSlotId ?? null,
          errorMessage: newUsageError?.message ?? null,
          errorDetails: newUsageError?.details ?? null,
          errorHint: newUsageError?.hint ?? null,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    console.error('[slot resolver] panel_slot_usage 생성 실패:', newUsageError);
    // 동시성 경쟁으로 insert가 실패한 경우, 실제로 생성된 레코드를 재조회하여 복구
    const { data: racedUsage, error: racedUsageError } = await supabase
      .from('panel_slot_usage')
      .select('id, slot_number')
      .eq('panel_id', panelId)
      .eq('slot_number', availableSlot.slotNumber)
      .eq('banner_slot_id', availableSlot.bannerSlotId)
      .eq('attach_date_from', displayStartDate)
      .maybeSingle();

    if (!racedUsageError && racedUsage?.id) {
      console.warn(
        '[slot resolver] insert 경쟁상황으로 판단되어 기존 레코드 재사용:',
        {
          panelId,
          slotNumber: availableSlot.slotNumber,
          usageId: racedUsage.id,
        }
      );
      return {
        panelSlotUsageId: racedUsage.id,
        slotNumber: racedUsage.slot_number ?? availableSlot.slotNumber,
        slotCategory,
      };
    }

    const errorText = [
      newUsageError?.message,
      newUsageError?.details,
      newUsageError?.hint,
    ]
      .filter(Boolean)
      .join(' | ');

    const conflictMatch = errorText.match(
      /conflicting_usage_id:\s*([0-9a-f-]+)/i
    );

    if (conflictMatch) {
      const conflictingUsageId = conflictMatch[1];
      console.warn(
        '[slot resolver] 충돌 발생한 슬롯이 이미 존재하므로 해당 레코드를 재사용합니다.',
        {
          panelId,
          slotNumber: availableSlot.slotNumber,
          conflictingUsageId,
        }
      );
      return {
        panelSlotUsageId: conflictingUsageId,
        slotNumber: availableSlot.slotNumber,
        slotCategory,
      };
    }

    // 원인 파악을 위해 가능한 한 원본 메시지를 노출 (UI에서 그대로 표시됨)
    throw new Error(newUsageError?.message || '슬롯 할당에 실패했습니다.');
  }

  return {
    panelSlotUsageId: newUsage.id,
    slotNumber: availableSlot.slotNumber,
    slotCategory,
  };
}
