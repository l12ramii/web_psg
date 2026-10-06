import { createClient } from "./supabase/client";
import {
  Player,
  Rival,
  Field,
  Competition,
  CompetitionType,
  MatchWithRival,
  PlayerStatsSummary,
  MatchDetail,
  Match,
  MatchPlayerStat,
} from "./supabase/types";
import { sortPlayersByPositionAndDorsal } from "./utils";

// ==========================================
// QUERIES (Lecturas desde Supabase)
// ==========================================

export async function getCompetitions(): Promise<Competition[]> {
  try {
    const supabase = createClient();
    const { data, error } = await (supabase.from("competitions") as any)
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching competitions from Supabase:", error.message);
      return [];
    }
    return (data as Competition[]) || [];
  } catch (err) {
    console.error("Unexpected error in getCompetitions:", err);
    return [];
  }
}

export async function getCompetitionById(id: string): Promise<Competition | null> {
  try {
    const supabase = createClient();
    const { data, error } = await (supabase.from("competitions") as any)
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching competition by id from Supabase:", error.message);
      return null;
    }
    return data as Competition;
  } catch (err) {
    console.error("Unexpected error in getCompetitionById:", err);
    return null;
  }
}

export async function getFields(): Promise<Field[]> {
  try {
    const supabase = createClient();
    const { data, error } = await (supabase.from("fields") as any)
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching fields from Supabase:", error.message);
      return [];
    }
    return (data as Field[]) || [];
  } catch (err) {
    console.error("Unexpected error in getFields:", err);
    return [];
  }
}

export async function getFieldById(id: string): Promise<Field | null> {
  try {
    const supabase = createClient();
    const { data, error } = await (supabase.from("fields") as any)
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching field by id from Supabase:", error.message);
      return null;
    }
    return data as Field;
  } catch (err) {
    console.error("Unexpected error in getFieldById:", err);
    return null;
  }
}

export async function getRivals(): Promise<Rival[]> {
  try {
    const supabase = createClient();
    const { data, error } = await (supabase.from("rivals") as any)
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching rivals from Supabase:", error.message);
      return [];
    }
    return (data as Rival[]) || [];
  } catch (err) {
    console.error("Unexpected error in getRivals:", err);
    return [];
  }
}

export async function getPlayers(): Promise<Player[]> {
  try {
    const supabase = createClient();
    const { data, error } = await (supabase.from("players") as any)
      .select("*")
      .order("dorsal", { ascending: true });

    if (error) {
      console.error("Error fetching players from Supabase:", error.message);
      return [];
    }
    return sortPlayersByPositionAndDorsal((data as Player[]) || []);
  } catch (err) {
    console.error("Unexpected error in getPlayers:", err);
    return [];
  }
}

