-- =========================================================
-- Base de Datos PSG Fútbol 7 - Esquema SQL Completo Supabase
-- =========================================================

-- 1. Enums
DO $$ BEGIN
    CREATE TYPE player_position AS ENUM ('portero', 'defensa', 'medio', 'delantero', 'entrenador', 'utillero');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE competition_type AS ENUM ('liga', 'copa', 'amistoso');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Tabla de Jugadores
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT,
    nickname TEXT NOT NULL,
    dorsal INTEGER NOT NULL,
    position player_position NOT NULL,
    photo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabla de Rivales (Directorio Reutilizable)
CREATE TABLE IF NOT EXISTS rivals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    shield_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tabla de Campos de Juego (Instalaciones / Sedes)
CREATE TABLE IF NOT EXISTS fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT,
    maps_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Tabla de Competiciones (Ligas, Copas, Torneos, Amistosos)
CREATE TABLE IF NOT EXISTS competitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type competition_type NOT NULL DEFAULT 'liga',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Tabla de Partidos
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rival_id UUID NOT NULL REFERENCES rivals(id) ON DELETE RESTRICT,
    field_id UUID REFERENCES fields(id) ON DELETE SET NULL,
    competition_id UUID REFERENCES competitions(id) ON DELETE SET NULL,
    is_home BOOLEAN NOT NULL DEFAULT true,
    match_date TIMESTAMPTZ NOT NULL,
    competition competition_type NOT NULL DEFAULT 'liga',
    psg_score INTEGER DEFAULT NULL,
    rival_score INTEGER DEFAULT NULL,
    is_finished BOOLEAN GENERATED ALWAYS AS (psg_score IS NOT NULL AND rival_score IS NOT NULL) STORED,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Tabla de Actas / Estadísticas por Jugador en Cada Partido
CREATE TABLE IF NOT EXISTS match_player_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    played BOOLEAN DEFAULT true,
    goals INTEGER DEFAULT 0 CHECK (goals >= 0),
    assists INTEGER DEFAULT 0 CHECK (assists >= 0),
    yellow_cards INTEGER DEFAULT 0 CHECK (yellow_cards >= 0 AND yellow_cards <= 2),
    red_cards INTEGER DEFAULT 0 CHECK (red_cards >= 0 AND red_cards <= 1),
    clean_sheet BOOLEAN DEFAULT false,
    UNIQUE(match_id, player_id)
);

-- 8. Vista de Estadísticas Acumuladas
CREATE OR REPLACE VIEW player_stats_summary AS
SELECT 
    p.id AS player_id,
    p.first_name,
    p.last_name,
    p.nickname,
    p.dorsal,
    p.position,
    p.photo_url,
    p.is_active,
    COUNT(mps.id) FILTER (WHERE mps.played = true) AS matches_played,
    COALESCE(SUM(mps.goals), 0)::INTEGER AS total_goals,
    COALESCE(SUM(mps.assists), 0)::INTEGER AS total_assists,
    COALESCE(SUM(mps.yellow_cards), 0)::INTEGER AS total_yellow_cards,
    COALESCE(SUM(mps.red_cards), 0)::INTEGER AS total_red_cards,
    COUNT(mps.id) FILTER (WHERE mps.clean_sheet = true AND p.position = 'portero')::INTEGER AS total_clean_sheets,
    COALESCE(SUM(m.rival_score) FILTER (WHERE mps.played = true AND p.position = 'portero'), 0)::INTEGER AS goals_conceded
FROM players p
LEFT JOIN match_player_stats mps ON p.id = mps.player_id
LEFT JOIN matches m ON mps.match_id = m.id AND m.psg_score IS NOT NULL
GROUP BY p.id;

