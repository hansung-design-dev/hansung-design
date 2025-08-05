import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folderPath = searchParams.get('folder') || 'gwanak/apri_first_2025';
    const bucketName = 'banner-installed';

    console.log(`🔍 디버깅: ${bucketName}/${folderPath}`);

    // 1. 폴더 존재 여부 확인
    const { data: files, error } = await supabase.storage
      .from(bucketName)
      .list(folderPath);

    if (error) {
      console.error('Storage 오류:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
        folder_path: folderPath,
        bucket: bucketName,
      });
    }

    // 2. 모든 파일 목록
    const allFiles = files || [];
    const imageFiles = allFiles.filter((file) =>
      /\.(jpg|jpeg|png|gif|webp|bmp|tiff)$/i.test(file.name)
    );

    // 3. 실제 URL 생성 테스트
    const testUrls = imageFiles.slice(0, 3).map((file) => {
      const filePath = `${folderPath}/${file.name}`;
      return {
        name: file.name,
        url: `https://eklijrstdcgsxtbjxjra.supabase.co/storage/v1/object/public/${bucketName}/${encodeURIComponent(
          filePath
        )}`,
        size: file.metadata?.size || 0,
      };
    });

    // 4. 상위 폴더도 확인
    const parentFolder = folderPath.split('/')[0];
    const { data: parentFiles, error: parentError } = await supabase.storage
      .from(bucketName)
      .list(parentFolder);

    return NextResponse.json({
      success: true,
      folder_path: folderPath,
      bucket: bucketName,
      folder_exists: true,
      total_files: allFiles.length,
      image_files: imageFiles.length,
      all_files: allFiles.map((f) => ({
        name: f.name,
        size: f.metadata?.size,
        type: f.metadata?.mimetype,
      })),
      image_files_detail: imageFiles.map((f) => ({
        name: f.name,
        size: f.metadata?.size,
        type: f.metadata?.mimetype,
      })),
      test_urls: testUrls,
      parent_folder: {
        name: parentFolder,
        exists: !parentError,
        files_count: parentFiles?.length || 0,
        files: parentFiles?.map((f) => f.name) || [],
      },
      debug_info: {
        folder_path: folderPath,
        bucket_name: bucketName,
      },
    });
  } catch (error) {
    console.error('디버그 API 오류:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
