-- ─────────────────────────────────────────────────────────────────────────
-- SoulSync Matrimony — Seed Data
-- Run AFTER schema.sql
-- ─────────────────────────────────────────────────────────────────────────

USE soulsync;

-- ── Users (passwords are BCrypt of "Test@1234") ───────────────────────────
INSERT INTO users (email, password_hash, role) VALUES
  ('ananya.sharma@email.com',  '$2a$12$K9zZmP2Yb.K1R1VVkXsTEe8Q2tJ3L5FWbm.dP0NTXnV1ePWgZm0Ea', 'USER'),
  ('rohan.mehta@email.com',    '$2a$12$K9zZmP2Yb.K1R1VVkXsTEe8Q2tJ3L5FWbm.dP0NTXnV1ePWgZm0Ea', 'USER'),
  ('priya.nair@email.com',     '$2a$12$K9zZmP2Yb.K1R1VVkXsTEe8Q2tJ3L5FWbm.dP0NTXnV1ePWgZm0Ea', 'USER'),
  ('arjun.kapoor@email.com',   '$2a$12$K9zZmP2Yb.K1R1VVkXsTEe8Q2tJ3L5FWbm.dP0NTXnV1ePWgZm0Ea', 'USER'),
  ('meera.krishnan@email.com', '$2a$12$K9zZmP2Yb.K1R1VVkXsTEe8Q2tJ3L5FWbm.dP0NTXnV1ePWgZm0Ea', 'USER'),
  ('kabir.singh@email.com',    '$2a$12$K9zZmP2Yb.K1R1VVkXsTEe8Q2tJ3L5FWbm.dP0NTXnV1ePWgZm0Ea', 'USER'),
  ('ishita.gupta@email.com',   '$2a$12$K9zZmP2Yb.K1R1VVkXsTEe8Q2tJ3L5FWbm.dP0NTXnV1ePWgZm0Ea', 'USER'),
  ('varun.malhotra@email.com', '$2a$12$K9zZmP2Yb.K1R1VVkXsTEe8Q2tJ3L5FWbm.dP0NTXnV1ePWgZm0Ea', 'USER'),
  ('sneha.agarwal@email.com',  '$2a$12$K9zZmP2Yb.K1R1VVkXsTEe8Q2tJ3L5FWbm.dP0NTXnV1ePWgZm0Ea', 'USER'),
  ('rahul.verma@email.com',    '$2a$12$K9zZmP2Yb.K1R1VVkXsTEe8Q2tJ3L5FWbm.dP0NTXnV1ePWgZm0Ea', 'USER');

