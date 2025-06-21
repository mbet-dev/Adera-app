-- Update partners table to store images and working hours
ALTER TABLE partners
  ADD COLUMN IF NOT EXISTS images TEXT[],
  ADD COLUMN IF NOT EXISTS working_hours JSONB;

-- Update sample partner data
UPDATE partners p
SET 
  images = ARRAY[
    'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800',
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
    'https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=800'
  ],
  working_hours = jsonb_build_object(
    'monday', jsonb_build_object('open', '08:00', 'close', '20:00'),
    'tuesday', jsonb_build_object('open', '08:00', 'close', '20:00'),
    'wednesday', jsonb_build_object('open', '08:00', 'close', '20:00'),
    'thursday', jsonb_build_object('open', '08:00', 'close', '20:00'),
    'friday', jsonb_build_object('open', '08:00', 'close', '22:00'),
    'saturday', jsonb_build_object('open', '09:00', 'close', '22:00'),
    'sunday', jsonb_build_object('open', '10:00', 'close', '18:00')
  )
FROM profiles pf
WHERE p.id = pf.id 
AND pf.full_name ILIKE '%Coffee%';

UPDATE partners p
SET 
  images = ARRAY[
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
    'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=800'
  ],
  working_hours = jsonb_build_object(
    'monday', jsonb_build_object('open', '11:00', 'close', '23:00'),
    'tuesday', jsonb_build_object('open', '11:00', 'close', '23:00'),
    'wednesday', jsonb_build_object('open', '11:00', 'close', '23:00'),
    'thursday', jsonb_build_object('open', '11:00', 'close', '23:00'),
    'friday', jsonb_build_object('open', '11:00', 'close', '00:00'),
    'saturday', jsonb_build_object('open', '12:00', 'close', '00:00'),
    'sunday', jsonb_build_object('open', 'closed', 'close', 'closed')
  )
FROM profiles pf
WHERE p.id = pf.id 
AND pf.full_name ILIKE '%Restaurant%';

-- Default values for other partners
UPDATE partners p
SET 
  images = ARRAY[
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
    'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800'
  ],
  working_hours = jsonb_build_object(
    'monday', jsonb_build_object('open', '09:00', 'close', '18:00'),
    'tuesday', jsonb_build_object('open', '09:00', 'close', '18:00'),
    'wednesday', jsonb_build_object('open', '09:00', 'close', '18:00'),
    'thursday', jsonb_build_object('open', '09:00', 'close', '18:00'),
    'friday', jsonb_build_object('open', '09:00', 'close', '17:00'),
    'saturday', jsonb_build_object('open', '10:00', 'close', '16:00'),
    'sunday', jsonb_build_object('open', 'closed', 'close', 'closed')
  )
WHERE images IS NULL; 