export async function getPlayerStatsSummary(
  competitionFilter?: string | null
): Promise<PlayerStatsSummary[]> {
  try {
    const supabase = createClient();
    const isFiltered = Boolean(competitionFilter && competitionFilter !== "todas");

    if (isFiltered && competitionFilter) {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        competitionFilter
      );
      const isType = ["liga", "copa", "amistoso"].includes(competitionFilter);

      // 1. Intentar RPC de Supabase
      try {
        const { data: rpcData, error: rpcError } = await (supabase.rpc as any)(
          "get_player_stats_by_competition",
          {
            p_competition_id: isUUID ? competitionFilter : null,
            p_competition_type: isType ? competitionFilter : null,
          }
        );

        if (!rpcError && rpcData && Array.isArray(rpcData) && rpcData.length > 0) {
          const formatted = (rpcData as PlayerStatsSummary[]).map((p) => ({
            ...p,
            goals_conceded: p.goals_conceded ?? 0,
          }));
          return sortPlayersByPositionAndDorsal(formatted);
        }
      } catch (rpcErr) {
        // Continuar al cálculo fallback
      }

      // 2. Fallback: Calcular estadísticas filtradas agregando actas y partidos
      const [players, matches, statsRes] = await Promise.all([
        getPlayers(),
        getMatches(),
        (supabase.from("match_player_stats") as any).select("*"),
      ]);

      const allStats: MatchPlayerStat[] = statsRes?.data || [];
      const filteredMatches = matches.filter((m) => {
        if (!m.is_finished) return false;
        if (isUUID) return m.competition_id === competitionFilter;
        if (isType) return m.competition === competitionFilter || m.competition_ref?.type === competitionFilter;
        return (
          m.competition_id === competitionFilter ||
          m.competition === competitionFilter ||
          m.competition_ref?.name === competitionFilter
        );
      });

      const matchIds = new Set(filteredMatches.map((m) => m.id));
      const matchMap = new Map(filteredMatches.map((m) => [m.id, m]));

      const calculatedSummary: PlayerStatsSummary[] = players.map((p) => {
        const playerStats = allStats.filter(
          (s) => s.player_id === p.id && matchIds.has(s.match_id)
        );

        const playedStats = playerStats.filter((s) => s.played);
        const matchesPlayed = playedStats.length;
        const totalGoals = playerStats.reduce((acc, s) => acc + (s.goals || 0), 0);
        const totalAssists = playerStats.reduce((acc, s) => acc + (s.assists || 0), 0);
        const totalYellowCards = playerStats.reduce((acc, s) => acc + (s.yellow_cards || 0), 0);
        const totalRedCards = playerStats.reduce((acc, s) => acc + (s.red_cards || 0), 0);
        const totalCleanSheets = p.position === "portero"
          ? playerStats.filter((s) => s.clean_sheet).length
          : 0;
        
        let goalsConceded = 0;
        if (p.position === "portero") {
          for (const s of playedStats) {
            const m = matchMap.get(s.match_id);
            if (m && typeof m.rival_score === "number") {
              goalsConceded += m.rival_score;
            }
          }
        }

        return {
          player_id: p.id,
          first_name: p.first_name,
          last_name: p.last_name,
          nickname: p.nickname,
          dorsal: p.dorsal,
          position: p.position,
          photo_url: p.photo_url,
          is_active: p.is_active,
          matches_played: matchesPlayed,
          total_goals: totalGoals,
          total_assists: totalAssists,
          total_yellow_cards: totalYellowCards,
          total_red_cards: totalRedCards,
          total_clean_sheets: totalCleanSheets,
          goals_conceded: goalsConceded,
        };
      });

      return sortPlayersByPositionAndDorsal(calculatedSummary);
    }

    // Consulta estándar global sin filtro de competición
    const { data, error } = await (supabase.from("player_stats_summary") as any)
      .select("*")
      .order("dorsal", { ascending: true });

    if (error) {
      console.error("Error fetching player_stats_summary from Supabase:", error.message);
      // Fallback: si la vista no se ha creado aún, consultar players directamente
      const players = await getPlayers();
      return sortPlayersByPositionAndDorsal(
        players.map((p) => ({
          player_id: p.id,
          first_name: p.first_name,
          last_name: p.last_name,
          nickname: p.nickname,
          dorsal: p.dorsal,
          position: p.position,
          photo_url: p.photo_url,
          is_active: p.is_active,
          matches_played: 0,
          total_goals: 0,
          total_assists: 0,
          total_yellow_cards: 0,
          total_red_cards: 0,
          total_clean_sheets: 0,
          goals_conceded: 0,
        }))
      );
    }
    const formatted = ((data as PlayerStatsSummary[]) || []).map((p) => ({
      ...p,
      goals_conceded: p.goals_conceded ?? 0,
    }));
    return sortPlayersByPositionAndDorsal(formatted);
  } catch (err) {
    console.error("Unexpected error in getPlayerStatsSummary:", err);
    return [];
  }
}

