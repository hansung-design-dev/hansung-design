import { supabase } from './supabase';

export interface StorageImage {
  name: string;
  displayName: string; // 표시용 이름 (확장자 제거)
  url: string;
  size: number;
  lastModified: string;
}

/**
 * Storage 버킷 이름 타입
 */
export type StorageBucketName =
  | 'banner-installed'
  | 'public-design-items'
  | 'design-drafts';

/**
 * Supabase Storage Public URL 생성
 */
export function getStoragePublicUrl(
  bucket: StorageBucketName,
  path: string,
  options?: { encodeUri?: boolean }
): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL 환경변수가 설정되지 않았습니다.');
  }
  const shouldEncode = options?.encodeUri ?? true;
  const encodedPath = shouldEncode ? encodeURIComponent(path) : path;

  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${encodedPath}`;
}

/**
 * 상대 경로를 Storage URL로 변환
 */
export function transformImageUrl(
  url: string,
  bucket: StorageBucketName,
  pathPrefix: string = '/images/'
): string {
  if (url.startsWith(pathPrefix)) {
    const storagePath = url.replace(pathPrefix, '');
    return getStoragePublicUrl(bucket, storagePath, { encodeUri: false });
  }
  return url;
}

/**
 * Supabase Storage 폴더에서 이미지 파일들을 가져오는 함수
 */
export async function getImagesFromFolder(
  folderPath: string,
  bucketName: StorageBucketName = 'banner-installed'
): Promise<StorageImage[]> {
  try {
    const { data: files, error } = await supabase.storage
      .from(bucketName)
      .list(folderPath);

    if (error) {
      console.error(`Storage error for ${folderPath}:`, error);
      return [];
    }

    if (!files || files.length === 0) {
      return [];
    }

    // 이미지 파일만 필터링
    const imageFiles = files.filter((file) =>
      /\.(jpg|jpeg|png|gif|webp|bmp|tiff)$/i.test(file.name)
    );

    // 파일명으로 정렬 (숫자 순서 고려)
    imageFiles.sort((a, b) => {
      const aMatch = a.name.match(/(\d+)/);
      const bMatch = b.name.match(/(\d+)/);

      if (aMatch && bMatch) {
        return parseInt(aMatch[1]) - parseInt(bMatch[1]);
      }

      return a.name.localeCompare(b.name);
    });

    // URL 생성
    return imageFiles.map((file) => {
      const filePath = `${folderPath}/${file.name}`;
      // 파일명에서 확장자 제거 (예: 01.jpg → 01)
      const displayName = file.name.replace(/\.[^/.]+$/, '');
      return {
        name: file.name,
        displayName: displayName, // 표시용 이름 (확장자 제거)
        url: getStoragePublicUrl(bucketName, filePath),
        size: file.metadata?.size || 0,
        lastModified: file.updated_at,
      };
    });
  } catch (error) {
    console.error('Error fetching images from folder:', error);
    return [];
  }
}
