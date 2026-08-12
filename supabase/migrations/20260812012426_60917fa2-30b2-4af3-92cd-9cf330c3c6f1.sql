
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  phone text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE TABLE public.businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Panadería',
  city text NOT NULL DEFAULT 'Quito',
  address text NOT NULL DEFAULT '',
  phone text,
  logo_url text,
  accepted_terms boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX businesses_owner_unique ON public.businesses(owner_id);
GRANT SELECT, INSERT, UPDATE ON public.businesses TO authenticated;
GRANT SELECT ON public.businesses TO anon;
GRANT ALL ON public.businesses TO service_role;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "businesses public read" ON public.businesses FOR SELECT USING (true);
CREATE POLICY "businesses owner insert" ON public.businesses FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "businesses owner update" ON public.businesses FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

CREATE TABLE public.packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  image_url text,
  original_price numeric(10,2) NOT NULL CHECK (original_price > 0),
  price numeric(10,2) NOT NULL CHECK (price > 0),
  quantity_total integer NOT NULL CHECK (quantity_total > 0 AND quantity_total <= 100),
  quantity_left integer NOT NULL CHECK (quantity_left >= 0),
  available_date date NOT NULL DEFAULT (now() AT TIME ZONE 'America/Guayaquil')::date,
  pickup_start time NOT NULL DEFAULT '18:00',
  pickup_end time NOT NULL DEFAULT '20:00',
  quality_confirmed boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT price_below_original CHECK (price < original_price)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.packages TO authenticated;
GRANT SELECT ON public.packages TO anon;
GRANT ALL ON public.packages TO service_role;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "packages public read" ON public.packages FOR SELECT USING (true);
CREATE POLICY "packages owner write" ON public.packages FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = packages.business_id AND b.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = packages.business_id AND b.owner_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.enforce_daily_package_limit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE total integer;
BEGIN
  SELECT COALESCE(SUM(quantity_total), 0) INTO total
  FROM public.packages
  WHERE business_id = NEW.business_id
    AND available_date = NEW.available_date
    AND id <> NEW.id;
  IF total + NEW.quantity_total > 100 THEN
    RAISE EXCEPTION 'Límite superado: máximo 100 paquetes por día por negocio (ya tienes % publicados para esa fecha)', total;
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER packages_daily_limit BEFORE INSERT OR UPDATE ON public.packages
FOR EACH ROW EXECUTE FUNCTION public.enforce_daily_package_limit();

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL DEFAULT upper(substr(replace(gen_random_uuid()::text,'-',''),1,6)),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id uuid NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price numeric(10,2) NOT NULL,
  total numeric(10,2) NOT NULL,
  commission numeric(10,2) NOT NULL,
  payment_method text NOT NULL DEFAULT 'card',
  card_last4 text,
  status text NOT NULL DEFAULT 'paid' CHECK (status IN ('paid','collected','cancelled_by_store')),
  cancelled_at timestamptz,
  cancel_reason text,
  commission_charged boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders customer read" ON public.orders FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "orders customer insert" ON public.orders FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "orders business read" ON public.orders FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = orders.business_id AND b.owner_id = auth.uid()));
CREATE POLICY "orders business update" ON public.orders FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = orders.business_id AND b.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = orders.business_id AND b.owner_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.place_order(_package_id uuid, _quantity integer, _card_last4 text)
RETURNS public.orders LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE p public.packages; o public.orders;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Debes iniciar sesión'; END IF;
  SELECT * INTO p FROM public.packages WHERE id = _package_id FOR UPDATE;
  IF NOT FOUND OR NOT p.active THEN RAISE EXCEPTION 'Paquete no disponible'; END IF;
  IF p.quantity_left < _quantity THEN RAISE EXCEPTION 'No quedan suficientes paquetes'; END IF;
  UPDATE public.packages SET quantity_left = quantity_left - _quantity WHERE id = p.id;
  INSERT INTO public.orders (user_id, package_id, business_id, quantity, unit_price, total, commission, card_last4)
  VALUES (auth.uid(), p.id, p.business_id, _quantity, p.price, p.price * _quantity, round(p.price * _quantity * 0.10, 2), _card_last4)
  RETURNING * INTO o;
  RETURN o;
END; $$;
GRANT EXECUTE ON FUNCTION public.place_order(uuid, integer, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE POLICY "paquetes public read" ON storage.objects FOR SELECT USING (bucket_id = 'paquetes');
CREATE POLICY "paquetes auth upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'paquetes');
CREATE POLICY "paquetes auth update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'paquetes');
