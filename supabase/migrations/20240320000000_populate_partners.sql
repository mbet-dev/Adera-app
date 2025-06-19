-- ============================================
-- Enrich partner data with payment methods, POS flags,
-- working hours and image galleries (idempotent)
-- ============================================

-- 1) Ensure new columns exist -------------------------------------------------
ALTER TABLE IF EXISTS public.partners
    ADD COLUMN IF NOT EXISTS payment_methods TEXT[],
    ADD COLUMN IF NOT EXISTS has_pos_machine BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS accepts_proxy_payment BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS image_gallery TEXT[],
    ADD COLUMN IF NOT EXISTS contact_person TEXT,
    ADD COLUMN IF NOT EXISTS contact_phone TEXT;

-- 2) Seed / update partner rows ----------------------------------------------
DO $$
DECLARE
  v_partner RECORD;
  profile_id UUID;
BEGIN
  FOR v_partner IN
    SELECT * FROM (
      VALUES
        ('+251911234567'::text,                               -- phone_number (lookup key)
         'Regina Cafe',
         'Bole Road, Addis Ababa',
         'Abebe Kebede', '+251911234567',
         ARRAY['Cash','CBE Birr','Telebirr','Credit Card'],
         TRUE, TRUE,
         jsonb_build_object(
           'Mon','8:00 AM - 10:00 PM','Tue','8:00 AM - 10:00 PM',
           'Wed','8:00 AM - 10:00 PM','Thu','8:00 AM - 10:00 PM',
           'Fri','8:00 AM - 11:00 PM','Sat','9:00 AM - 11:00 PM',
           'Sun','9:00 AM - 9:00 PM'),
         ARRAY[
           '/tentPlacesnOthersRes1x/regina-cafe-on-face.jpg',
           '/tentPlacesnOthersRes1x/jolly-restaurant-addis-ababa-ethiopia-horn-of-africa-east-africa-africa-F72FDB.jpg'
         ]
        ),
        ('+251922345678','Kaldi''s Coffee',
         'Meskel Square, Addis Ababa',
         'Sara Haile','+251922345678',
         ARRAY['Cash','CBE Birr','Telebirr'],
         TRUE,FALSE,
         jsonb_build_object(
           'Mon','7:00 AM - 9:00 PM','Tue','7:00 AM - 9:00 PM',
           'Wed','7:00 AM - 9:00 PM','Thu','7:00 AM - 9:00 PM',
           'Fri','7:00 AM - 10:00 PM','Sat','8:00 AM - 10:00 PM',
           'Sun','8:00 AM - 8:00 PM'),
         ARRAY[
           '/tentPlacesnOthersRes1x/kaldi-s-coffee-shop.jpg',
           '/tentPlacesnOthersRes1x/coffee-shop-piazza-addis-ababa-ethiopia-JA9H44.jpg'
         ]
        ),
        ('+251933456789','El-Kinze Restaurant',
         'Piazza, Addis Ababa',
         'Mohammed Ahmed','+251933456789',
         ARRAY['Cash','Telebirr','Credit Card'],
         TRUE,TRUE,
         jsonb_build_object(
           'Mon','10:00 AM - 10:00 PM','Tue','10:00 AM - 10:00 PM',
           'Wed','10:00 AM - 10:00 PM','Thu','10:00 AM - 10:00 PM',
           'Fri','10:00 AM - 11:00 PM','Sat','11:00 AM - 11:00 PM',
           'Sun','11:00 AM - 9:00 PM'),
         ARRAY[
           '/tentPlacesnOthersRes1x/el-Kinze.jpg',
           '/tentPlacesnOthersRes1x/photo0jpg.jpg',
           '/tentPlacesnOthersRes1x/getlstd-property-photo.jpg'
         ]
        ),
        ('+251944567890','Jolly Restaurant',
         'Bole Medhanialem, Addis Ababa',
         'Tigist Bekele','+251944567890',
         ARRAY['Cash','CBE Birr','Telebirr','Credit Card','Amole'],
         TRUE,TRUE,
         jsonb_build_object(
           'Mon','9:00 AM - 11:00 PM','Tue','9:00 AM - 11:00 PM',
           'Wed','9:00 AM - 11:00 PM','Thu','9:00 AM - 11:00 PM',
           'Fri','9:00 AM - 12:00 AM','Sat','10:00 AM - 12:00 AM',
           'Sun','10:00 AM - 10:00 PM'),
         ARRAY[
           '/tentPlacesnOthersRes1x/jolly-restaurant-addis-ababa-ethiopia-horn-of-africa-east-africa-africa-F72FDB.jpg',
           '/tentPlacesnOthersRes1x/ethiopia0314_coverimage.webp',
           '/tentPlacesnOthersRes1x/depositphotos_63088941-stock-photo-street-scene-in-addis-ababa.jpg'
         ]
        )
    ) AS t(
      phone_number,
      full_name,
      location,
      contact_person,
      contact_phone,
      payment_methods,
      has_pos,
      accepts_proxy,
      working_hours,
      image_gallery
    )
  LOOP
    -- 2a) Find matching profile id -------------------------------------------
    SELECT p.id INTO profile_id
    FROM public.profiles p
    WHERE p.phone_number = v_partner.phone_number;

    IF profile_id IS NULL THEN
      RAISE NOTICE 'Skipping %, no profile found', v_partner.full_name;
      CONTINUE;
    END IF;

    -- 2b) Insert or update partners row ---------------------------------------
    INSERT INTO public.partners (id, location, working_hours, location_pic_url, is_facility)
    VALUES (profile_id, v_partner.location, v_partner.working_hours::text, v_partner.image_gallery[1], FALSE)
    ON CONFLICT (id) DO UPDATE
      SET location        = EXCLUDED.location,
          working_hours   = EXCLUDED.working_hours,
          location_pic_url= EXCLUDED.location_pic_url,
          updated_at      = NOW();

    -- 2c) Update extended partner columns ------------------------------------
    UPDATE public.partners
       SET payment_methods       = v_partner.payment_methods,
           has_pos_machine       = v_partner.has_pos,
           accepts_proxy_payment = v_partner.accepts_proxy,
           image_gallery         = v_partner.image_gallery,
           contact_person        = v_partner.contact_person,
           contact_phone         = v_partner.contact_phone,
           updated_at            = NOW()
     WHERE id = profile_id;
  END LOOP;
END $$; 