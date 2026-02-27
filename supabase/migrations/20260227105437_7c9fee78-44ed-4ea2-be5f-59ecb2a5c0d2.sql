
-- =============================================
-- 1. FIX ALL RESTRICTIVE RLS POLICIES → PERMISSIVE
-- =============================================

-- DISPATCHES: Drop and recreate as PERMISSIVE
DROP POLICY IF EXISTS "Admins view all dispatches" ON dispatches;
DROP POLICY IF EXISTS "Riders update assigned dispatches" ON dispatches;
DROP POLICY IF EXISTS "Riders view assigned dispatches" ON dispatches;
DROP POLICY IF EXISTS "Students create dispatches" ON dispatches;
DROP POLICY IF EXISTS "Students view own dispatches" ON dispatches;

CREATE POLICY "Admins view all dispatches" ON dispatches FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Riders update assigned dispatches" ON dispatches FOR UPDATE TO authenticated USING (auth.uid() = rider_id);
CREATE POLICY "Riders view assigned dispatches" ON dispatches FOR SELECT TO authenticated USING (auth.uid() = rider_id);
CREATE POLICY "Students create dispatches" ON dispatches FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Students view own dispatches" ON dispatches FOR SELECT TO authenticated USING (auth.uid() = student_id);

-- MENU_ITEMS: Drop and recreate as PERMISSIVE
DROP POLICY IF EXISTS "Anyone can view menu items" ON menu_items;
DROP POLICY IF EXISTS "Vendors can delete menu items" ON menu_items;
DROP POLICY IF EXISTS "Vendors can insert menu items" ON menu_items;
DROP POLICY IF EXISTS "Vendors can update menu items" ON menu_items;

CREATE POLICY "Anyone can view menu items" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Vendors can delete menu items" ON menu_items FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = menu_items.restaurant_id AND restaurants.owner_id = auth.uid()));
CREATE POLICY "Vendors can insert menu items" ON menu_items FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = menu_items.restaurant_id AND restaurants.owner_id = auth.uid()));
CREATE POLICY "Vendors can update menu items" ON menu_items FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = menu_items.restaurant_id AND restaurants.owner_id = auth.uid()));

-- ORDER_ITEMS: Drop and recreate as PERMISSIVE
DROP POLICY IF EXISTS "Admins view all order items" ON order_items;
DROP POLICY IF EXISTS "Users insert order items" ON order_items;
DROP POLICY IF EXISTS "Users view own order items" ON order_items;
DROP POLICY IF EXISTS "Vendors view order items" ON order_items;

CREATE POLICY "Admins view all order items" ON order_items FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users insert order items" ON order_items FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.student_id = auth.uid()));
CREATE POLICY "Users view own order items" ON order_items FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND (orders.student_id = auth.uid() OR orders.rider_id = auth.uid())));
CREATE POLICY "Vendors view order items" ON order_items FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM orders o JOIN restaurants r ON r.id = o.restaurant_id WHERE o.id = order_items.order_id AND r.owner_id = auth.uid()));

-- ORDERS: Drop and recreate as PERMISSIVE
DROP POLICY IF EXISTS "Admins view all orders" ON orders;
DROP POLICY IF EXISTS "Riders update assigned orders" ON orders;
DROP POLICY IF EXISTS "Riders view assigned orders" ON orders;
DROP POLICY IF EXISTS "Students create orders" ON orders;
DROP POLICY IF EXISTS "Students update own orders" ON orders;
DROP POLICY IF EXISTS "Students view own orders" ON orders;
DROP POLICY IF EXISTS "Vendors update restaurant orders" ON orders;
DROP POLICY IF EXISTS "Vendors view restaurant orders" ON orders;

CREATE POLICY "Admins view all orders" ON orders FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Riders update assigned orders" ON orders FOR UPDATE TO authenticated USING (auth.uid() = rider_id);
CREATE POLICY "Riders view assigned orders" ON orders FOR SELECT TO authenticated USING (auth.uid() = rider_id);
CREATE POLICY "Students create orders" ON orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Students update own orders" ON orders FOR UPDATE TO authenticated USING (auth.uid() = student_id);
CREATE POLICY "Students view own orders" ON orders FOR SELECT TO authenticated USING (auth.uid() = student_id);
CREATE POLICY "Vendors update restaurant orders" ON orders FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = orders.restaurant_id AND restaurants.owner_id = auth.uid()));
CREATE POLICY "Vendors view restaurant orders" ON orders FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = orders.restaurant_id AND restaurants.owner_id = auth.uid()));