-- 8.1. Función RPC para Estadísticas Filtrables por Competición
CREATE OR REPLACE FUNCTION get_player_stats_by_competition(
    p_competition_id UUID DEFAULT NULL,
    p_competition_type competition_type DEFAULT NULL
)
RETURNS TABLE (
    player_id UUID,
    first_name TEXT,
    last_name TEXT,
    nickname TEXT,
    dorsal INTEGER,
    position player_position,
    photo_url TEXT,
    is_active BOOLEAN,
    matches_played BIGINT,
    total_goals INTEGER,
    total_assists INTEGER,
    total_yellow_cards INTEGER,
    total_red_cards INTEGER,
    total_clean_sheets INTEGER,
    goals_conceded INTEGER
) LANGUAGE sql STABLE AS $$
SELECT 
    p.id AS player_id,
    p.first_name,
    p.last_name,
    p.nickname,
    p.dorsal,
    p.position,
    p.photo_url,
    p.is_active,
    COUNT(mps.id) FILTER (WHERE mps.played = true) AS matches_played,
    COALESCE(SUM(mps.goals), 0)::INTEGER AS total_goals,
    COALESCE(SUM(mps.assists), 0)::INTEGER AS total_assists,
    COALESCE(SUM(mps.yellow_cards), 0)::INTEGER AS total_yellow_cards,
    COALESCE(SUM(mps.red_cards), 0)::INTEGER AS total_red_cards,
    COUNT(mps.id) FILTER (WHERE mps.clean_sheet = true AND p.position = 'portero')::INTEGER AS total_clean_sheets,
    COALESCE(SUM(m.rival_score) FILTER (WHERE mps.played = true AND p.position = 'portero'), 0)::INTEGER AS goals_conceded
FROM players p
LEFT JOIN match_player_stats mps ON p.id = mps.player_id
LEFT JOIN matches m ON mps.match_id = m.id 
    AND m.psg_score IS NOT NULL 
    AND (
        (p_competition_id IS NULL AND p_competition_type IS NULL) OR
        (p_competition_id IS NOT NULL AND m.competition_id = p_competition_id) OR
        (p_competition_type IS NOT NULL AND (m.competition = p_competition_type OR EXISTS (SELECT 1 FROM competitions c WHERE c.id = m.competition_id AND c.type = p_competition_type)))
    )
GROUP BY p.id;
$$;

-- 9. Seguridad: Habilitar RLS en todas las tablas
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE rivals ENABLE ROW LEVEL SECURITY;
ALTER TABLE fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_player_stats ENABLE ROW LEVEL SECURITY;

-- Políticas de Lectura Pública (Anon y Authenticated)
CREATE POLICY "Acceso público de lectura a jugadores" ON players
    FOR SELECT USING (true);

CREATE POLICY "Acceso público de lectura a rivales" ON rivals
    FOR SELECT USING (true);

CREATE POLICY "Acceso público de lectura a campos" ON fields
    FOR SELECT USING (true);

CREATE POLICY "Acceso público de lectura a competiciones" ON competitions
    FOR SELECT USING (true);

CREATE POLICY "Acceso público de lectura a partidos" ON matches
    FOR SELECT USING (true);

CREATE POLICY "Acceso público de lectura a estadísticas" ON match_player_stats
    FOR SELECT USING (true);

-- Políticas de Escritura Protegida (Solo usuarios autenticados / CM)
CREATE POLICY "Escritura autenticada para jugadores" ON players
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Escritura autenticada para rivales" ON rivals
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Escritura autenticada para campos" ON fields
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Escritura autenticada para competiciones" ON competitions
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Escritura autenticada para partidos" ON matches
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Escritura autenticada para estadísticas" ON match_player_stats
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 8. Configuración de Buckets de Storage
INSERT INTO storage.buckets (id, name, public) 
VALUES ('player-photos', 'player-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('rival-crests', 'rival-crests', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Políticas de Storage
CREATE POLICY "Lectura pública de fotos de jugadores" ON storage.objects
    FOR SELECT USING (bucket_id = 'player-photos');

CREATE POLICY "Lectura pública de escudos de rivales" ON storage.objects
    FOR SELECT USING (bucket_id = 'rival-crests');

CREATE POLICY "Subida autenticada a fotos de jugadores" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'player-photos');

CREATE POLICY "Subida autenticada a escudos de rivales" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'rival-crests');

CREATE POLICY "Modificación autenticada de fotos de jugadores" ON storage.objects
    FOR UPDATE TO authenticated USING (bucket_id = 'player-photos');

CREATE POLICY "Modificación autenticada de escudos de rivales" ON storage.objects
    FOR UPDATE TO authenticated USING (bucket_id = 'rival-crests');

CREATE POLICY "Eliminación autenticada de fotos de jugadores" ON storage.objects
    FOR DELETE TO authenticated USING (bucket_id = 'player-photos');

CREATE POLICY "Eliminación autenticada de escudos de rivales" ON storage.objects
    FOR DELETE TO authenticated USING (bucket_id = 'rival-crests');

