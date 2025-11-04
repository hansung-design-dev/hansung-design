// 디지털 제품 데이터 확인 스크립트
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

async function checkDigitalProducts() {
  console.log('🔍 Digital Products 테이블에서 데이터 확인 중...\n');

  try {
    // 전체 데이터 조회
    const { data, error, count } = await supabase
      .from('digital_products')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('❌ 에러:', error);
      return;
    }

    console.log(`✅ 총 ${count || 0}개의 제품이 있습니다.\n`);

    if (!data || data.length === 0) {
      console.log('⚠️  데이터가 없습니다. SQL 파일을 실행했는지 확인해주세요.');
      return;
    }

    // product_type별로 그룹화
    const groupedByType = {};
    data.forEach((product) => {
      const type = product.product_type || '기타';
      if (!groupedByType[type]) {
        groupedByType[type] = [];
      }
      groupedByType[type].push(product);
    });

    console.log('📊 Product Type별 분류:\n');
    Object.keys(groupedByType)
      .sort()
      .forEach((type) => {
        console.log(`  - ${type}: ${groupedByType[type].length}개`);
      });

    console.log(`\n📋 샘플 데이터 (처음 3개):\n`);
    data.slice(0, 3).forEach((product, index) => {
      console.log(`${index + 1}. ${product.title}`);
      console.log(`   - product_code: ${product.product_code}`);
      console.log(`   - product_type: ${product.product_type}`);
      console.log(`   - brand: ${product.brand}`);
      console.log(`   - price: ${product.price}`);
      console.log('');
    });
  } catch (err) {
    console.error('❌ 예외 발생:', err);
  }
}

checkDigitalProducts();
