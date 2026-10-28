-- ====================================================================
-- LordsOne Realistic Campus Services & Initial Slots Seed Data
-- Lords Institute of Engineering and Technology (LIET), Hyderabad
-- ====================================================================

-- 1. Insert Campus Services
INSERT INTO public.services (id, title, slug, description, category, location, price, capacity, image_url, booking_rules, is_active)
VALUES 
(
    '11111111-1111-1111-1111-111111111101',
    'Advanced Robotics & AI Research Lab',
    'advanced-robotics-ai-lab',
    'High-performance research facility equipped with NVIDIA RTX workstations, ROS2 mobile manipulation bots, 6-DoF robotic arms, and computer vision testbeds. Ideal for capstone projects, AI model training, and competitive robotics prototyping.',
    'laboratories',
    'Main Block - CS&E Wing, 3rd Floor, Room 312',
    0.00,
    30,
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
    '{"min_notice_hours": 4, "max_advance_days": 14, "requires_approval": true, "allowed_roles": ["student", "faculty", "admin"]}'::jsonb,
    true
),
(
    '11111111-1111-1111-1111-111111111102',
    'IoT & Embedded Systems Prototyping Studio',
    'iot-embedded-systems-studio',
    'Specialized laboratory featuring oscilloscopes, logic analyzers, ESP32/STM32 development stations, solder rework benches, and environmental sensor test chambers for embedded engineering experiments.',
    'laboratories',
    'ECE Block, Level 2, Lab 204',
    0.00,
    25,
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    '{"min_notice_hours": 2, "max_advance_days": 7, "requires_approval": false, "allowed_roles": ["student", "faculty", "admin"]}'::jsonb,
    true
),
(
    '11111111-1111-1111-1111-111111111103',
    'Sir CV Raman Central Auditorium',
    'sir-cv-raman-central-auditorium',
    'Premier campus auditorium with 450-seat acoustic auditorium seating, 4K digital cinema projection, digital mixing console, line-array audio, and motorized projection screens for conferences, symposia, and guest lectures.',
    'seminar_halls',
    'Main Administrative Block, Ground Floor',
    500.00,
    450,
    'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80',
    '{"min_notice_hours": 48, "max_advance_days": 30, "requires_approval": true, "allowed_roles": ["student", "faculty", "admin"]}'::jsonb,
    true
),
(
    '11111111-1111-1111-1111-111111111104',
    'Dr. APJ Abdul Kalam Seminar Hall',
    'apj-abdul-kalam-seminar-hall',
    'Tiered 150-seat multimedia presentation hall equipped with wireless lapel microphones, dual interactive smartboards, hybrid Zoom room integration, and high-speed Wi-Fi 6 coverage for departmental workshops.',
    'seminar_halls',
    'Mechanical Block, 1st Floor, Hall B',
    150.00,
    150,
    'https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&w=1200&q=80',
    '{"min_notice_hours": 12, "max_advance_days": 21, "requires_approval": false, "allowed_roles": ["student", "faculty", "admin"]}'::jsonb,
    true
),
(
    '11111111-1111-1111-1111-111111111105',
    'Indoor Badminton Wooden Court Arena',
    'indoor-badminton-arena',
    'BWF-standard synthetic cushioned wooden sports floor with LED floodlighting and Yonex tournament netting. Non-marking shoes mandatory. Ideal for intra-college tournaments and recreational matches.',
    'sports',
    'Campus Sports Complex, Indoor Wing',
    50.00,
    4,
    'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80',
    '{"min_notice_hours": 1, "max_advance_days": 3, "requires_approval": false, "allowed_roles": ["student", "faculty", "admin"]}'::jsonb,
    true
),
(
    '11111111-1111-1111-1111-111111111106',
    'Floodlit Basketball Court Complex',
    'basketball-court-complex',
    'Full-court tournament regulation basketball court with acrylic all-weather surfacing, spring-loaded break-away rims, and 1000-lux stadium lighting for evening inter-collegiate training sessions.',
    'sports',
    'North Campus Athletic Grounds',
    0.00,
    20,
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80',
    '{"min_notice_hours": 2, "max_advance_days": 5, "requires_approval": false, "allowed_roles": ["student", "faculty", "admin"]}'::jsonb,
    true
),
(
    '11111111-1111-1111-1111-111111111107',
    'Central Open-Air Amphitheatre',
    'open-air-amphitheatre',
    'Terraced natural amphitheatre with tiered stone seating for 600 attendees, elevated performance stage, ambient lighting towers, and dedicated power drops for cultural festivals, drama club performances, and campus open-mics.',
    'event_spaces',
    'Central Green Quadrangle, LIET Campus',
    300.00,
    600,
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
    '{"min_notice_hours": 24, "max_advance_days": 30, "requires_approval": true, "allowed_roles": ["student", "faculty", "admin"]}'::jsonb,
    true
),
(
    '11111111-1111-1111-1111-111111111108',
    '3D Printing & Rapid Prototyping FabLab',
    '3d-printing-fablab',
    'Maker facility equipped with industrial Bambu Lab X1-Carbon multi-color printers, Formlabs SLA resin printers, laser acrylic cutters, and post-processing wash/cure stations. Supported materials: PLA, PETG, ABS, TPU.',
    'equipment',
    'Central Workshop Building, Bay 4',
    100.00,
    8,
    'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80',
    '{"min_notice_hours": 3, "max_advance_days": 10, "requires_approval": false, "allowed_roles": ["student", "faculty", "admin"]}'::jsonb,
    true
),
(
    '11111111-1111-1111-1111-111111111109',
    'Autonomous Drone & Telemetry Field Kit',
    'autonomous-drone-field-kit',
    'Carbon-fiber quadcopter test platform with Holybro Pixhawk 6X flight controller, real-time FPV HD transmission, RTK-GPS centimeter positioning, and 4S LiPo power packs for aerial mapping and robotics research.',
    'equipment',
    'Aeronautical Hangar & Flight Testing Desk',
    200.00,
    2,
    'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=1200&q=80',
    '{"min_notice_hours": 6, "max_advance_days": 7, "requires_approval": true, "allowed_roles": ["student", "faculty", "admin"]}'::jsonb,
    true
),
(
    '11111111-1111-1111-1111-111111111110',
    'Audio-Visual Media & Podcast Production Studio',
    'media-podcast-production-studio',
    'Acoustically isolated studio treated with foam diffusion, Shure SM7B broadcast dynamic microphones, Blackmagic Pocket Cinema 6K cameras, ATEM Mini switcher, and DaVinci Resolve editing terminal.',
    'event_spaces',
    'Media Arts Center, Block C, Room 108',
    100.00,
    6,
    'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
    '{"min_notice_hours": 4, "max_advance_days": 14, "requires_approval": false, "allowed_roles": ["student", "faculty", "admin"]}'::jsonb,
    true
),
(
    '11111111-1111-1111-1111-111111111111',
    'IT Hardware & Laptop Diagnostic Support Desk',
    'it-diagnostic-support-desk',
    'Official student device troubleshooting center for campus Wi-Fi configuration, OS recovery, Linux dual-boot setup, licensed software installation (MATLAB, AutoCAD, Altium), and campus portal connectivity.',
    'campus_support',
    'Computer Centre, Ground Floor, Helpdesk Counter 2',
    0.00,
    15,
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
    '{"min_notice_hours": 1, "max_advance_days": 3, "requires_approval": false, "allowed_roles": ["student", "faculty", "admin"]}'::jsonb,
    true
),
(
    '11111111-1111-1111-1111-111111111112',
    'Electrical & HVAC Campus Emergency Assistance',
    'campus-maintenance-support',
    'Departmental dispatch for laboratory power issues, circuit breaker resets, three-phase equipment power line setup, and environmental temperature regulation for sensitive computer servers.',
    'campus_support',
    'Estate & Maintenance Department, Service Dock',
    0.00,
    10,
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80',
    '{"min_notice_hours": 1, "max_advance_days": 2, "requires_approval": false, "allowed_roles": ["student", "faculty", "admin"]}'::jsonb,
    true
)
ON CONFLICT (slug) DO UPDATE
SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    location = EXCLUDED.location,
    price = EXCLUDED.price,
    capacity = EXCLUDED.capacity,
    image_url = EXCLUDED.image_url,
    booking_rules = EXCLUDED.booking_rules,
    is_active = EXCLUDED.is_active;

