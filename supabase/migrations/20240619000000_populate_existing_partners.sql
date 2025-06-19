-- =====================================================================
-- Seed partners table for ALL existing partner profiles
-- using current Auth / profiles data only (idempotent)
-- =====================================================================

-- Ensure extra partner-specific columns exist (runs safely multiple times)
ALTER TABLE IF EXISTS public.partners
    ADD COLUMN IF NOT EXISTS payment_methods TEXT[],
    ADD COLUMN IF NOT EXISTS has_pos_machine BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS accepts_proxy_payment BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS image_gallery TEXT[],
    ADD COLUMN IF NOT EXISTS contact_person TEXT,
    ADD COLUMN IF NOT EXISTS contact_phone TEXT;

-- ---------------------------------------------------------------------
-- Step 1.  Insert a row into public.partners for EVERY profile with role
--          = 'partner' that does NOT yet have a matching partner row.
--          Give sensible defaults.
-- ---------------------------------------------------------------------
INSERT INTO public.partners (id,
                             location,
                             working_hours,
                             location_pic_url,
                             is_facility)
SELECT p.id,
       COALESCE(p.full_name, 'Unknown location'), -- simple placeholder
       /* generic working-hours JSON encoded as text */
       '{"Mon":"08:00-20:00","Tue":"08:00-20:00","Wed":"08:00-20:00","Thu":"08:00-20:00","Fri":"08:00-20:00","Sat":"09:00-18:00","Sun":"Closed"}',
       '/tentPlacesnOthersRes1x/ethiopia0314_coverimage.webp',
       FALSE
FROM public.profiles p
LEFT JOIN public.partners pr ON pr.id = p.id
WHERE p.role = 'partner'
  AND pr.id IS NULL; -- only if partner row missing

-- ---------------------------------------------------------------------
-- Step 2.  Enrich ALL partner rows (existing + newly inserted) with
--          default payment methods, POS settings and a deterministic
--          1-to-3 image gallery so the script remains idempotent.
-- ---------------------------------------------------------------------
WITH img_pool AS (
  SELECT ARRAY[
           '/tentPlacesnOthersRes1x/el-Kinze.jpg',
           '/tentPlacesnOthersRes1x/jolly-restaurant-addis-ababa-ethiopia-horn-of-africa-east-africa-africa-F72FDB.jpg',
           '/tentPlacesnOthersRes1x/kaldi-s-coffee-shop.jpg',
           '/tentPlacesnOthersRes1x/photo0jpg.jpg',
           '/tentPlacesnOthersRes1x/getlstd-property-photo.jpg',
           '/tentPlacesnOthersRes1x/ethiopia0314_coverimage.webp'
         ] AS imgs
)
UPDATE public.partners pr
   SET payment_methods       = COALESCE(pr.payment_methods, ARRAY['Cash','Telebirr','CBE Birr']),
       has_pos_machine       = COALESCE(pr.has_pos_machine, TRUE),
       accepts_proxy_payment = COALESCE(pr.accepts_proxy_payment, TRUE),
       -- Assign a deterministic but varied image gallery (id-based hash)
       image_gallery         = COALESCE(pr.image_gallery,
                               (SELECT ARRAY[imgs[((('x'||substr(md5(pr.id::text),1,8))::bit(32)::int % array_length(imgs,1))+1)]]
                                FROM img_pool)),
       contact_person        = COALESCE(pr.contact_person, p.full_name),
       contact_phone         = COALESCE(pr.contact_phone, p.phone_number),
       updated_at            = NOW()
FROM public.profiles p, img_pool
WHERE pr.id = p.id
  AND p.role = 'partner';

-- ---------------------------------------------------------------------
-- Result: every existing partner profile now has a partner row with
--         basic but complete operational data.  Running this script
--         again will NOT create duplicates and will only fill
--         previously-null columns.
-- --------------------------------------------------------------------- 