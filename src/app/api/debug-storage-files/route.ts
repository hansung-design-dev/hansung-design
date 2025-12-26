import { NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';
import { getStoragePublicUrl } from '@/src/lib/storage-utils';

export async function GET() {
  try {
    const bucketName = 'banner-installed';

    console.log(`🔍 전체 파일 구조 확인: ${bucketName}`);

    // 1. 루트 레벨에서 모든 파일/폴더 확인
    const { data: rootFiles, error: rootError } = await supabase.storage
      .from(bucketName)
      .list('');

    if (rootError) {
      console.error('루트 레벨 조회 오류:', rootError);
      return NextResponse.json({
        success: false,
        error: rootError.message,
        bucket: bucketName,
      });
    }

    // 2. gwanak 관련 파일들 찾기
    const gwanakFiles =
      rootFiles?.filter(
        (file) =>
          file.name.includes('gwanak') ||
          file.name.includes('april') ||
          file.name.includes('may') ||
          file.name.includes('june')
      ) || [];

    // 3. 이미지 파일들만 필터링
    const imageFiles =
      rootFiles?.filter((file) =>
        /\.(jpg|jpeg|png|gif|webp|bmp|tiff)$/i.test(file.name)
      ) || [];

    // 4. 파일명 패턴 분석
    const filePatterns =
      rootFiles?.map((file) => ({
        name: file.name,
        is_image: /\.(jpg|jpeg|png|gif|webp|bmp|tiff)$/i.test(file.name),
        size: file.metadata?.size,
        type: file.metadata?.mimetype,
      })) || [];

    // 5. 실제 URL 생성 테스트 (첫 번째 이미지 파일)
    const testUrls = imageFiles.slice(0, 5).map((file) => ({
      name: file.name,
      url: getStoragePublicUrl('banner-installed', file.name),
      size: file.metadata?.size || 0,
    }));

    return NextResponse.json({
      success: true,
      bucket: bucketName,
      total_files: rootFiles?.length || 0,
      total_images: imageFiles.length,
      gwanak_related_files: gwanakFiles.length,
      all_files: filePatterns,
      gwanak_files: gwanakFiles.map((f) => ({
        name: f.name,
        size: f.metadata?.size,
        type: f.metadata?.mimetype,
      })),
      image_files: imageFiles.map((f) => ({
        name: f.name,
        size: f.metadata?.size,
        type: f.metadata?.mimetype,
      })),
      test_urls: testUrls,
      debug_info: {
        bucket_name: bucketName,
        file_count: rootFiles?.length || 0,
      },
    });
  } catch (error) {
    console.error('Storage 파일 디버그 오류:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
