import { supabase } from './supabase';

export interface StorageImage {
  name: string;
  url: string;
  size: number;
  lastModified: string;
}

/**
 * Supabase Storage 폴더에서 이미지 파일들을 가져오는 함수
 */
export async function getImagesFromFolder(
  folderPath: string,
  bucketName: string = 'banner-installed'
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
      return {
        name: file.name,
        url: `https://eklijrstdcgsxtbjxjra.supabase.co/storage/v1/object/public/${bucketName}/${encodeURIComponent(
          filePath
        )}`,
        size: file.metadata?.size || 0,
        lastModified: file.updated_at,
      };
    });
  } catch (error) {
    console.error('Error fetching images from folder:', error);
    return [];
  }
}
