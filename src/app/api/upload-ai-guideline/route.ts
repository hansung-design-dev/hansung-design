import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const district = formData.get('district') as string;
    const guidelineType = formData.get('guidelineType') as string;

    if (!file || !district || !guidelineType) {
      return NextResponse.json(
        {
          success: false,
          error: 'File, district, and guidelineType are required',
        },
        { status: 400 }
      );
    }

    // 파일 크기 제한 (50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 50MB' },
        { status: 400 }
      );
    }

    // 허용된 파일 형식 (AI 관련 파일들)
    const allowedTypes = [
      'application/pdf',
      'application/postscript',
      'image/svg+xml',
      'application/illustrator',
      'application/x-illustrator',
      'application/photoshop',
      'application/x-photoshop',
      'image/vnd.adobe.photoshop',
      'application/octet-stream', // AI, PSD 등 바이너리 파일
    ];

    // 파일 확장자로도 검증
    const fileName = file.name.toLowerCase();
    const allowedExtensions = ['.pdf', '.ai', '.psd', '.eps', '.svg', '.indd'];
    const hasValidExtension = allowedExtensions.some((ext) =>
      fileName.endsWith(ext)
    );

    if (!allowedTypes.includes(file.type) && !hasValidExtension) {
      return NextResponse.json(
        {
          success: false,
          error: 'AI, PDF, PSD, EPS, SVG 파일만 업로드 가능합니다.',
        },
        { status: 400 }
      );
    }

    // 파일명 생성 (district_guidelineType_timestamp_originalname)
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const safeFileName = `${district}_${guidelineType}_${timestamp}.${fileExtension}`;

    // Storage 경로 설정
    const bucketName = 'ai-guidelines';
    const filePath = `${district}/${safeFileName}`;

    // Supabase Storage에 파일 업로드
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json(
        { success: false, error: '파일 업로드에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 공개 URL 생성
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;

    // region_gu_guideline 테이블 업데이트
    // 먼저 해당 구의 가이드라인 레코드를 찾습니다
    const { data: regionData, error: regionError } = await supabase
      .from('region_gu')
      .select('id')
      .eq('name', district)
      .single();

    if (regionError || !regionData) {
      return NextResponse.json(
        { success: false, error: '구 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 기존 가이드라인 레코드 확인
    const { data: existingGuideline } = await supabase
      .from('region_gu_guideline')
      .select('id')
      .eq('region_gu_id', regionData.id)
      .eq('guideline_type', guidelineType)
      .single();

    let result;
    if (existingGuideline) {
      // 기존 레코드 업데이트
      const { data: updateData, error: updateError } = await supabase
        .from('region_gu_guideline')
        .update({
          ai_image_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingGuideline.id)
        .select()
        .single();

      if (updateError) throw updateError;
      result = updateData;
    } else {
      // 새 레코드 생성
      const { data: insertData, error: insertError } = await supabase
        .from('region_gu_guideline')
        .insert({
          region_gu_id: regionData.id,
          ai_image_url: publicUrl,
          guideline_type: guidelineType,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      result = insertData;
    }

    return NextResponse.json({
      success: true,
      data: {
        id: result.id,
        fileUrl: publicUrl,
        fileName: file.name,
        fileSize: file.size,
        district,
        guidelineType,
      },
    });
  } catch (error) {
    console.error('AI guideline upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
