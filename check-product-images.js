// 제품 데이터를 받아와서 이미지 경로 확인
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// .env.local 파일에서 환경변수 읽기
function loadEnvFile() {
  const envPath = path.join(__dirname, '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach((line) => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        process.env[key] = value;
      }
    });
  }
}

loadEnvFile();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const imageDir = path.join(__dirname, 'public/images/digital-media/digital_signage');

async function checkProductImages() {
  console.log('🔍 제품 데이터와 이미지 경로 확인 중...\n');

  try {
    // 전체 데이터 조회
    const { data, error, count } = await supabase
      .from('digital_products')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .limit(10);

    if (error) {
      console.error('❌ 에러:', error);
      return;
    }

    console.log(`✅ 총 ${count || 0}개의 제품이 있습니다.\n`);

    if (!data || data.length === 0) {
      console.log('⚠️  데이터가 없습니다.');
      console.log('💡 SQL 파일을 실행해야 합니다: insert_digital_products_excluding_existing.sql\n');
      return;
    }

    console.log(`📋 처음 ${data.length}개 제품의 이미지 경로 확인:\n`);

    let validCount = 0;
    let invalidCount = 0;

    data.forEach((product, index) => {
      console.log(`${index + 1}. ${product.title}`);
      console.log(`   product_code: ${product.product_code}`);
      
      // main_image_url 확인
      if (product.main_image_url) {
        const imagePath = product.main_image_url;
        console.log(`   main_image_url: ${imagePath}`);
        
        // 실제 파일 경로로 변환
        if (imagePath.startsWith('/images/')) {
          const fileName = imagePath.split('/').pop();
          const filePath = path.join(imageDir, fileName);
          
          if (fs.existsSync(filePath)) {
            console.log(`   ✅ 이미지 파일 존재: ${fileName}`);
            validCount++;
          } else {
            console.log(`   ❌ 이미지 파일 없음: ${fileName}`);
            console.log(`   찾는 위치: ${filePath}`);
            invalidCount++;
          }
        } else {
          console.log(`   ⚠️  경로 형식이 예상과 다름`);
        }
      } else {
        console.log(`   ⚠️  main_image_url이 없습니다`);
      }
      
      // image_urls 확인
      if (product.image_urls && Array.isArray(product.image_urls) && product.image_urls.length > 0) {
        console.log(`   추가 이미지: ${product.image_urls.length}개`);
        product.image_urls.forEach((img, imgIndex) => {
          if (img && img.startsWith('/images/')) {
            const fileName = img.split('/').pop();
            const filePath = path.join(imageDir, fileName);
            if (fs.existsSync(filePath)) {
              console.log(`     ✅ ${fileName}`);
            } else {
              console.log(`     ❌ ${fileName} (없음)`);
            }
          }
        });
      }
      
      console.log('');
    });

    console.log(`\n📊 요약:`);
    console.log(`   ✅ 유효한 이미지: ${validCount}개`);
    console.log(`   ❌ 없는 이미지: ${invalidCount}개`);

  } catch (err) {
    console.error('❌ 예외 발생:', err);
  }
}

checkProductImages();

