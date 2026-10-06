export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type PlayerPosition =
  | "portero"
  | "defensa"
  | "medio"
  | "delantero"
  | "entrenador"
  | "utillero";
export type CompetitionType = "liga" | "copa" | "amistoso";

export interface Database {
  public: {
    Tables: {
      players: {
        Row: {
          id: string;
          first_name: string;
          last_name: string | null;
          nickname: string;
          dorsal: number;
          position: PlayerPosition;
          photo_url: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          first_name: string;
          last_name?: string | null;
          nickname: string;
          dorsal: number;
          position: PlayerPosition;
          photo_url?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string | null;
          nickname?: string;
          dorsal?: number;
          position?: PlayerPosition;
          photo_url?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      rivals: {
        Row: {
          id: string;
          name: string;
          shield_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          shield_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          shield_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      fields: {
        Row: {
          id: string;
          name: string;
          address: string | null;
          maps_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address?: string | null;
          maps_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string | null;
          maps_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      competitions: {
        Row: {
          id: string;
          name: string;
          type: CompetitionType;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type?: CompetitionType;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: CompetitionType;
          created_at?: string;
        };
        Relationships: [];
      };
      matches: {
        Row: {
          id: string;
          rival_id: string;
          field_id: string | null;
          competition_id: string | null;
          is_home: boolean;
          match_date: string;
          competition: CompetitionType;
          psg_score: number | null;
          rival_score: number | null;
          is_finished: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          rival_id: string;
          field_id?: string | null;
          competition_id?: string | null;
          is_home?: boolean;
          match_date: string;
          competition?: CompetitionType;
          psg_score?: number | null;
          rival_score?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          rival_id?: string;
          field_id?: string | null;
          competition_id?: string | null;
          is_home?: boolean;
          match_date?: string;
          competition?: CompetitionType;
          psg_score?: number | null;
          rival_score?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "matches_rival_id_fkey";
            columns: ["rival_id"];
            isOneToOne: false;
            referencedRelation: "rivals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_field_id_fkey";
            columns: ["field_id"];
            isOneToOne: false;
            referencedRelation: "fields";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_competition_id_fkey";
            columns: ["competition_id"];
            isOneToOne: false;
            referencedRelation: "competitions";
            referencedColumns: ["id"];
          }
        ];
      };
      match_player_stats: {
        Row: {
          id: string;
          match_id: string;
          player_id: string;
          played: boolean;
          goals: number;
          assists: number;
          yellow_cards: number;
          red_cards: number;
          clean_sheet: boolean;
        };
        Insert: {
          id?: string;
          match_id: string;
          player_id: string;
          played?: boolean;
          goals?: number;
          assists?: number;
          yellow_cards?: number;
          red_cards?: number;
          clean_sheet?: boolean;
        };
        Update: {
          id?: string;
          match_id?: string;
          player_id?: string;
          played?: boolean;
          goals?: number;
          assists?: number;
          yellow_cards?: number;
          red_cards?: number;
          clean_sheet?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "match_player_stats_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "match_player_stats_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      player_stats_summary: {
        Row: {
          player_id: string;
          first_name: string;
          last_name: string | null;
          nickname: string;
          dorsal: number;
          position: PlayerPosition;
          photo_url: string | null;
          is_active: boolean;
          matches_played: number;
          total_goals: number;
          total_assists: number;
          total_yellow_cards: number;
          total_red_cards: number;
          total_clean_sheets: number;
          goals_conceded: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      player_position: PlayerPosition;
      competition_type: CompetitionType;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Player = Database["public"]["Tables"]["players"]["Row"];
export type Rival = Database["public"]["Tables"]["rivals"]["Row"];
export type Field = Database["public"]["Tables"]["fields"]["Row"];
export type Competition = Database["public"]["Tables"]["competitions"]["Row"];
export type Match = Database["public"]["Tables"]["matches"]["Row"];
export type MatchPlayerStat =
  Database["public"]["Tables"]["match_player_stats"]["Row"];
export type PlayerStatsSummary =
  Database["public"]["Views"]["player_stats_summary"]["Row"];

export interface MatchWithRival extends Match {
  rival: Rival;
  field?: Field | null;
  competition_ref?: Competition | null;
}

export interface MatchDetail extends MatchWithRival {
  stats: (MatchPlayerStat & { player: Player })[];
}