-- PLATFORM_SETTINGS: Drop and recreate as PERMISSIVE
DROP POLICY IF EXISTS "Admins can insert settings" ON platform_settings;
DROP POLICY IF EXISTS "Admins can update settings" ON platform_settings;
DROP POLICY IF EXISTS "Authenticated users can read settings" ON platform_settings;

CREATE POLICY "Admins can insert settings" ON platform_settings FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update settings" ON platform_settings FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated users can read settings" ON platform_settings FOR SELECT TO authenticated USING (true);

-- PROFILES: Drop and recreate as PERMISSIVE
DROP POLICY IF EXISTS "Admins view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

CREATE POLICY "Admins view all profiles" ON profiles FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);

-- RESTAURANTS: Drop and recreate as PERMISSIVE
DROP POLICY IF EXISTS "Anyone can view restaurants" ON restaurants;
DROP POLICY IF EXISTS "Vendors can delete restaurant" ON restaurants;
DROP POLICY IF EXISTS "Vendors can insert restaurant" ON restaurants;
DROP POLICY IF EXISTS "Vendors can update restaurant" ON restaurants;

CREATE POLICY "Anyone can view restaurants" ON restaurants FOR SELECT USING (true);
CREATE POLICY "Vendors can delete restaurant" ON restaurants FOR DELETE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Vendors can insert restaurant" ON restaurants FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Vendors can update restaurant" ON restaurants FOR UPDATE TO authenticated USING (auth.uid() = owner_id);

-- TRIP_BOOKINGS: Drop and recreate as PERMISSIVE
DROP POLICY IF EXISTS "Students create bookings" ON trip_bookings;
DROP POLICY IF EXISTS "Students view own bookings" ON trip_bookings;

CREATE POLICY "Students create bookings" ON trip_bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Students view own bookings" ON trip_bookings FOR SELECT TO authenticated USING (auth.uid() = student_id);

-- TRIP_ROUTES: Drop and recreate as PERMISSIVE
DROP POLICY IF EXISTS "Admins can delete routes" ON trip_routes;
DROP POLICY IF EXISTS "Admins can insert routes" ON trip_routes;
DROP POLICY IF EXISTS "Admins can update routes" ON trip_routes;
DROP POLICY IF EXISTS "Anyone can view routes" ON trip_routes;

CREATE POLICY "Admins can delete routes" ON trip_routes FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert routes" ON trip_routes FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update routes" ON trip_routes FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can view routes" ON trip_routes FOR SELECT USING (true);

-- USER_ROLES: Drop and recreate as PERMISSIVE
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON user_roles;

CREATE POLICY "Admins can view all roles" ON user_roles FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view own roles" ON user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- WALLET_TRANSACTIONS: Drop and recreate as PERMISSIVE
DROP POLICY IF EXISTS "Users insert own transactions" ON wallet_transactions;
DROP POLICY IF EXISTS "Users view own transactions" ON wallet_transactions;

CREATE POLICY "Users insert own transactions" ON wallet_transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users view own transactions" ON wallet_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- WALLETS: Drop and recreate as PERMISSIVE
DROP POLICY IF EXISTS "System can insert wallets" ON wallets;
DROP POLICY IF EXISTS "Users update own wallet" ON wallets;
DROP POLICY IF EXISTS "Users view own wallet" ON wallets;

CREATE POLICY "System can insert wallets" ON wallets FOR INSERT WITH CHECK (true);
CREATE POLICY "Users update own wallet" ON wallets FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users view own wallet" ON wallets FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- =============================================
-- 2. SERVER-SIDE WALLET FUNCTIONS
-- =============================================

-- Deduct wallet atomically with balance check
CREATE OR REPLACE FUNCTION public.deduct_wallet(_user_id uuid, _amount integer, _label text, _icon text DEFAULT '🍽️')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _wallet RECORD;
BEGIN
  IF _amount <= 0 THEN
    RETURN jsonb_build_object('success', false, 'message', 'Amount must be positive');
  END IF;

  SELECT id, balance INTO _wallet FROM wallets WHERE user_id = _user_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Wallet not found');
  END IF;

  IF _wallet.balance < _amount THEN
    RETURN jsonb_build_object('success', false, 'message', 'Insufficient balance', 'balance', _wallet.balance);
  END IF;

  UPDATE wallets SET balance = balance - _amount, updated_at = now() WHERE id = _wallet.id;
  INSERT INTO wallet_transactions (wallet_id, user_id, amount, label, icon)
  VALUES (_wallet.id, _user_id, -_amount, _label, _icon);

  RETURN jsonb_build_object('success', true, 'new_balance', _wallet.balance - _amount);
END;
$$;

