import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!file) {
      return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json(
        { error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 파일 타입 검증
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'PDF, JPG, PNG 파일만 업로드 가능합니다.' },
        { status: 400 }
      );
    }

    // 파일 크기 검증 (10MB 제한)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: '파일 크기는 10MB 이하여야 합니다.' },
        { status: 400 }
      );
    }

    // 파일 저장 디렉토리 생성
    const uploadDir = join(
      process.cwd(),
      'public',
      'uploads',
      'business-registration',
      userId
    );
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // 파일명 생성 (timestamp + original name)
    const timestamp = Date.now();
    const originalName = file.name;
    const extension = originalName.split('.').pop();
    const fileName = `${timestamp}_${originalName}`;
    const filePath = join(uploadDir, fileName);

    // 파일을 바이너리로 변환
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 파일 저장
    await writeFile(filePath, buffer);

    // DB에 저장할 파일 경로 반환
    const relativePath = `/uploads/business-registration/${userId}/${fileName}`;

    return NextResponse.json({
      success: true,
      filePath: relativePath,
      fileName: originalName,
      fileSize: file.size,
      fileType: file.type,
    });
  } catch (error) {
    console.error('파일 업로드 오류:', error);
    return NextResponse.json(
      { error: '파일 업로드 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
