
-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  ward TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles select own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Profiles insert own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Profiles update own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- updated_at trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END; $$;

CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, email, ward, address)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'ward', ''),
    COALESCE(NEW.raw_user_meta_data->>'address', '')
  );
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Tanker requests
CREATE TABLE public.tanker_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quantity_liters INTEGER NOT NULL,
  location TEXT NOT NULL,
  landmark TEXT NOT NULL DEFAULT '',
  delivery_date DATE NOT NULL,
  delivery_time TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  driver_name TEXT NOT NULL DEFAULT 'Ravi Kumar',
  driver_phone TEXT NOT NULL DEFAULT '+91 98800 12345',
  vehicle_number TEXT NOT NULL DEFAULT 'KA-01-AB-1234',
  eta_minutes INTEGER NOT NULL DEFAULT 45,
  price INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tanker_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tanker select own" ON public.tanker_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Tanker insert own" ON public.tanker_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Tanker update own" ON public.tanker_requests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Tanker delete own" ON public.tanker_requests FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER tanker_set_updated_at BEFORE UPDATE ON public.tanker_requests
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Leakage reports
CREATE TABLE public.leakage_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  location TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'reported',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.leakage_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leak select own" ON public.leakage_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Leak insert own" ON public.leakage_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Leak update own" ON public.leakage_reports FOR UPDATE USING (auth.uid() = user_id);
CREATE TRIGGER leak_set_updated_at BEFORE UPDATE ON public.leakage_reports
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Notifications (per-user)
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Notif select own" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Notif insert own" ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Notif update own" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Notif delete own" ON public.notifications FOR DELETE USING (auth.uid() = user_id);

-- Seed welcome notifications via trigger
CREATE OR REPLACE FUNCTION public.seed_welcome_notifications()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type) VALUES
    (NEW.id, 'Welcome to JalaMitra', 'Track water levels, book tankers and report leaks — all in one place.', 'info'),
    (NEW.id, 'Reservoir update', 'Cauvery reservoir is at 64% — supply expected to remain stable this week.', 'water'),
    (NEW.id, 'Shortage alert', 'Moderate shortage forecast for your ward in 3 days. Book tankers early.', 'alert');
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created_notifs
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.seed_welcome_notifications();