-- Refund wallet for cancelled orders
CREATE OR REPLACE FUNCTION public.refund_order(_order_id uuid, _user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _order RECORD; _wallet RECORD; _refund_amount integer;
BEGIN
  SELECT * INTO _order FROM orders WHERE id = _order_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Order not found');
  END IF;

  IF _order.student_id != _user_id THEN
    RETURN jsonb_build_object('success', false, 'message', 'Not your order');
  END IF;

  IF _order.status NOT IN ('pending', 'Pending') THEN
    RETURN jsonb_build_object('success', false, 'message', 'Can only refund pending orders');
  END IF;

  IF _order.payment_method != 'wallet' THEN
    RETURN jsonb_build_object('success', true, 'message', 'No wallet payment to refund');
  END IF;

  _refund_amount := _order.total_amount;

  SELECT id, balance INTO _wallet FROM wallets WHERE user_id = _user_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Wallet not found');
  END IF;

  UPDATE wallets SET balance = balance + _refund_amount, updated_at = now() WHERE id = _wallet.id;
  INSERT INTO wallet_transactions (wallet_id, user_id, amount, label, icon)
  VALUES (_wallet.id, _user_id, _refund_amount, 'Refund ' || _order.order_number, '↩️');

  UPDATE orders SET status = 'cancelled', cancelled_by = _user_id, cancellation_reason = 'Cancelled by student' WHERE id = _order_id;

  RETURN jsonb_build_object('success', true, 'refunded', _refund_amount, 'new_balance', _wallet.balance + _refund_amount);
END;
$$;

-- Atomic rider acceptance (prevents double acceptance)
CREATE OR REPLACE FUNCTION public.accept_order_as_rider(_order_id uuid, _rider_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _order RECORD; _role app_role;
BEGIN
  SELECT role INTO _role FROM user_roles WHERE user_id = _rider_id LIMIT 1;
  IF _role != 'rider' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Not a rider');
  END IF;

  SELECT * INTO _order FROM orders WHERE id = _order_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Order not found');
  END IF;

  IF _order.status != 'ready' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Order not ready for pickup');
  END IF;

  IF _order.rider_id IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Order already assigned to another rider');
  END IF;

  UPDATE orders SET rider_id = _rider_id WHERE id = _order_id;
  RETURN jsonb_build_object('success', true, 'message', 'Order accepted');
END;
$$;

-- Top-up wallet (for demo/dev mode)
CREATE OR REPLACE FUNCTION public.topup_wallet(_user_id uuid, _amount integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _wallet RECORD;
BEGIN
  IF _amount <= 0 OR _amount > 1000000 THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid amount (1-1,000,000)');
  END IF;

  SELECT id, balance INTO _wallet FROM wallets WHERE user_id = _user_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Wallet not found');
  END IF;

  UPDATE wallets SET balance = balance + _amount, updated_at = now() WHERE id = _wallet.id;
  INSERT INTO wallet_transactions (wallet_id, user_id, amount, label, icon)
  VALUES (_wallet.id, _user_id, _amount, 'Wallet Top-up', '💳');

  RETURN jsonb_build_object('success', true, 'new_balance', _wallet.balance + _amount);
END;
$$;

-- =============================================
-- 3. INPUT VALIDATION CONSTRAINTS
-- =============================================

-- Orders: amount constraints
DO $$ BEGIN
  ALTER TABLE orders ADD CONSTRAINT orders_total_amount_positive CHECK (total_amount >= 0 AND total_amount < 10000000);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE orders ADD CONSTRAINT orders_delivery_fee_positive CHECK (delivery_fee >= 0 AND delivery_fee < 100000);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Wallet balance non-negative (may already exist)
DO $$ BEGIN
  ALTER TABLE wallets ADD CONSTRAINT wallets_balance_non_negative CHECK (balance >= 0);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Wallet transactions amount range
DO $$ BEGIN
  ALTER TABLE wallet_transactions ADD CONSTRAINT wallet_txn_amount_range CHECK (amount > -10000000 AND amount < 10000000);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Menu item price positive
DO $$ BEGIN
  ALTER TABLE menu_items ADD CONSTRAINT menu_items_price_positive CHECK (price > 0 AND price < 10000000);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Trip route price positive
DO $$ BEGIN
  ALTER TABLE trip_routes ADD CONSTRAINT trip_routes_price_positive CHECK (price > 0 AND price < 1000000);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Dispatch fee positive
DO $$ BEGIN
  ALTER TABLE dispatches ADD CONSTRAINT dispatches_fee_positive CHECK (fee > 0 AND fee < 1000000);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Unique payment reference (may already exist)
DO $$ BEGIN
  CREATE UNIQUE INDEX IF NOT EXISTS orders_payment_reference_unique ON orders (payment_reference) WHERE payment_reference IS NOT NULL;
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;
