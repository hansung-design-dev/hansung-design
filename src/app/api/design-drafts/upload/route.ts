import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/app/api/supabase';
import { supabaseAdmin } from '@/src/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const orderId = formData.get('orderId') as string;

    if (!file || !orderId) {
      return NextResponse.json(
        { success: false, error: 'File and orderId are required' },
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

    // 허용된 파일 형식
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

    // 파일명 생성 (안전한 파일명: timestamp_orderId_originalname)
    const timestamp = Date.now();
    const safeFileName = `${timestamp}_${orderId}_${file.name.replace(
      /[^a-zA-Z0-9._-]/g,
      '_'
    )}`;

    // Storage 경로 설정
    const bucketName = 'design-drafts';
    const filePath = `drafts/${safeFileName}`;

    console.log('🔍 [시안 업로드] Supabase Storage 업로드 시작:', {
      bucketName,
      filePath,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });

    // Supabase Storage에 파일 업로드 (관리자 권한 사용하여 RLS 우회)
    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false, // 기존 파일이 있으면 에러 발생
      });

    if (uploadError) {
      console.error('🔍 [시안 업로드] ❌ Storage 업로드 실패:', uploadError);

      // 버킷이 존재하지 않는 경우
      const errorMessage = uploadError.message.toLowerCase();
      if (
        errorMessage.includes('bucket not found') ||
        errorMessage.includes('not found') ||
        errorMessage.includes('404')
      ) {
        console.error(
          '🔍 [시안 업로드] ❌ Storage 버킷이 존재하지 않음:',
          bucketName
        );
        return NextResponse.json(
          {
            success: false,
            error: `Storage 버킷 '${bucketName}'이 존재하지 않습니다. Supabase Dashboard에서 버킷을 생성해주세요.`,
            bucketName,
            help: 'Supabase Dashboard > Storage > Create Bucket > 이름: design-drafts > Public으로 설정',
          },
          { status: 404 }
        );
      }

      // 이미 존재하는 파일인 경우 (upsert로 재시도)
      if (
        uploadError.message.includes('already exists') ||
        uploadError.message.includes('duplicate')
      ) {
        console.log('🔍 [시안 업로드] 파일이 이미 존재, upsert로 재시도...');
        const { error: upsertError } = await supabaseAdmin.storage
          .from(bucketName)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true, // 기존 파일 덮어쓰기
          });

        if (upsertError) {
          console.error('🔍 [시안 업로드] ❌ upsert 실패:', upsertError);
          return NextResponse.json(
            { success: false, error: '파일 업로드에 실패했습니다.' },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { success: false, error: '파일 업로드에 실패했습니다.' },
          { status: 500 }
        );
      }
    }

    // 공개 URL 생성
    const { data: urlData } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    const fileUrl = urlData.publicUrl;

    console.log('🔍 [시안 업로드] ✅ Storage 업로드 성공:', {
      fileUrl,
      filePath,
    });

    // orders 테이블에서 design_drafts_id 조회
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('design_drafts_id')
      .eq('id', orderId)
      .single();

    let existingDraft = null;
    if (!orderError && order?.design_drafts_id) {
      const { data: draft } = await supabase
        .from('design_drafts')
        .select('id')
        .eq('id', order.design_drafts_id)
        .eq('draft_category', 'initial')
        .single();
      existingDraft = draft;
    }

    let draftId: string;

    if (existingDraft) {
      // 기존 시안 업데이트
      const { data: updatedDraft, error: updateError } = await supabase
        .from('design_drafts')
        .update({
          file_name: file.name,
          file_url: fileUrl,
          file_extension: file.name.split('.').pop(),
          file_size: file.size,
          notes: '사용자가 업로드한 시안',
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingDraft.id)
        .select()
        .single();

      if (updateError) throw updateError;
      draftId = updatedDraft.id;
    } else {
      // 새로운 시안 생성 (이 경우는 주문 생성 시 이미 design_drafts가 생성되어 있어야 함)
      throw new Error('주문에 해당하는 design_drafts를 찾을 수 없습니다.');
    }

    return NextResponse.json({
      success: true,
      data: {
        draftId,
        fileUrl,
        fileName: file.name,
        fileSize: file.size,
      },
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
