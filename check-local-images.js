// 로컬 이미지 파일을 기반으로 제품 데이터 확인
const fs = require('fs');
const path = require('path');

const imageDir = path.join(
  __dirname,
  'public/images/digital-media/digital_signage'
);

console.log('🔍 로컬 이미지 파일 확인 중...\n');
console.log(`📁 디렉토리: ${imageDir}\n`);

if (!fs.existsSync(imageDir)) {
  console.error('❌ 이미지 디렉토리가 없습니다.');
  process.exit(1);
}

const imageFiles = fs.readdirSync(imageDir).filter((file) => {
  return /\.(jpg|jpeg|png|gif)$/i.test(file);
});

console.log(`✅ 총 ${imageFiles.length}개의 이미지 파일을 찾았습니다.\n`);

// 이미지 파일명을 기반으로 제품 정보 추정
const imageMap = {
  '1_samsung_singleSignage.jpg': '삼성 싱글 사이니지',
  '2_samsung_multiVision.jpg': '삼성 멀티비전',
  '3_samsung_digitalBoard.jpg': '삼성 전자칠판',
  '4_LG_signage.jpg': 'LG 사이니지',
  '5_chinese_standard.jpg': '스탠드 사이니지',
  '6_samsung_paymentKiosk.jpg': '삼성 결제키오스크',
  '7_multiVision_1.jpg': '멀티비전',
  '7_multiVision_2.jpg': '멀티비전',
  '7_multiVision_3.jpg': '멀티비전',
  '8_AIDA_digitalFrame.jpg': '디지털액자',
  '9_standardSignage_pivot.jpg': 'Q시리즈 스탠드',
  '10_theGallery.png': '더 갤러리',
  '11_Qseries_standardSignage.jpg': 'Q시리즈 스탠드',
  '12_Qseries_touchMonitor.jpg': 'Q시리즈 터치모니터',
  '13_bracket_NSV-01.jpg': '브라켓',
  '13_bracket_PV-70.jpg': '브라켓',
  '14_outdoor_wallType.jpg': '옥외형 벽부타입',
  '14_outdoor_standard2.png': '옥외형 스탠드',
  '15_outdoor_standard2.jpg': '옥외형 스탠드',
  '16_LEDdisplay.jpg': 'LED 디스플레이',
  '17-1-controller_PC.jpg': 'LED 컨트롤러',
  '17-2_controller_HD.jpg': 'LED 컨트롤러',
  '17-3-controller_FHD.jpg': 'LED 컨트롤러',
  '17-4_controller_FHD.jpg': 'LED 컨트롤러',
  '18_LEDdisplay_installation.png': 'LED 설치 서비스',
};

console.log('📋 이미지 파일 목록:\n');
imageFiles.sort().forEach((file, index) => {
  const imagePath = `/images/digital-media/digital_signage/${file}`;
  const productName = imageMap[file] || '알 수 없음';
  console.log(`${index + 1}. ${file}`);
  console.log(`   경로: ${imagePath}`);
  console.log(`   제품: ${productName}`);
  console.log('');
});

// SQL 파일에서 사용 중인 이미지 경로 확인
const sqlFile = path.join(
  __dirname,
  'sqls/insert_digital_products_excluding_existing.sql'
);
if (fs.existsSync(sqlFile)) {
  console.log('\n📊 SQL 파일에서 사용 중인 이미지 경로 확인:\n');
  const sqlContent = fs.readFileSync(sqlFile, 'utf8');
  const imagePaths =
    sqlContent.match(/\/images\/digital-media\/digital_signage\/[^'"]+/g) || [];
  const uniquePaths = [...new Set(imagePaths)].sort();

  console.log(
    `✅ SQL 파일에서 ${uniquePaths.length}개의 고유한 이미지 경로를 찾았습니다.\n`
  );

  // 실제 파일과 비교
  const missingImages = [];
  uniquePaths.forEach((imgPath) => {
    const fileName = imgPath.split('/').pop();
    const filePath = path.join(imageDir, fileName);
    if (!fs.existsSync(filePath)) {
      missingImages.push(imgPath);
    }
  });

  if (missingImages.length > 0) {
    console.log('⚠️  SQL 파일에는 있지만 실제 파일이 없는 이미지:\n');
    missingImages.forEach((img) => console.log(`  - ${img}`));
  } else {
    console.log('✅ 모든 이미지 파일이 존재합니다!\n');
  }
}
