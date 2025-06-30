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

    console.log('Region API called with:', {
      action,
      districtName,
      displayType,
    });

    if (action === 'getLogos') {
      // 모든 구의 로고 정보 가져오기
      const { data, error } = await supabase
        .from('region_gu')
        .select('id, name, logo_image_url')
        .not('logo_image_url', 'is', null);

      if (error) {
        console.error('Error fetching region logos:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to fetch region logos' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: data || [],
      });
    }

    if (action === 'getLogo' && districtName) {
      // 특정 구의 로고 정보 가져오기
      const { data, error } = await supabase
        .from('region_gu')
        .select('id, name, logo_image_url')
        .eq('name', districtName)
        .single();

      if (error) {
        console.error('Error fetching region logo:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to fetch region logo' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: data,
      });
    }

    if (action === 'getByDistrict' && districtName) {
      // 특정 구의 전체 정보 가져오기 (로고 + 계좌번호)
      const { data: regionData, error: regionError } = await supabase
        .from('region_gu')
        .select('id, name, code, logo_image_url')
        .eq('name', districtName)
        .single();

      if (regionError) {
        console.error('Error fetching region data:', regionError);
        return NextResponse.json(
          { success: false, error: 'Failed to fetch region data' },
          { status: 500 }
        );
      }

      // displayType이 있으면 계좌번호 정보도 함께 가져오기
      let bankInfo = null;
      if (displayType) {
        const { data: displayTypeData, error: displayTypeError } =
          await supabase
            .from('display_types')
            .select('id, name')
            .eq('name', displayType)
            .single();

        if (!displayTypeError) {
          const { data: bankData, error: bankError } = await supabase
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

          if (!bankError && bankData) {
            bankInfo = {
              id: bankData.id,
              bank_name: bankData.bank_name,
              account_number: bankData.account_number,
              depositor: bankData.depositor,
              region_gu: {
                id: regionData.id,
                name: regionData.name,
              },
              display_types: {
                id: displayTypeData.id,
                name: displayTypeData.name,
              },
            };
          }
        }
      }

      // 상하반기별 마감수 정보 가져오기
      let halfPeriodInfo = null;
      if (displayType === 'banner_display' || displayType === 'led_display') {
        const { data: panelData, error: panelError } = await supabase
          .from('panel_info')
          .select(
            `
            first_half_closure_quantity,
            second_half_closure_quantity
          `
          )
          .eq('region_gu_id', regionData.id)
          .eq(
            'display_type_id',
            (
              await supabase
                .from('display_types')
                .select('id')
                .eq('name', displayType)
                .single()
            ).data?.id
          )
          .limit(1);

        if (!panelError && panelData && panelData.length > 0) {
          halfPeriodInfo = {
            first_half_closure_quantity:
              panelData[0].first_half_closure_quantity || 0,
            second_half_closure_quantity:
              panelData[0].second_half_closure_quantity || 0,
          };
        }
      }

      const responseData = {
        ...regionData,
        bank_info: bankInfo,
        half_period_info: halfPeriodInfo,
      };

      return NextResponse.json({
        success: true,
        data: responseData,
      });
    }

    if (action === 'getBankInfo' && districtName && displayType) {
      // 계좌번호 정보만 가져오기 (기존 bank-info API 호환성)
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