export async function getMatches(): Promise<MatchWithRival[]> {
  try {
    const supabase = createClient();
    const { data, error } = await (supabase.from("matches") as any)
      .select("*, rival:rivals(*), field:fields(*), competition_ref:competitions(*)")
      .order("match_date", { ascending: true });

    if (error) {
      // Fallback si las tablas de competiciones/campos aún no se han creado en Supabase
      const fallback = await (supabase.from("matches") as any)
        .select("*, rival:rivals(*)")
        .order("match_date", { ascending: true });
      if (!fallback.error && fallback.data) {
        return fallback.data as MatchWithRival[];
      }
      console.error("Error fetching matches from Supabase:", error.message);
      return [];
    }
    return (data as MatchWithRival[]) || [];
  } catch (err) {
    console.error("Unexpected error in getMatches:", err);
    return [];
  }
}

export async function getNextMatch(): Promise<MatchWithRival | null> {
  try {
    const matches = await getMatches();
    const now = new Date().getTime();
    const upcoming = matches
      .filter(
        (m) => !m.is_finished && new Date(m.match_date).getTime() >= now - 7200000
      )
      .sort(
        (a, b) =>
          new Date(a.match_date).getTime() - new Date(b.match_date).getTime()
      );
    return upcoming[0] || null;
  } catch (err) {
    console.error("Error in getNextMatch:", err);
    return null;
  }
}

export async function getLastResult(): Promise<MatchWithRival | null> {
  try {
    const matches = await getMatches();
    const finished = matches
      .filter((m) => m.is_finished)
      .sort(
        (a, b) =>
          new Date(b.match_date).getTime() - new Date(a.match_date).getTime()
      );
    return finished[0] || null;
  } catch (err) {
    console.error("Error in getLastResult:", err);
    return null;
  }
}

export async function getMatchById(id: string): Promise<MatchDetail | null> {
  try {
    const supabase = createClient();
    let matchData: any = null;
    const { data, error: matchError } = await (supabase.from("matches") as any)
      .select("*, rival:rivals(*), field:fields(*), competition_ref:competitions(*)")
      .eq("id", id)
      .single();

    if (matchError || !data) {
      // Fallback sin las tablas opcionales fields/competitions
      const fallback = await (supabase.from("matches") as any)
        .select("*, rival:rivals(*)")
        .eq("id", id)
        .single();
      if (fallback.error || !fallback.data) {
        console.error("Error fetching match by id from Supabase:", fallback.error?.message || matchError?.message);
        return null;
      }
      matchData = fallback.data;
    } else {
      matchData = data;
    }

    const { data: statsData, error: statsError } = await (supabase.from("match_player_stats") as any)
      .select("*, player:players(*)")
      .eq("match_id", id);

    if (statsError) {
      console.error("Error fetching match stats from Supabase:", statsError.message);
    }

    return {
      ...(matchData as MatchWithRival),
      stats: (statsData as any[]) || [],
    };
  } catch (err) {
    console.error("Unexpected error in getMatchById:", err);
    return null;
  }
}

export async function getStatLeaders(competitionFilter?: string | null) {
  const allStats = await getPlayerStatsSummary(competitionFilter);

  if (!allStats || allStats.length === 0) {
    return {
      topScorer: null,
      topAssistant: null,
      topKeeper: null,
    };
  }

  // Filtrar jugadores de campo y porteros (excluyendo cuerpo técnico para líderes de juego)
  const playersOnly = allStats.filter(
    (p) => p.position !== "entrenador" && p.position !== "utillero"
  );
  const stats = playersOnly.length > 0 ? playersOnly : allStats;

  const topScorer = [...stats].sort(
    (a, b) => (b.total_goals || 0) - (a.total_goals || 0)
  )[0];

  const topAssistant = [...stats].sort(
    (a, b) => (b.total_assists || 0) - (a.total_assists || 0)
  )[0];

  const topKeeper = [...stats]
    .filter((p) => p.position === "portero")
    .sort((a, b) => (b.total_clean_sheets || 0) - (a.total_clean_sheets || 0))[0];

  return {
    topScorer: (topScorer?.total_goals ?? 0) > 0 ? topScorer : stats[0] || null,
    topAssistant: (topAssistant?.total_assists ?? 0) > 0 ? topAssistant : stats[0] || null,
    topKeeper: topKeeper || stats.find((p) => p.position === "portero") || stats[0] || null,
  };
}

