import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/app/api/supabase';

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

    // 파일명 생성 (timestamp + original name)
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;

    // 실제 구현에서는 Supabase Storage나 다른 파일 스토리지 서비스 사용
    // 여기서는 임시로 파일 정보만 반환
    const fileUrl = `/uploads/${fileName}`; // 실제 URL로 변경 필요

    // 시안 레코드 생성 또는 업데이트
    const { data: existingDraft } = await supabase
      .from('design_drafts')
      .select('id')
      .eq('order_id', orderId)
      .eq('draft_category', 'initial')
      .single();

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
      // 새로운 시안 생성
      const { data: newDraft, error: createError } = await supabase
        .from('design_drafts')
        .insert({
          order_id: orderId,
          draft_category: 'initial',
          file_name: file.name,
          file_url: fileUrl,
          file_extension: file.name.split('.').pop(),
          file_size: file.size,
          notes: '사용자가 업로드한 시안',
        })
        .select()
        .single();

      if (createError) throw createError;
      draftId = newDraft.id;

      // orders 테이블의 design_drafts_id 업데이트
      await supabase
        .from('orders')
        .update({ design_drafts_id: newDraft.id })
        .eq('id', orderId);
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
