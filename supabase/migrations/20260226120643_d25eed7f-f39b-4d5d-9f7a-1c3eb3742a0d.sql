
-- Fix profiles: drop restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Fix dispatches: drop restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Students view own dispatches" ON public.dispatches;
DROP POLICY IF EXISTS "Students create dispatches" ON public.dispatches;
DROP POLICY IF EXISTS "Riders view assigned dispatches" ON public.dispatches;
DROP POLICY IF EXISTS "Riders update assigned dispatches" ON public.dispatches;
DROP POLICY IF EXISTS "Admins view all dispatches" ON public.dispatches;

CREATE POLICY "Students view own dispatches" ON public.dispatches FOR SELECT TO authenticated USING (auth.uid() = student_id);
CREATE POLICY "Students create dispatches" ON public.dispatches FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Riders view assigned dispatches" ON public.dispatches FOR SELECT TO authenticated USING (auth.uid() = rider_id);
CREATE POLICY "Riders update assigned dispatches" ON public.dispatches FOR UPDATE TO authenticated USING (auth.uid() = rider_id);
CREATE POLICY "Admins view all dispatches" ON public.dispatches FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Fix all other tables with restrictive policies too
-- menu_items
DROP POLICY IF EXISTS "Anyone can view menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Vendors can delete menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Vendors can insert menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Vendors can update menu items" ON public.menu_items;

CREATE POLICY "Anyone can view menu items" ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "Vendors can delete menu items" ON public.menu_items FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = menu_items.restaurant_id AND restaurants.owner_id = auth.uid()));
CREATE POLICY "Vendors can insert menu items" ON public.menu_items FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = menu_items.restaurant_id AND restaurants.owner_id = auth.uid()));
CREATE POLICY "Vendors can update menu items" ON public.menu_items FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = menu_items.restaurant_id AND restaurants.owner_id = auth.uid()));

-- order_items
DROP POLICY IF EXISTS "Users insert order items" ON public.order_items;
DROP POLICY IF EXISTS "Users view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Vendors view order items" ON public.order_items;

CREATE POLICY "Users insert order items" ON public.order_items FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.student_id = auth.uid()));
CREATE POLICY "Users view own order items" ON public.order_items FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND (orders.student_id = auth.uid() OR orders.rider_id = auth.uid())));
CREATE POLICY "Vendors view order items" ON public.order_items FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM orders o JOIN restaurants r ON r.id = o.restaurant_id WHERE o.id = order_items.order_id AND r.owner_id = auth.uid()));

-- orders
DROP POLICY IF EXISTS "Admins view all orders" ON public.orders;
DROP POLICY IF EXISTS "Riders update assigned orders" ON public.orders;
DROP POLICY IF EXISTS "Riders view assigned orders" ON public.orders;
DROP POLICY IF EXISTS "Students create orders" ON public.orders;
DROP POLICY IF EXISTS "Students view own orders" ON public.orders;
DROP POLICY IF EXISTS "Vendors update restaurant orders" ON public.orders;
DROP POLICY IF EXISTS "Vendors view restaurant orders" ON public.orders;

CREATE POLICY "Admins view all orders" ON public.orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Riders update assigned orders" ON public.orders FOR UPDATE TO authenticated USING (auth.uid() = rider_id);
CREATE POLICY "Riders view assigned orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = rider_id);
CREATE POLICY "Students create orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Students view own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = student_id);
CREATE POLICY "Vendors update restaurant orders" ON public.orders FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = orders.restaurant_id AND restaurants.owner_id = auth.uid()));
CREATE POLICY "Vendors view restaurant orders" ON public.orders FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = orders.restaurant_id AND restaurants.owner_id = auth.uid()));

-- restaurants
DROP POLICY IF EXISTS "Anyone can view restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Vendors can delete restaurant" ON public.restaurants;
DROP POLICY IF EXISTS "Vendors can insert restaurant" ON public.restaurants;
DROP POLICY IF EXISTS "Vendors can update restaurant" ON public.restaurants;

CREATE POLICY "Anyone can view restaurants" ON public.restaurants FOR SELECT USING (true);
CREATE POLICY "Vendors can delete restaurant" ON public.restaurants FOR DELETE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Vendors can insert restaurant" ON public.restaurants FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Vendors can update restaurant" ON public.restaurants FOR UPDATE TO authenticated USING (auth.uid() = owner_id);

-- trip_bookings
DROP POLICY IF EXISTS "Students create bookings" ON public.trip_bookings;
DROP POLICY IF EXISTS "Students view own bookings" ON public.trip_bookings;

CREATE POLICY "Students create bookings" ON public.trip_bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Students view own bookings" ON public.trip_bookings FOR SELECT TO authenticated USING (auth.uid() = student_id);

-- trip_routes
DROP POLICY IF EXISTS "Admins can delete routes" ON public.trip_routes;
DROP POLICY IF EXISTS "Admins can insert routes" ON public.trip_routes;
DROP POLICY IF EXISTS "Admins can update routes" ON public.trip_routes;
DROP POLICY IF EXISTS "Anyone can view routes" ON public.trip_routes;

CREATE POLICY "Admins can delete routes" ON public.trip_routes FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert routes" ON public.trip_routes FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update routes" ON public.trip_routes FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can view routes" ON public.trip_routes FOR SELECT USING (true);

-- user_roles
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- wallet_transactions
DROP POLICY IF EXISTS "Users insert own transactions" ON public.wallet_transactions;
DROP POLICY IF EXISTS "Users view own transactions" ON public.wallet_transactions;

CREATE POLICY "Users insert own transactions" ON public.wallet_transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users view own transactions" ON public.wallet_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- wallets
DROP POLICY IF EXISTS "Users update own wallet" ON public.wallets;
DROP POLICY IF EXISTS "Users view own wallet" ON public.wallets;

CREATE POLICY "Users update own wallet" ON public.wallets FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users view own wallet" ON public.wallets FOR SELECT TO authenticated USING (auth.uid() = user_id);