// ==========================================
// MUTATIONS (Escrituras / Inserciones en Supabase)
// ==========================================

export async function addRival(
  name: string,
  shield_url?: string | null
): Promise<Rival> {
  const supabase = createClient();
  const { data, error } = await (supabase.from("rivals") as any)
    .insert({
      name,
      shield_url: shield_url || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding rival to Supabase:", error.message);
    throw error;
  }
  return data as Rival;
}

export async function updateRival(
  id: string,
  data: Partial<Rival>
): Promise<Rival | null> {
  const supabase = createClient();
  const { data: updatedRival, error } = await (supabase.from("rivals") as any)
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating rival in Supabase:", error.message);
    throw error;
  }
  return updatedRival as Rival;
}

export async function deleteRival(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await (supabase.from("rivals") as any)
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting rival in Supabase:", error.message);
    if (
      error.code === "23503" ||
      error.message?.includes("violates foreign key constraint") ||
      error.message?.includes("matches_rival_id_fkey")
    ) {
      throw new Error(
        "No se puede eliminar el rival porque tiene partidos asociados en el calendario o actas."
      );
    }
    throw error;
  }
  return true;
}

export async function addPlayer(
  data: Omit<Player, "id" | "created_at">
): Promise<Player> {
  const supabase = createClient();
  const { data: newPlayer, error } = await (supabase.from("players") as any)
    .insert({
      first_name: data.first_name,
      last_name: data.last_name || null,
      nickname: data.nickname,
      dorsal: data.dorsal,
      position: data.position,
      photo_url: data.photo_url || null,
      is_active: data.is_active ?? true,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding player to Supabase:", error.message);
    throw error;
  }
  return newPlayer as Player;
}

export async function updatePlayer(
  id: string,
  data: Partial<Player>
): Promise<Player | null> {
  const supabase = createClient();
  const { data: updatedPlayer, error } = await (supabase.from("players") as any)
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating player in Supabase:", error.message);
    throw error;
  }
  return updatedPlayer as Player;
}

export async function addField(data: {
  name: string;
  address?: string | null;
  maps_url?: string | null;
}): Promise<Field> {
  const supabase = createClient();
  const { data: newField, error } = await (supabase.from("fields") as any)
    .insert({
      name: data.name,
      address: data.address || null,
      maps_url: data.maps_url || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding field to Supabase:", error.message);
    throw error;
  }
  return newField as Field;
}

export async function updateField(
  id: string,
  data: Partial<Field>
): Promise<Field | null> {
  const supabase = createClient();
  const { data: updatedField, error } = await (supabase.from("fields") as any)
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating field in Supabase:", error.message);
    throw error;
  }
  return updatedField as Field;
}

export async function deleteField(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await (supabase.from("fields") as any)
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting field in Supabase:", error.message);
    if (
      error.code === "23503" ||
      error.message?.includes("violates foreign key constraint")
    ) {
      throw new Error(
        "No se puede eliminar este campo porque está asignado a partidos en el calendario."
      );
    }
    throw error;
  }
  return true;
}