-- 2. Generate Next 7 Days Time Slots for Interactive Booking
DO $$
DECLARE
    svc RECORD;
    d DATE;
    s_time TIME;
    e_time TIME;
BEGIN
    FOR svc IN SELECT id, capacity FROM public.services WHERE is_active = true LOOP
        FOR i IN 0..7 LOOP
            d := CURRENT_DATE + i;
            
            -- Morning Slot 1: 09:00 - 11:00
            s_time := '09:00:00'::time;
            e_time := '11:00:00'::time;
            INSERT INTO public.service_slots (service_id, slot_date, start_time, end_time, capacity, booked_count, is_available)
            VALUES (svc.id, d, s_time, e_time, svc.capacity, 0, true)
            ON CONFLICT (service_id, slot_date, start_time, end_time) DO NOTHING;

            -- Morning Slot 2: 11:30 - 13:30
            s_time := '11:30:00'::time;
            e_time := '13:30:00'::time;
            INSERT INTO public.service_slots (service_id, slot_date, start_time, end_time, capacity, booked_count, is_available)
            VALUES (svc.id, d, s_time, e_time, svc.capacity, 0, true)
            ON CONFLICT (service_id, slot_date, start_time, end_time) DO NOTHING;

            -- Afternoon Slot: 14:00 - 16:00
            s_time := '14:00:00'::time;
            e_time := '16:00:00'::time;
            INSERT INTO public.service_slots (service_id, slot_date, start_time, end_time, capacity, booked_count, is_available)
            VALUES (svc.id, d, s_time, e_time, svc.capacity, 0, true)
            ON CONFLICT (service_id, slot_date, start_time, end_time) DO NOTHING;

            -- Evening Slot: 16:30 - 18:30
            s_time := '16:30:00'::time;
            e_time := '18:30:00'::time;
            INSERT INTO public.service_slots (service_id, slot_date, start_time, end_time, capacity, booked_count, is_available)
            VALUES (svc.id, d, s_time, e_time, svc.capacity, 0, true)
            ON CONFLICT (service_id, slot_date, start_time, end_time) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;
