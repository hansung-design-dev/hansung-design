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
      // 활성화된 구의 로고 정보 가져오기
      const { data, error } = await supabase
        .from('region_gu')
        .select('id, name, logo_image_url')
        .eq('is_active', true)
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
      console.log(
        '🔍 🔍 🔍 API - Fetching district data for:',
        districtName,
        'displayType:',
        displayType
      );
      // 특정 구의 전체 정보 가져오기 (로고 + 계좌번호 + 전화번호)
      const { data: regionData, error: regionError } = await supabase
        .from('region_gu')
        .select('id, name, code, logo_image_url, phone_number')
        .eq('name', districtName)
        .limit(1)
        .single();

      console.log('🔍 🔍 🔍 API - Region data result:', regionData);
      console.log('🔍 🔍 🔍 API - Region error:', regionError);

      if (regionError) {
        console.error('Error fetching region data:', regionError);
        return NextResponse.json(
          { success: false, error: 'Failed to fetch region data' },
          { status: 500 }
        );
      }

      // displayType이 있으면 계좌번호 정보도 함께 가져오기
      let bankData = null;
      if (displayType) {
        console.log('🔍 🔍 🔍 API - Looking for display type:', displayType);

        // LED 전자게시대의 경우 led_display_cache 테이블에서 계좌정보 가져오기
        if (displayType === 'led_display') {
          console.log(
            '🔍 🔍 🔍 API - LED display detected, checking cache table'
          );

          const { data: cacheData, error: cacheError } = await supabase
            .from('led_display_cache')
            .select('bank_name, account_number, depositor')
            .eq('region_name', regionData.name)
            .limit(1)
            .single();

          console.log('🔍 🔍 🔍 API - Cache data result:', cacheData);
          console.log('🔍 🔍 🔍 API - Cache error:', cacheError);

          if (!cacheError && cacheData && cacheData.bank_name) {
            bankData = {
              id: `cache-${regionData.id}`,
              bank_name: cacheData.bank_name,
              account_number: cacheData.account_number,
              depositor: cacheData.depositor,
              region_gu: {
                id: regionData.id,
                name: regionData.name,
              },
              display_types: {
                id: '3119f6ed-81e4-4d62-b785-6a33bc7928f9', // LED display type ID
                name: 'led_display',
              },
            };
            console.log(
              '🔍 🔍 🔍 API - Created bank data from cache:',
              bankData
            );
          } else {
            console.log('🔍 🔍 🔍 API - No cache data found for LED display');
          }
        } else {
          // 기존 로직: bank_accounts 테이블에서 계좌정보 가져오기
          const { data: displayTypeData, error: displayTypeError } =
            await supabase
              .from('display_types')
              .select('id, name')
              .eq('name', displayType)
              .single();

          console.log('🔍 🔍 🔍 API - Display type result:', displayTypeData);
          console.log('🔍 🔍 🔍 API - Display type error:', displayTypeError);

          if (!displayTypeError) {
            console.log(
              '🔍 🔍 🔍 API - Looking for bank account with region_gu_id:',
              regionData.id,
              'display_type_id:',
              displayTypeData.id
            );

            const { data: bankAccountData, error: bankError } = await supabase
              .from('bank_accounts')
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
              .limit(1)
              .single();

            console.log('🔍 🔍 🔍 API - Bank account result:', bankAccountData);
            console.log('🔍 🔍 🔍 API - Bank account error:', bankError);

            if (!bankError && bankAccountData) {
              bankData = {
                id: bankAccountData.id,
                bank_name: bankAccountData.bank_name,
                account_number: bankAccountData.account_number,
                depositor: bankAccountData.depositor,
                region_gu: {
                  id: regionData.id,
                  name: regionData.name,
                },
                display_types: {
                  id: displayTypeData.id,
                  name: displayTypeData.name,
                },
              };
              console.log('🔍 🔍 🔍 API - Created bank data:', bankData);
            } else {
              console.log(
                '🔍 🔍 🔍 API - No bank account found or error occurred'
              );

              // 디버깅을 위해 해당 구의 모든 bank_accounts 확인
              const { data: allBankAccounts, error: allBankError } =
                await supabase
                  .from('bank_accounts')
                  .select('*')
                  .eq('region_gu_id', regionData.id);

              console.log(
                '🔍 🔍 🔍 API - All bank accounts for this region:',
                allBankAccounts
              );
              console.log(
                '🔍 🔍 🔍 API - All bank accounts error:',
                allBankError
              );
            }
          } else {
            console.log('🔍 🔍 🔍 API - Display type not found');

            // 디버깅을 위해 모든 display_types 확인
            const { data: allDisplayTypes, error: allDisplayTypesError } =
              await supabase.from('display_types').select('*');

            console.log('🔍 🔍 🔍 API - All display types:', allDisplayTypes);
            console.log(
              '🔍 🔍 🔍 API - All display types error:',
              allDisplayTypesError
            );
          }
        }
      }

      // 상하반기별 마감수 정보 가져오기
      let halfPeriodData = null;
      if (displayType === 'banner_display' || displayType === 'led_display') {
        const { data: panelData, error: panelError } = await supabase
          .from('panels')
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
          halfPeriodData = {
            first_half_closure_quantity:
              panelData[0].first_half_closure_quantity || 0,
            second_half_closure_quantity:
              panelData[0].second_half_closure_quantity || 0,
          };
        }
      }

      const responseData = {
        ...regionData,
        bank_accounts: bankData,
        half_period_data: halfPeriodData,
      };

      return NextResponse.json({
        success: true,
        data: responseData,
      });
    }

    if (action === 'getPhoneNumber' && districtName) {
      // 특정 구의 전화번호 정보만 가져오기
      const { data: regionData, error: regionError } = await supabase
        .from('region_gu')
        .select('id, name, phone_number')
        .eq('name', districtName)
        .single();

      if (regionError) {
        console.error('Error fetching region_gu:', regionError);
        return NextResponse.json(
          { success: false, error: 'Region not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          id: regionData.id,
          name: regionData.name,
          phone_number: regionData.phone_number,
        },
      });
    }

    if (action === 'getAllPhoneNumbers') {
      // 모든 활성화된 구의 전화번호 정보 가져오기
      const { data, error } = await supabase
        .from('region_gu')
        .select('id, name, phone_number')
        .eq('is_active', true)
        .not('phone_number', 'is', null)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching phone numbers:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to fetch phone numbers' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: data || [],
      });
    }

    if (action === 'getBankData' && districtName && displayType) {
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
        .from('bank_accounts')
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