-- ── Profiles ──────────────────────────────────────────────────────────────
INSERT INTO profiles (
  user_id, first_name, last_name, date_of_birth, gender,
  profession, city, state, country, religion,
  height, mother_tongue, dietary_preference, education, horoscope,
  bio, photo_url, is_verified, is_premium,
  interests, lifestyle, looking_for,
  looking_for_gender, age_min, age_max
) VALUES
(
  1, 'Ananya', 'Sharma', '1996-03-15', 'FEMALE',
  'Product Designer', 'Mumbai', 'Maharashtra', 'India', 'Hindu (Brahmin)',
  '5''6" (168cm)', 'Hindi, Marathi', 'Vegetarian', 'Masters in Design', 'Leo (Sun Sign)',
  'I''m a curious soul who finds joy in the intersection of technology and human emotion. By day, I design digital experiences that make life easier; by night, I''m usually found experimenting with fusion recipes in my kitchen or lost in a classic Murakami novel.\n\nGrowing up in a household that balanced tradition with modern values, I''ve learned to appreciate the quiet moments as much as the grand milestones.',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=85',
  1, 1,
  'UI/UX Design,Oil Painting,Architecture,Podcasts',
  'Yoga,Trekking,Early Bird,Travel Enthusiast',
  'Someone who values kindness and emotional intelligence\nA partner who enjoys deep conversations about life and philosophy\nA fellow travel enthusiast who loves off-the-beaten-path destinations',
  'MALE', 26, 34
),
(
  2, 'Rohan', 'Mehta', '1995-07-22', 'MALE',
  'Software Architect', 'Bangalore', 'Karnataka', 'India', 'Hindu',
  '5''11" (180cm)', 'Gujarati, Hindi', 'Non-Vegetarian', 'B.Tech Computer Science', 'Scorpio (Sun Sign)',
  'Tech enthusiast by profession, adventurer by heart. I love building things that matter — be it software products or weekend camping setups. I''m deeply family-oriented and believe in building a life that blends purpose with joy.',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=85',
  1, 1,
  'Hiking,Open Source,Photography,Rock Music',
  'Night Owl,Gym,Cooking,Weekend Hiker',
  'A partner who is equally ambitious yet grounded\nSomeone who appreciates silence as much as adventure\nKind, curious, and open-minded',
  'FEMALE', 24, 30
),
(
  3, 'Priya', 'Nair', '1997-11-08', 'FEMALE',
  'Pediatrician', 'Delhi', 'Delhi', 'India', 'Hindu (Nair)',
  '5''4" (163cm)', 'Malayalam, Hindi', 'Vegetarian', 'MBBS, MD Pediatrics', 'Sagittarius',
  'Doctor by profession, dreamer by nature. I believe healing goes beyond medicine — it''s about connection, compassion, and community. My weekends are spent either at classical music concerts or on yoga retreats.',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=85',
  1, 0,
  'Classical Music,Yoga,Medicine,Travel',
  'Early Riser,Meditation,Vegetarian Cooking,Reading',
  'Someone who is emotionally mature and caring\nA partner who shares my love for culture and music\nFamily-first values with an open, modern mindset',
  'MALE', 28, 36
),
(
  4, 'Arjun', 'Kapoor', '1991-05-30', 'MALE',
  'Creative Director', 'Pune', 'Maharashtra', 'India', 'Hindu (Punjabi)',
  '5''10" (178cm)', 'Punjabi, Hindi', 'Non-Vegetarian', 'BFA, MFA Design', 'Gemini',
  'Creative director at a design agency, part-time philosopher, full-time coffee enthusiast. I tell stories through visual design, and I''m looking for someone to tell our story with. Love independent cinema, world cuisine, and long road trips.',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=85',
  1, 0,
  'Photography,Cinema,Design,Coffee Culture',
  'Night Owl,Art Galleries,Foodie,Road Trips',
  'A fellow creative soul who sees beauty in everyday moments\nSomeone intellectually curious and compassionate\nShared love for travel and culture',
  'FEMALE', 26, 34
),
(
  5, 'Meera', 'Krishnan', '1999-01-14', 'FEMALE',
  'Software Engineer', 'Chennai', 'Tamil Nadu', 'India', 'Hindu (Brahmin)',
  '5''3" (160cm)', 'Tamil, English', 'Vegetarian', 'B.Tech Information Technology', 'Capricorn',
  'Software engineer who loves building scalable systems and sustainable habits. Passionate about climate tech, carnatic music, and making the world a kinder place one line of code at a time.',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=85',
  1, 0,
  'Coding,Carnatic Music,Sustainability,Reading',
  'Morning Person,Cycle Commuter,Homebody,Bookworm',
  'A partner who values sustainability and conscious living\nSomeone who is intellectually stimulating and emotionally available\nSense of humor is non-negotiable',
  'MALE', 26, 33
),
(
  6, 'Kabir', 'Singh', '1994-09-05', 'MALE',
  'Fitness Lead', 'Delhi', 'Delhi', 'India', 'Sikh',
  '6''0" (183cm)', 'Punjabi, Hindi', 'Non-Vegetarian', 'B.Sc Sports Science', 'Virgo',
  'Fitness coach and wellness advocate. I believe a healthy body is the foundation of a fulfilled life. Off-duty, I love Bollywood dance, regional food trails, and mentoring underprivileged youth through sports.',
  'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=800&q=85',
  0, 0,
  'Fitness,Bollywood,Social Work,Sports',
  'Gym Every Day,Early Riser,Meal Prepper,Outdoors',
  'A partner who values health and wellness\nSomeone warm-hearted and community-minded\nAdventurous spirit with a grounded heart',
  'FEMALE', 25, 32
),
(
  7, 'Ishita', 'Gupta', '1998-06-19', 'FEMALE',
  'UX Researcher', 'Hyderabad', 'Telangana', 'India', 'Hindu',
  '5''5" (165cm)', 'Hindi, Telugu', 'Vegetarian', 'M.Des Human-Computer Interaction', 'Gemini',
  'I study how people interact with technology so we can make it more human. I bring the same curiosity to life — always exploring, questioning, and empathizing. Love pottery, board games, and farmer''s markets.',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=85',
  1, 0,
  'UX Research,Pottery,Board Games,Cooking',
  'Creative Thinker,Weekend Farmer Market,Social Butterfly,Cat Person',
  'An emotionally intelligent and curious partner\nSomeone who challenges and supports me in equal measure\nShared love for making and creating things',
  'MALE', 27, 35
),
(
  8, 'Varun', 'Malhotra', '1996-12-25', 'MALE',
  'Financial Analyst', 'Mumbai', 'Maharashtra', 'India', 'Hindu',
  '5''9" (175cm)', 'Hindi, English', 'Non-Vegetarian', 'MBA Finance, CFA Level 2', 'Capricorn',
  'Numbers by day, guitar by night. I balance spreadsheets and chord progressions with equal passion. Believe deeply in giving back — mentor young professionals and volunteer at financial literacy programs.',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&q=85',
  0, 0,
  'Finance,Guitar,Mentoring,Travelling',
  'Early Bird,Gym,Weekend Traveller,Reading',
  'Someone who is ambitious yet grounded in values\nA partner who is warm, fun, and genuinely curious about the world\nFamily-oriented with a modern perspective',
  'FEMALE', 24, 31
),
(
  9, 'Sneha', 'Agarwal', '1997-04-10', 'FEMALE',
  'Content Strategist', 'Kolkata', 'West Bengal', 'India', 'Hindu (Marwari)',
  '5''4" (163cm)', 'Bengali, Hindi', 'Vegetarian', 'BA English Literature, PG Content Management', 'Aries',
  'Wordsmith by trade, storyteller at heart. I spend my days crafting narratives for brands and my evenings writing fiction no one has read yet. Lover of monsoons, adda sessions, and good biryani.',
  'https://images.unsplash.com/photo-1526413232644-8a40f03cc03b?w=800&q=85',
  0, 0,
  'Writing,Literature,Street Photography,Biryani',
  'Late Night Writer,Bookworm,Coffee Addict,Slow Traveller',
  'A fellow reader and dreamer who appreciates words and silence\nSomeone kind, gentle, and genuinely funny\nWilling to build a life one conversation at a time',
  'MALE', 26, 33
),
(
  10, 'Rahul', 'Verma', '1993-08-18', 'MALE',
  'Civil Engineer', 'Jaipur', 'Rajasthan', 'India', 'Hindu (Rajput)',
  '5''11" (181cm)', 'Rajasthani, Hindi', 'Non-Vegetarian', 'B.Tech Civil Engineering', 'Leo',
  'I build bridges for a living and believe in building even stronger human connections. Family is my greatest achievement and my biggest motivation. I love polo, heritage architecture, and royal Rajasthani cuisine.',
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=85',
  0, 0,
  'Architecture,Polo,Heritage Sites,Cuisine',
  'Family Person,Outdoor Sports,Heritage Lover,Early Riser',
  'A partner who values family and tradition alongside personal ambitions\nSomeone warm and genuine — no pretenses\nShared love for culture, food, and a good laugh',
  'FEMALE', 26, 32
);

