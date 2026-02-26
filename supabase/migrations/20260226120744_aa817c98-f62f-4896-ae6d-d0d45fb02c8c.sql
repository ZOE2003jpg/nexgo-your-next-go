
-- Seed restaurants owned by vendor
INSERT INTO public.restaurants (name, cuisine, rating, delivery_time, image, tag, price_range, owner_id, is_open) VALUES
  ('The Golden Spoon', 'Nigerian', 4.8, '20-30 min', '🍲', 'Popular', '₦1,200–₦3,500', 'c3267ffb-9635-4805-8667-7cff4c51df8f', true),
  ('Campus Bites', 'Continental', 4.5, '15-25 min', '🍔', 'Fast', '₦800–₦2,000', 'c3267ffb-9635-4805-8667-7cff4c51df8f', true),
  ('Noodle Haven', 'Asian', 4.7, '25-35 min', '🍜', 'Trending', '₦1,500–₦4,000', 'c3267ffb-9635-4805-8667-7cff4c51df8f', true),
  ('Suya Stop', 'Local', 4.9, '10-20 min', '🔥', 'Best Seller', '₦500–₦1,800', 'c3267ffb-9635-4805-8667-7cff4c51df8f', true);

-- Seed trip routes
INSERT INTO public.trip_routes (from_location, to_location, price, seats_available, next_departure, active) VALUES
  ('Main Gate', 'Faculty of Engineering', 150, 14, '5 min', true),
  ('Hostel D', 'SUB', 100, 8, '12 min', true),
  ('Admin Block', 'Sports Complex', 120, 6, '3 min', true);
