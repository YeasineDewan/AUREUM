
-- Reviews table for product detail pages
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  user_id uuid DEFAULT NULL,
  author_name text NOT NULL DEFAULT 'Anonymous',
  rating integer NOT NULL DEFAULT 5,
  title text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  verified_purchase boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create reviews" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
