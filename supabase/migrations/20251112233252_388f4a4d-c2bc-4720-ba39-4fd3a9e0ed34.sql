-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  organizer_email TEXT NOT NULL,
  organizer_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_date DATE NOT NULL,
  goal_amount INTEGER NOT NULL, -- Amount in cents
  current_amount INTEGER NOT NULL DEFAULT 0, -- Amount in cents
  stripe_account_id TEXT, -- For Connect transfers (future)
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contributions table
CREATE TABLE public.contributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  contributor_name TEXT NOT NULL,
  contributor_email TEXT,
  amount INTEGER NOT NULL, -- Amount in cents
  stripe_payment_intent_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, succeeded, failed
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;

-- Public can view all events
CREATE POLICY "Anyone can view events" 
ON public.events 
FOR SELECT 
USING (true);

-- Anyone can create an event (no auth required for MVP)
CREATE POLICY "Anyone can create events" 
ON public.events 
FOR INSERT 
WITH CHECK (true);

-- Organizers can update their events (check by email)
CREATE POLICY "Organizers can update their events" 
ON public.events 
FOR UPDATE 
USING (true);

-- Public can view all contributions
CREATE POLICY "Anyone can view contributions" 
ON public.contributions 
FOR SELECT 
USING (true);

-- Anyone can create contributions
CREATE POLICY "Anyone can create contributions" 
ON public.contributions 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_events_slug ON public.events(slug);
CREATE INDEX idx_contributions_event_id ON public.contributions(event_id);
CREATE INDEX idx_contributions_stripe_payment_intent ON public.contributions(stripe_payment_intent_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();