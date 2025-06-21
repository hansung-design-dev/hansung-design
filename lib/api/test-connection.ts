import { supabase } from '../supabase';

// Supabase 연결 테스트
export async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');

    // 1. 기본 연결 테스트
    const { data: testData, error: testError } = await supabase
      .from('display_types')
      .select('*')
      .limit(1);

    if (testError) {
      console.error('Connection test failed:', testError);
      return { success: false, error: testError.message };
    }

    console.log('✅ Supabase connection successful');
    console.log('Test data:', testData);

    // 2. panel_info 테이블 확인
    const { data: panelData, error: panelError } = await supabase
      .from('panel_info')
      .select('*')
      .limit(5);

    if (panelError) {
      console.error('Panel info test failed:', panelError);
      return { success: false, error: panelError.message };
    }

    console.log('✅ Panel info table accessible');
    console.log('Panel data count:', panelData?.length);

    // 3. banner_panel_details 테이블 확인
    const { data: bannerData, error: bannerError } = await supabase
      .from('banner_panel_details')
      .select('*')
      .limit(5);

    if (bannerError) {
      console.error('Banner details test failed:', bannerError);
      return { success: false, error: bannerError.message };
    }

    console.log('✅ Banner panel details table accessible');
    console.log('Banner data count:', bannerData?.length);

    // 4. region_gu 테이블 확인
    const { data: regionData, error: regionError } = await supabase
      .from('region_gu')
      .select('*')
      .limit(5);

    if (regionError) {
      console.error('Region gu test failed:', regionError);
      return { success: false, error: regionError.message };
    }

    console.log('✅ Region gu table accessible');
    console.log('Region data:', regionData);

    return {
      success: true,
      message: 'All tests passed',
      data: {
        displayTypes: testData?.length || 0,
        panelInfo: panelData?.length || 0,
        bannerDetails: bannerData?.length || 0,
        regions: regionData?.length || 0,
      },
    };
  } catch (error) {
    console.error('Test failed with exception:', error);
    return { success: false, error: String(error) };
  }
}
