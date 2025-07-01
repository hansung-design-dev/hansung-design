DO $$
DECLARE
  region RECORD;
  display RECORD;
  month_offset INT;
  target_month TEXT;
  first_half_from DATE;
  first_half_to DATE;
  second_half_from DATE;
  second_half_to DATE;
BEGIN
  -- 이번달(0)과 다음달(1) 생성
  FOR month_offset IN 0..1 LOOP
    target_month := to_char((date_trunc('month', now()) + (month_offset * interval '1 month')), 'YYYY-MM');

    -- is_active인 구만 선택
    FOR region IN SELECT id, name FROM region_gu WHERE is_active = true LOOP
      -- display_types에서 name이 'banner_display'인 것만 선택
      FOR display IN SELECT id FROM display_types WHERE name = 'banner_display' LOOP

        IF region.name = '마포구' THEN
          first_half_from := to_date(target_month || '-05', 'YYYY-MM-DD');
          first_half_to := to_date(target_month || '-20', 'YYYY-MM-DD');
          second_half_from := to_date(target_month || '-21', 'YYYY-MM-DD');
          second_half_to := to_date(to_char((to_date(target_month || '-01', 'YYYY-MM-DD') + interval '1 month'), 'YYYY-MM') || '-04', 'YYYY-MM-DD');
        ELSE
          first_half_from := to_date(target_month || '-01', 'YYYY-MM-DD');
          first_half_to := to_date(target_month || '-15', 'YYYY-MM-DD');
          second_half_from := to_date(target_month || '-16', 'YYYY-MM-DD');
          second_half_to := (date_trunc('month', to_date(target_month || '-01', 'YYYY-MM-DD')) + interval '1 month - 1 day')::date;
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM region_gu_display_periods
          WHERE region_gu_id = region.id
            AND display_type_id = display.id
            AND year_month = target_month
        ) THEN
          INSERT INTO region_gu_display_periods (
            id,
            display_type_id,
            region_gu_id,
            first_half_from,
            first_half_to,
            first_half_closure_quantity,
            second_half_from,
            second_half_to,
            second_half_closure_quantity,
            created_at,
            updated_at,
            year_month
          ) VALUES (
            gen_random_uuid(),
            display.id,
            region.id,
            first_half_from,
            first_half_to,
            0,
            second_half_from,
            second_half_to,
            0,
            now(),
            now(),
            target_month
          );
        END IF;

      END LOOP;
    END LOOP;
  END LOOP;
END $$; 