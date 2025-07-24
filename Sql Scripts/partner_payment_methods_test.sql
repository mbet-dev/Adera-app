-- Example: Set some partners to accept all payment methods, others only a subset

-- Partner 1: Accept all
UPDATE public.partners SET accepted_payment_methods = ARRAY['cash_at_dropoff','wallet','mobile_banking','pos']::payment_method[] WHERE id = 'PARTNER_ID_1';

-- Partner 2: Accept only cash_at_dropoff and pos
UPDATE public.partners SET accepted_payment_methods = ARRAY['cash_at_dropoff','pos']::payment_method[] WHERE id = 'PARTNER_ID_2';

-- Partner 3: Accept only wallet and mobile_banking
UPDATE public.partners SET accepted_payment_methods = ARRAY['wallet','mobile_banking']::payment_method[] WHERE id = 'PARTNER_ID_3';

-- Partner 4: Accept only cash_at_dropoff
UPDATE public.partners SET accepted_payment_methods = ARRAY['cash_at_dropoff']::payment_method[] WHERE id = 'PARTNER_ID_4';

