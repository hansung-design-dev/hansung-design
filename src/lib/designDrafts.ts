import { supabase } from '@/src/lib/supabase';

export interface EnsureDesignDraftOptions {
  existingDraftId?: string | null;
  userProfileId?: string | null;
  projectName?: string | null;
  orderNumber?: string;
  panelId?: string;
  itemLabel?: string;
  draftDeliveryMethod?: string;
}

export async function ensureDesignDraftForOrderItem(
  options: EnsureDesignDraftOptions
): Promise<string | null> {
  const {
    existingDraftId,
    userProfileId,
    projectName,
    orderNumber,
    panelId,
    itemLabel,
    draftDeliveryMethod,
  } = options;

  if (existingDraftId) {
    return existingDraftId;
  }

  if (!userProfileId) {
    return null;
  }

  const normalizedProjectName =
    (projectName || '프로젝트명 없음').trim() || '프로젝트명 없음';

  const noteParts = [
    orderNumber ? `주문 ${orderNumber}` : null,
    panelId ? `게시대 ${panelId}` : null,
    itemLabel ? itemLabel : null,
    draftDeliveryMethod ? `전송방식: ${draftDeliveryMethod}` : null,
  ].filter(Boolean);

  const notes = noteParts.length > 0 ? `자동 생성 (${noteParts.join(' | ')})` : null;

  try {
    console.log('🔍 [designDrafts helper] 시안 자동 생성 시작:', {
      userProfileId,
      projectName: normalizedProjectName,
      orderNumber,
      panelId,
      itemLabel,
      draftDeliveryMethod,
    });

    const { data: draft, error } = await supabase
      .from('design_drafts')
      .insert({
        user_profile_id: userProfileId,
        draft_category: 'initial',
        project_name: normalizedProjectName,
        notes: notes || undefined,
      })
      .select('id')
      .single();

    if (error) {
      console.error('🔍 [designDrafts helper] design_drafts 생성 실패:', error);
      return null;
    }

    console.log('🔍 [designDrafts helper] 시안 자동 생성 완료:', {
      draftId: draft?.id,
      projectName: normalizedProjectName,
    });

    return draft?.id ?? null;
  } catch (error) {
    console.error(
      '🔍 [designDrafts helper] design_drafts 생성 중 예외 발생:',
      error
    );
    return null;
  }
}

