-- Created enums & tables for manual pricing/order inventory flow

CREATE TYPE reservation_status_enum AS ENUM (
  'reserved',
  'confirmed',
  'released',
  'cancelled'
);

CREATE TYPE procurement_status_enum AS ENUM (
  'pending',
  'ordered',
  'received',
  'failed'
);

CREATE TYPE inventory_type_enum AS ENUM (
  'led_display_inventory',
  'banner_slot_inventory',
  'top_fixed_banner_inventory',
  'digital_product_supply',
  'other'
);

CREATE TYPE fulfillment_status_enum AS ENUM (
  'pending',
  'supplier_confirmed',
  'delivered',
  'completed'
);

CREATE TYPE customer_inquiry_product_type_enum AS ENUM (
  'led',
  'top_fixed',
  'digital_media_product',
  'banner'
);

CREATE TABLE public.order_inventory_reservations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_detail_id uuid NOT NULL REFERENCES public.order_details(id),
  inventory_type inventory_type_enum DEFAULT 'other',
  inventory_id uuid,
  reserved_quantity integer NOT NULL DEFAULT 1,
  reservation_status reservation_status_enum DEFAULT 'reserved',
  inventory_snapshot jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.manual_pricing_lines (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id),
  order_detail_id uuid REFERENCES public.order_details(id),
  admin_profile_id uuid NOT NULL REFERENCES public.admin_profiles(id),
  payment_method_id uuid REFERENCES public.payment_methods(id),
  design_draft_id uuid REFERENCES public.design_drafts(id),
  base_price integer NOT NULL DEFAULT 0,
  advertising_fee integer DEFAULT 0,
  road_usage_fee integer DEFAULT 0,
  administrative_fee integer DEFAULT 0,
  platform_fee integer DEFAULT 0,
  admin_reduction integer DEFAULT 0,
  vat_rate numeric(5,2),
  vat_amount integer,
  total_price integer NOT NULL DEFAULT 0,
  balance_due integer DEFAULT 0,
  is_paid boolean DEFAULT false,
  status text DEFAULT 'pending',
  notes text,
  manual_entry_metadata jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT manual_pricing_lines_pkey PRIMARY KEY (id)
);

CREATE TABLE public.product_procurement_snapshots (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  pricing_line_id uuid NOT NULL REFERENCES public.manual_pricing_lines(id),
  product_type customer_inquiry_product_type_enum NOT NULL,
  product_reference_id uuid,
  inventory_type inventory_type_enum,
  inventory_id uuid,
  supplier_name text,
  supplier_order_reference text,
  procurement_status procurement_status_enum DEFAULT 'pending',
  procured_at timestamp with time zone,
  fulfillment_status fulfillment_status_enum DEFAULT 'pending',
  inventory_snapshot jsonb,
  created_at timestamp with time zone DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.sync_manual_pricing_order_status()
RETURNS trigger AS $$
BEGIN
  IF (NEW.status = 'confirmed' AND NEW.is_paid) THEN
    UPDATE public.orders
    SET payment_status = 'completed'
    WHERE id = NEW.order_id;
  ELSIF (NEW.status = 'cancelled') THEN
    UPDATE public.order_inventory_reservations
    SET reservation_status = 'released'
    WHERE order_detail_id = NEW.order_detail_id;
  ELSE
    UPDATE public.orders
    SET payment_status = 'waiting_admin_approval'
    WHERE id = NEW.order_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_manual_pricing_order_status
AFTER INSERT OR UPDATE ON public.manual_pricing_lines
FOR EACH ROW EXECUTE FUNCTION public.sync_manual_pricing_order_status();

CREATE OR REPLACE FUNCTION public.lock_inventory_reservation()
RETURNS trigger AS $$
BEGIN
  IF (NEW.inventory_type = 'led_display_inventory') THEN
    UPDATE public.led_display_inventory
    SET available_faces = GREATEST(available_faces - NEW.reserved_quantity, 0)
    WHERE id = NEW.inventory_id;
  ELSIF (NEW.inventory_type = 'banner_slot_inventory') THEN
    UPDATE public.banner_slot_inventory
    SET is_available = false
    WHERE id = NEW.inventory_id;
  ELSIF (NEW.inventory_type = 'top_fixed_banner_inventory') THEN
    UPDATE public.banner_slot_inventory
    SET is_available = false
    WHERE id = NEW.inventory_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_lock_inventory
AFTER INSERT OR UPDATE ON public.order_inventory_reservations
FOR EACH ROW WHEN (NEW.reservation_status = 'reserved')
EXECUTE FUNCTION public.lock_inventory_reservation();

