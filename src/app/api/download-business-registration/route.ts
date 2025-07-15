import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('filePath');
    const userId = searchParams.get('userId');

    if (!filePath || !userId) {
      return NextResponse.json(
        { error: '파일 경로와 사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 보안 검증: 파일 경로가 올바른 형식인지 확인
    if (!filePath.startsWith('/uploads/business-registration/')) {
      return NextResponse.json(
        { error: '잘못된 파일 경로입니다.' },
        { status: 400 }
      );
    }

    // 실제 파일 경로 생성
    const fullPath = join(process.cwd(), 'public', filePath);

    // 파일 존재 확인
    if (!existsSync(fullPath)) {
      return NextResponse.json(
        { error: '파일을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 파일 읽기
    const fileBuffer = await readFile(fullPath);

    // 파일명 추출
    const fileName = filePath.split('/').pop() || 'business-registration';

    // Content-Type 결정
    const getContentType = (fileName: string) => {
      const extension = fileName.split('.').pop()?.toLowerCase();
      switch (extension) {
        case 'pdf':
          return 'application/pdf';
        case 'jpg':
        case 'jpeg':
          return 'image/jpeg';
        case 'png':
          return 'image/png';
        default:
          return 'application/octet-stream';
      }
    };

    // 응답 헤더 설정
    const headers = {
      'Content-Type': getContentType(fileName),
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': fileBuffer.length.toString(),
    };

    return new NextResponse(fileBuffer, { headers });
  } catch (error) {
    console.error('파일 다운로드 오류:', error);
    return NextResponse.json(
      { error: '파일 다운로드 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
