import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bucketName = 'banner-installed';

    console.log(`🔍 Storage 권한 테스트: ${bucketName}`);

    // 1. 버킷 존재 여부 확인
    const { data: buckets, error: bucketError } =
      await supabase.storage.listBuckets();

    if (bucketError) {
      console.error('버킷 목록 조회 오류:', bucketError);
      return NextResponse.json({
        success: false,
        error: bucketError.message,
        bucket: bucketName,
      });
    }

    // 2. 특정 버킷 정보 확인
    const targetBucket = buckets?.find((b) => b.name === bucketName);

    // 3. 루트 레벨 파일 목록 (권한 테스트)
    const { data: rootFiles, error: rootError } = await supabase.storage
      .from(bucketName)
      .list('', { limit: 10 });

    // 4. 특정 폴더 접근 테스트
    const { data: folderFiles, error: folderError } = await supabase.storage
      .from(bucketName)
      .list('gwanak', { limit: 10 });

    // 5. 특정 파일 접근 테스트 (예시)
    const { data: specificFile, error: specificError } = await supabase.storage
      .from(bucketName)
      .list('gwanak/may_second_2025', { limit: 5 });

    return NextResponse.json({
      success: true,
      bucket_name: bucketName,
      available_buckets: buckets?.map((b) => b.name) || [],
      target_bucket: targetBucket
        ? {
            name: targetBucket.name,
            public: targetBucket.public,
            file_size_limit: targetBucket.file_size_limit,
            allowed_mime_types: targetBucket.allowed_mime_types,
          }
        : null,
      root_access: {
        success: !rootError,
        error: rootError?.message || null,
        files_count: rootFiles?.length || 0,
        files: rootFiles?.slice(0, 5).map((f) => f.name) || [],
      },
      folder_access: {
        success: !folderError,
        error: folderError?.message || null,
        files_count: folderFiles?.length || 0,
        files: folderFiles?.slice(0, 5).map((f) => f.name) || [],
      },
      specific_folder_access: {
        success: !specificError,
        error: specificError?.message || null,
        files_count: specificFile?.length || 0,
        files: specificFile?.slice(0, 5).map((f) => f.name) || [],
      },
      debug_info: {
        bucket_error: bucketError?.message || null,
        root_error: rootError?.message || null,
        folder_error: folderError?.message || null,
        specific_error: specificError?.message || null,
      },
    });
  } catch (error) {
    console.error('Storage 권한 테스트 오류:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