-- ── Matches ───────────────────────────────────────────────────────────────
INSERT INTO matches (sender_profile_id, receiver_profile_id, status) VALUES
  (2, 1, 'ACCEPTED'),     -- Rohan → Ananya (matched)
  (3, 2, 'ACCEPTED'),     -- Priya → Rohan (matched)
  (5, 1, 'PENDING'),      -- Meera → Ananya (pending)
  (8, 1, 'PENDING'),      -- Varun → Ananya (pending)
  (7, 1, 'PENDING'),      -- Ishita → Ananya (pending)
  (4, 1, 'PENDING'),      -- Arjun → Ananya (pending)
  (1, 6, 'SHORTLISTED'),  -- Ananya shortlisted Kabir
  (1, 10, 'PENDING');     -- Ananya → Rahul

-- ── Conversations ─────────────────────────────────────────────────────────
INSERT INTO conversations (profile1_id, profile2_id) VALUES
  (1, 2),   -- Ananya ↔ Rohan
  (1, 3),   -- Ananya ↔ Priya
  (1, 8);   -- Ananya ↔ Varun

-- ── Messages ──────────────────────────────────────────────────────────────
INSERT INTO messages (conversation_id, sender_profile_id, content, is_read, sent_at) VALUES
  (1, 2, 'Hey Ananya! 👋 Thanks for matching. Your profile really stood out — I love that you blend design with such a soulful bio.', 1, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
  (1, 1, 'Hi Rohan! Thank you — that means a lot. I saw you work on open-source projects. That''s really admirable. What are you building these days?', 1, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
  (1, 2, 'Currently working on a accessibility toolkit for Indian language apps. Hoping to make a dent! Would love to hear about your latest design work.', 1, DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
  (1, 1, 'That sounds amazing — accessibility is so underrated. I''m redesigning an e-commerce app for rural artisans. Lots of challenges but super rewarding!', 0, DATE_SUB(NOW(), INTERVAL 10 MINUTE)),

  (2, 3, 'Hello! I noticed we''re both vegetarians who love yoga — felt like fate 😄', 1, DATE_SUB(NOW(), INTERVAL 1 DAY)),
  (2, 1, 'Ha, SoulSync clearly knows us well! Which style of yoga do you practice?', 1, DATE_SUB(NOW(), INTERVAL 23 HOUR)),
  (2, 3, 'Ashtanga mostly. You?', 0, DATE_SUB(NOW(), INTERVAL 22 HOUR)),

  (3, 8, 'Hi Ananya, hope you''re doing well. I''d love to connect and learn more about your design work.', 1, DATE_SUB(NOW(), INTERVAL 3 DAY)),
  (3, 1, 'Hi Varun! Nice to hear from you. Would be great to chat!', 0, DATE_SUB(NOW(), INTERVAL 2 DAY));

-- ── Success Stories ───────────────────────────────────────────────────────
INSERT INTO success_stories (couple_names, story, matched_date, photo_url, rating) VALUES
(
  'Ananya & Rohan',
  '"We found each other through the Values First search. It wasn''t about data points; it was about the soul connection we felt from the first message. SoulSync gave us the language to express who we truly were."',
  '2023-06-15',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&q=80',
  5
),
(
  'Priya & Arjun',
  '"SoulSync''s personality tags made all the difference. We realized we shared a love for quiet mornings and sustainable living before even meeting in person. Three months in, he proposed at the same café we talked about in our first chat."',
  '2023-10-22',
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80',
  5
),
(
  'Kavita & Sameer',
  '"The verification process gave me so much peace of mind. It was refreshing to be on a platform that actually prioritizes safety and sincerity. We met at a SoulSync offline event and knew immediately."',
  '2024-01-08',
  'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600&q=80',
  5
),
(
  'Divya & Nikhil',
  '"We were both skeptical of matrimonial apps until SoulSync''s guided icebreakers broke the ice for us. That first conversation about our childhood memories turned into a three-hour call. We''re getting married next spring!"',
  '2024-03-14',
  'https://images.unsplash.com/photo-1529634597503-139d3726fed5?w=600&q=80',
  5
),
(
  'Meera & Vikram',
  '"As a doctor with a hectic schedule, I had almost given up on finding the right person. SoulSync''s filtered search helped me find Vikram, who understood my world perfectly. We bonded over our shared passion for public health."',
  '2024-02-28',
  'https://images.unsplash.com/photo-1522093007474-d86e9bf7ba6f?w=600&q=80',
  5
);
