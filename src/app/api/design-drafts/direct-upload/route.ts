import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/app/api/supabase';
import { supabaseAdmin } from '@/src/lib/supabase';

// 결제 페이지에서 직접 시안을 업로드할 때 사용하는 API
// - 주문이 생성되기 전에 user_profile_id 기준으로 design_drafts를 먼저 만들고
//   이후 결제 완료 시 주문과 연결한다.

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const userProfileId = formData.get('userProfileId') as string | null;
    const projectName = (formData.get('projectName') as string | null) || '';
    const adContent = (formData.get('adContent') as string | null) || '';
    const draftDeliveryMethod =
      (formData.get('draftDeliveryMethod') as string | null) || 'upload';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'File is required' },
        { status: 400 }
      );
    }

    if (!userProfileId) {
      return NextResponse.json(
        { success: false, error: 'userProfileId is required' },
        { status: 400 }
      );
    }

    if (!projectName.trim()) {
      return NextResponse.json(
        { success: false, error: 'projectName is required' },
        { status: 400 }
      );
    }

    // 프로필 존재 여부 확인 (선택이지만, 없으면 업로드 의미가 없으므로 막는다)
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', userProfileId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: 'Invalid userProfileId' },
        { status: 400 }
      );
    }

    // 파일 크기 제한 (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // 허용된 파일 형식 (기존 upload API와 동일)
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/x-hwp',
      'application/postscript',
      'image/jpeg',
      'image/jpg',
      'image/png',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'File type not allowed' },
        { status: 400 }
      );
    }

    // 파일명 생성 (안전한 파일명: timestamp_profileId_originalname)
    const timestamp = Date.now();
    const safeFileName = `${timestamp}_${userProfileId}_${file.name.replace(
      /[^a-zA-Z0-9._-]/g,
      '_'
    )}`;

    // Storage 경로 설정
    const bucketName = 'design-drafts';
    const filePath = `drafts/${safeFileName}`;

    console.log('🔍 [시안 Direct 업로드] Supabase Storage 업로드 시작:', {
      bucketName,
      filePath,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      userProfileId,
      projectName,
      adContent,
      draftDeliveryMethod,
    });

    // Supabase Storage에 파일 업로드 (관리자 권한 사용)
    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error(
        '🔍 [시안 Direct 업로드] ❌ Storage 업로드 실패:',
        uploadError
      );

      const errorMessage = uploadError.message.toLowerCase();
      if (
        errorMessage.includes('bucket not found') ||
        errorMessage.includes('not found') ||
        errorMessage.includes('404')
      ) {
        return NextResponse.json(
          {
            success: false,
            error: `Storage bucket '${bucketName}' not found. Please create it in Supabase Dashboard.`,
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { success: false, error: 'Failed to upload file to storage.' },
        { status: 500 }
      );
    }

    // 공개 URL 생성
    const { data: urlData } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    const fileUrl = urlData.publicUrl;

    console.log('🔍 [시안 Direct 업로드] ✅ Storage 업로드 성공:', {
      fileUrl,
      filePath,
    });

    // design_drafts에 새 시안 레코드 생성
    const { data: draft, error: draftError } = await supabaseAdmin
      .from('design_drafts')
      .insert({
        user_profile_id: userProfileId,
        draft_category: 'initial',
        project_name: projectName,
        ad_content: adContent || null,
        file_name: file.name,
        file_url: fileUrl,
        file_extension: file.name.split('.').pop(),
        file_size: file.size,
        notes: `Uploaded from payment page (method: ${draftDeliveryMethod})`,
        is_approved: false,
      })
      .select('id, project_name, file_name, file_url')
      .single();

    if (draftError || !draft) {
      console.error(
        '🔍 [시안 Direct 업로드] ❌ design_drafts 생성 실패:',
        draftError
      );
      return NextResponse.json(
        { success: false, error: 'Failed to create design draft.' },
        { status: 500 }
      );
    }

    console.log('🔍 [시안 Direct 업로드] ✅ design_drafts 생성 성공:', {
      draftId: draft.id,
      project_name: draft.project_name,
    });

    return NextResponse.json({
      success: true,
      data: {
        draftId: draft.id as string,
        fileUrl,
        fileName: file.name,
      },
    });
  } catch (error) {
    console.error('🔍 [시안 Direct 업로드] ❌ 예외 발생:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}


