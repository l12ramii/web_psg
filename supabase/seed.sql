-- =========================================================
-- Base de Datos PSG Fútbol 7 - Datos de Prueba (Seed Data)
-- =========================================================

-- 1. Insertar Rivales
INSERT INTO rivals (id, name, shield_url) VALUES
('11111111-1111-1111-1111-111111111101', 'Barrio Norte F7', 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=128&auto=format&fit=crop&q=80'),
('11111111-1111-1111-1111-111111111102', 'Los Halcones FC', 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=128&auto=format&fit=crop&q=80'),
('11111111-1111-1111-1111-111111111103', 'Atlético San Juan', 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=128&auto=format&fit=crop&q=80'),
('11111111-1111-1111-1111-111111111104', 'Inter Ribera', 'https://images.unsplash.com/photo-1511886929837-354d827aae26?w=128&auto=format&fit=crop&q=80'),
('11111111-1111-1111-1111-111111111105', 'Recreativo Olivo', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=128&auto=format&fit=crop&q=80')
ON CONFLICT (id) DO NOTHING;

-- 2. Insertar Campos de Juego
INSERT INTO fields (id, name, address, maps_url) VALUES
('44444444-4444-4444-4444-444444444401', 'Campo Municipal El Ferial', 'Calle de los Deportes 14, Madrid', 'https://maps.google.com/?q=Campo+Municipal+El+Ferial'),
('44444444-4444-4444-4444-444444444402', 'Polideportivo San Juan', 'Av. de la Paz s/n, Madrid', 'https://maps.google.com/?q=Polideportivo+San+Juan'),
('44444444-4444-4444-4444-444444444403', 'Complejo Deportivo Las Palmeras', 'Calle Olivo 22, Madrid', 'https://maps.google.com/?q=Complejo+Deportivo+Las+Palmeras')
ON CONFLICT (id) DO NOTHING;

-- 3. Insertar Plantilla PSG F7
-- Porteros
INSERT INTO players (id, first_name, last_name, nickname, dorsal, position, photo_url, is_active) VALUES
('22222222-2222-2222-2222-222222222201', 'Álvaro', 'Ramos', 'El Muro', 1, 'portero', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80', true),
('22222222-2222-2222-2222-222222222202', 'Sergio', 'García', 'Checho', 13, 'portero', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80', true),

-- Defensas
('22222222-2222-2222-2222-222222222203', 'Carlos', 'López', 'Kaiser', 3, 'defensa', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80', true),
('22222222-2222-2222-2222-222222222204', 'David', 'Fernández', 'Torre', 4, 'defensa', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80', true),
('22222222-2222-2222-2222-222222222205', 'Mateo', 'Ruiz', 'Tano', 5, 'defensa', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80', true),

-- Centrocampistas
('22222222-2222-2222-2222-222222222206', 'Javier', 'Martínez', 'Mago', 8, 'medio', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80', true),
('22222222-2222-2222-2222-222222222207', 'Marcos', 'Navarro', 'Pulmón', 6, 'medio', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80', true),
('22222222-2222-2222-2222-222222222208', 'Alejandro', 'Sánchez', 'Charly', 10, 'medio', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80', true),

-- Delanteros
('22222222-2222-2222-2222-222222222209', 'Lucas', 'Pérez', 'Pistolero', 9, 'delantero', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80', true),
('22222222-2222-2222-2222-222222222210', 'Daniel', 'Gómez', 'Rayo', 7, 'delantero', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&auto=format&fit=crop&q=80', true),
('22222222-2222-2222-2222-222222222211', 'Gonzalo', 'Castro', 'Tanque', 11, 'delantero', 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=300&auto=format&fit=crop&q=80', true),

-- Cuerpo Técnico
('22222222-2222-2222-2222-222222222212', 'David', 'Guerrero', 'Míster', 0, 'entrenador', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&auto=format&fit=crop&q=80', true),
('22222222-2222-2222-2222-222222222213', 'Manuel', 'Torres', 'Manu', 0, 'utillero', 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=300&auto=format&fit=crop&q=80', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Insertar Partidos
-- Partido 1 (Finalizado: Victoria PSG 4-2)
INSERT INTO matches (id, rival_id, field_id, is_home, match_date, competition, psg_score, rival_score) VALUES
('33333333-3333-3333-3333-333333333301', '11111111-1111-1111-1111-111111111101', '44444444-4444-4444-4444-444444444401', true, now() - INTERVAL '14 days', 'liga', 4, 2)
ON CONFLICT (id) DO NOTHING;

-- Partido 2 (Finalizado: Victoria PSG 3-0 - Portería a Cero)
INSERT INTO matches (id, rival_id, field_id, is_home, match_date, competition, psg_score, rival_score) VALUES
('33333333-3333-3333-3333-333333333302', '11111111-1111-1111-1111-111111111102', '44444444-4444-4444-4444-444444444402', false, now() - INTERVAL '7 days', 'liga', 3, 0)
ON CONFLICT (id) DO NOTHING;

-- Partido 3 (Próximo Partido)
INSERT INTO matches (id, rival_id, field_id, is_home, match_date, competition, psg_score, rival_score) VALUES
('33333333-3333-3333-3333-333333333303', '11111111-1111-1111-1111-111111111103', '44444444-4444-4444-4444-444444444401', true, now() + INTERVAL '3 days 4 hours', 'liga', NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- Partido 4 (Futuro Partido - Copa)
INSERT INTO matches (id, rival_id, field_id, is_home, match_date, competition, psg_score, rival_score) VALUES
('33333333-3333-3333-3333-333333333304', '11111111-1111-1111-1111-111111111104', '44444444-4444-4444-4444-444444444403', false, now() + INTERVAL '10 days', 'copa', NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- 5. Insertar Actas de Partidos Finalizados
-- Acta Partido 1 (4-2)
INSERT INTO match_player_stats (match_id, player_id, played, goals, assists, yellow_cards, red_cards, clean_sheet) VALUES
('33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222201', true, 0, 0, 0, 0, false), -- Portero
('33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222203', true, 0, 0, 1, 0, false), -- Defensa
('33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222204', true, 0, 1, 0, 0, false), -- Defensa
('33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222206', true, 1, 2, 0, 0, false), -- Mago (1G, 2A)
('33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222207', true, 0, 0, 0, 0, false),
('33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222209', true, 2, 0, 0, 0, false), -- Pistolero (2G)
('33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222210', true, 1, 1, 0, 0, false)  -- Rayo (1G, 1A)
ON CONFLICT (match_id, player_id) DO NOTHING;

-- Acta Partido 2 (3-0 - Clean Sheet)
INSERT INTO match_player_stats (match_id, player_id, played, goals, assists, yellow_cards, red_cards, clean_sheet) VALUES
('33333333-3333-3333-3333-333333333302', '22222222-2222-2222-2222-222222222201', true, 0, 0, 0, 0, true),  -- Portero Clean Sheet
('33333333-3333-3333-3333-333333333302', '22222222-2222-2222-2222-222222222203', true, 0, 0, 0, 0, false),
('33333333-3333-3333-3333-333333333302', '22222222-2222-2222-2222-222222222205', true, 1, 0, 0, 0, false), -- Tano (1G)
('33333333-3333-3333-3333-333333333302', '22222222-2222-2222-2222-222222222206', true, 0, 1, 0, 0, false),
('33333333-3333-3333-3333-333333333302', '22222222-2222-2222-2222-222222222208', true, 0, 1, 1, 0, false),
('33333333-3333-3333-3333-333333333302', '22222222-2222-2222-2222-222222222209', true, 2, 0, 0, 0, false), -- Pistolero (2G)
('33333333-3333-3333-3333-333333333302', '22222222-2222-2222-2222-222222222211', true, 0, 1, 0, 0, false)
ON CONFLICT (match_id, player_id) DO NOTHING;