export async function addCompetition(data: {
  name: string;
  type: CompetitionType;
}): Promise<Competition> {
  const supabase = createClient();
  const { data: newCompetition, error } = await (supabase.from("competitions") as any)
    .insert({
      name: data.name,
      type: data.type,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding competition to Supabase:", error.message);
    throw error;
  }
  return newCompetition as Competition;
}

export async function updateCompetition(
  id: string,
  data: Partial<Competition>
): Promise<Competition | null> {
  const supabase = createClient();
  const { data: updatedCompetition, error } = await (supabase.from("competitions") as any)
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating competition in Supabase:", error.message);
    throw error;
  }
  return updatedCompetition as Competition;
}

export async function deleteCompetition(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await (supabase.from("competitions") as any)
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting competition in Supabase:", error.message);
    if (
      error.code === "23503" ||
      error.message?.includes("violates foreign key constraint")
    ) {
      throw new Error(
        "No se puede eliminar esta competición porque tiene partidos asignados en el calendario."
      );
    }
    throw error;
  }
  return true;
}

export async function addMatch(data: {
  rival_id: string;
  field_id?: string | null;
  competition_id?: string | null;
  is_home: boolean;
  match_date: string;
  competition: "liga" | "copa" | "amistoso";
}): Promise<MatchWithRival> {
  const supabase = createClient();
  const insertPayload: any = {
    rival_id: data.rival_id,
    is_home: data.is_home,
    match_date: data.match_date,
    competition: data.competition,
  };
  if (data.field_id) insertPayload.field_id = data.field_id;
  if (data.competition_id) insertPayload.competition_id = data.competition_id;

  const { data: newMatch, error } = await (supabase.from("matches") as any)
    .insert(insertPayload)
    .select("*, rival:rivals(*)")
    .single();

  if (error) {
    console.error("Error adding match to Supabase:", error.message);
    throw error;
  }
  return newMatch as MatchWithRival;
}

export async function updateMatch(
  id: string,
  data: Partial<{
    rival_id: string;
    field_id: string | null;
    competition_id: string | null;
    is_home: boolean;
    match_date: string;
    competition: "liga" | "copa" | "amistoso";
    psg_score: number | null;
    rival_score: number | null;
  }>
): Promise<MatchWithRival | null> {
  const supabase = createClient();
  const { data: updatedMatch, error } = await (supabase.from("matches") as any)
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*, rival:rivals(*)")
    .single();

  if (error) {
    console.error("Error updating match in Supabase:", error.message);
    throw error;
  }
  return updatedMatch as MatchWithRival;
}

export async function deleteMatch(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await (supabase.from("matches") as any)
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting match in Supabase:", error.message);
    throw error;
  }
  return true;
}

export async function saveMatchSheet(
  matchId: string,
  psgScore: number,
  rivalScore: number,
  playerStats: {
    player_id: string;
    played: boolean;
    goals: number;
    assists: number;
    yellow_cards: number;
    red_cards: number;
    clean_sheet: boolean;
  }[]
) {
  const supabase = createClient();

  // 1. Actualizar el marcador del partido
  const { error: matchError } = await (supabase.from("matches") as any)
    .update({
      psg_score: psgScore,
      rival_score: rivalScore,
      updated_at: new Date().toISOString(),
    })
    .eq("id", matchId);

  if (matchError) {
    console.error("Error updating match score in Supabase:", matchError.message);
    throw matchError;
  }

  // 2. Insertar o actualizar (upsert) las estadísticas de los jugadores en el acta
  if (playerStats.length > 0) {
    const statsToUpsert = playerStats.map((stat) => ({
      match_id: matchId,
      player_id: stat.player_id,
      played: stat.played,
      goals: stat.goals,
      assists: stat.assists,
      yellow_cards: stat.yellow_cards,
      red_cards: stat.red_cards,
      clean_sheet: stat.clean_sheet,
    }));

    const { error: statsError } = await (supabase.from("match_player_stats") as any)
      .upsert(statsToUpsert, {
        onConflict: "match_id,player_id",
      });

    if (statsError) {
      console.error("Error saving match player stats in Supabase:", statsError.message);
      throw statsError;
    }
  }

  return { success: true };
}
