import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const districtName = searchParams.get('district');
    const displayType = searchParams.get('displayType');

    console.log('API called with:', { action, districtName, displayType });

    if (action === 'getByDistrict' && districtName && displayType) {
      // 먼저 region_gu에서 해당 구의 ID를 찾기
      const { data: regionData, error: regionError } = await supabase
        .from('region_gu')
        .select('id, name')
        .eq('name', districtName)
        .single();

      if (regionError) {
        console.error('Error fetching region_gu:', regionError);
        return NextResponse.json(
          { success: false, error: 'Region not found' },
          { status: 404 }
        );
      }

      // display_types에서 해당 타입의 ID를 찾기
      const { data: displayTypeData, error: displayTypeError } = await supabase
        .from('display_types')
        .select('id, name')
        .eq('name', displayType)
        .single();

      if (displayTypeError) {
        console.error('Error fetching display_type:', displayTypeError);
        return NextResponse.json(
          { success: false, error: 'Display type not found' },
          { status: 404 }
        );
      }

      console.log('Found IDs:', {
        regionId: regionData.id,
        displayTypeId: displayTypeData.id,
      });

      // bank_info에서 해당하는 데이터 찾기
      const { data, error } = await supabase
        .from('bank_info')
        .select(
          `
          id,
          bank_name,
          account_number,
          depositor,
          region_gu_id,
          display_type_id
        `
        )
        .eq('region_gu_id', regionData.id)
        .eq('display_type_id', displayTypeData.id)
        .single();

      if (error) {
        console.error('Error fetching bank info:', error);
        return NextResponse.json(
          { success: false, error: 'Bank info not found' },
          { status: 404 }
        );
      }

      // 응답 데이터 구성
      const responseData = {
        id: data.id,
        bank_name: data.bank_name,
        account_number: data.account_number,
        depositor: data.depositor,
        region_gu: {
          id: regionData.id,
          name: regionData.name,
        },
        display_types: {
          id: displayTypeData.id,
          name: displayTypeData.name,
        },
      };

      return NextResponse.json({
        success: true,
        data: responseData,
      });
    }

    if (action === 'getAll') {
      // 모든 계좌번호 정보 가져오기
      const { data, error } = await supabase.from('bank_info').select(`
          id,
          bank_name,
          account_number,
          depositor,
          region_gu_id,
          display_type_id
        `);

      if (error) {
        console.error('Error fetching all bank info:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to fetch bank info' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: data || [],
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action parameter' },
      { status: 400 }
    );
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
