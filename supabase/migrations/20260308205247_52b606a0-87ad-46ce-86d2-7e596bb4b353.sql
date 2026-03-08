
-- Chat configuration table (admin-controlled)
CREATE TABLE public.chat_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read chat config" ON public.chat_config FOR SELECT USING (true);
CREATE POLICY "All ops on chat_config" ON public.chat_config FOR ALL USING (true) WITH CHECK (true);

-- Insert default config
INSERT INTO public.chat_config (key, value) VALUES
('system_prompt', 'You are AUREUM''s luxury menswear AI assistant. You help customers with product recommendations, styling advice, fabric information, sizing guidance, appointment booking, and bespoke tailoring questions. Tone: Sophisticated, knowledgeable, warm but professional. Keep responses concise (2-4 sentences unless detailed info is requested). Currency is BDT (৳). The brand is AUREUM - premium bespoke menswear.'),
('greeting', 'Welcome to AUREUM. I''m your personal style advisor — ask me about fabrics, sizing, styling, or anything about our collection.'),
('enabled', 'true'),
('chat_name', 'AUREUM Style Advisor'),
('chat_subtitle', 'AI-powered • Always available'),
('suggested_questions', 'What suit fabrics do you recommend?|How do I book a fitting appointment?|What''s the difference between half-canvas and full-canvas?|Help me choose a wedding suit');

-- Knowledge base entries (admin can add/edit)
CREATE TABLE public.chat_knowledge (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_knowledge ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read enabled knowledge" ON public.chat_knowledge FOR SELECT USING (true);
CREATE POLICY "All ops on chat_knowledge" ON public.chat_knowledge FOR ALL USING (true) WITH CHECK (true);

-- Seed knowledge
INSERT INTO public.chat_knowledge (title, content, category) VALUES
('Fabrics Guide', 'AUREUM uses premium fabrics: Super 150s Italian Wool for suits (৳3,200+), Loro Piana wool for blazers (৳1,450+), Egyptian Cotton 140s for shirts (৳280+), Harris Tweed for heritage pieces (৳1,250+), Cashmere-Wool blends for overcoats (৳1,800+), Solbiati Linen for summer suits (৳2,200+), and Mongolian Cashmere for knitwear (৳380+).', 'products'),
('Sizing & Fit', 'We offer sizes 36-48 for suits and blazers, S-XXL for shirts and knitwear, 28-40 for trousers. Our AI Body Scanner provides precise measurements. For bespoke orders, we take 15+ measurements for a perfect fit. Alterations are complimentary on all bespoke orders.', 'sizing'),
('Bespoke Process', 'Our bespoke process: 1) Consultation & measurement (in-store or virtual), 2) Fabric selection from 500+ swatches, 3) Design customization (lapel, buttons, lining, monogram), 4) First fitting (2-3 weeks), 5) Final fitting & delivery. Total turnaround: 3-4 weeks. Starting at ৳3,200 for a 2-piece suit.', 'services'),
('Appointments', 'Book appointments at aureum.com/book. Types: Style Consultation (free, 30 min), Measurement Session (45 min), Fitting Appointment (30 min), Virtual Consultation (video call, 30 min). Available 7 days a week, 10 AM - 8 PM.', 'services'),
('Care Instructions', 'Suits: Dry clean only, store on wooden hangers, use garment bags for travel. Shirts: Machine wash cold, hang dry, iron on medium. Cashmere: Hand wash or dry clean, fold to store (never hang). Linen: Dry clean or cold wash, embrace natural wrinkles. All items: Avoid direct sunlight for storage.', 'care'),
('Shipping & Returns', 'Free standard shipping on orders over ৳1,500. Express delivery: 2-3 business days (৳200). International shipping available. 30-day return policy for ready-to-wear items. Bespoke items: exchange or alteration within 14 days.', 'policies');

-- Chat conversations log
CREATE TABLE public.chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT NULL,
  session_id text NOT NULL,
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'active',
  rating integer DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create conversations" ON public.chat_conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update own conversation" ON public.chat_conversations FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "All read conversations" ON public.chat_conversations FOR SELECT USING (true);
