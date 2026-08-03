import { supabase } from "@/integrations/supabase/client";

export type Match = {
  id: string;
  home_team: string;
  away_team: string;
  home_logo: string | null;
  away_logo: string | null;
  competition: string;
  commentator: string | null;
  channel_name: string | null;
  kickoff: string;
  status: string;
  stream_url: string | null;
};

export type Channel = {
  id: string;
  name: string;
  logo_url: string | null;
  category: string;
  stream_url: string | null;
  sort_order: number;
};

export type Show = {
  id: string;
  title: string;
  description: string | null;
  poster_url: string | null;
  backdrop_url: string | null;
  kind: string;
  genre: string | null;
  year: number | null;
  rating: number | null;
  stream_url: string | null;
};

export type Episode = {
  id: string;
  show_id: string;
  season: number;
  episode_number: number;
  title: string;
  stream_url: string | null;
};

const db = supabase as unknown as {
  from: (table: string) => any;
};

export async function fetchMatches(): Promise<Match[]> {
  const { data, error } = await db.from("matches").select("*").order("kickoff", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Match[];
}

export async function fetchMatch(id: string): Promise<Match> {
  const { data, error } = await db.from("matches").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as Match;
}

export async function fetchChannels(): Promise<Channel[]> {
  const { data, error } = await db
    .from("channels")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Channel[];
}

export async function fetchChannel(id: string): Promise<Channel> {
  const { data, error } = await db.from("channels").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as Channel;
}

export async function fetchShows(kind?: "series" | "movie"): Promise<Show[]> {
  let query = db.from("shows").select("*").order("created_at", { ascending: false });
  if (kind) query = query.eq("kind", kind);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Show[];
}

export async function fetchShow(id: string): Promise<Show> {
  const { data, error } = await db.from("shows").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as Show;
}

export async function fetchEpisodes(showId: string): Promise<Episode[]> {
  const { data, error } = await db
    .from("episodes")
    .select("*")
    .eq("show_id", showId)
    .order("season", { ascending: true })
    .order("episode_number", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Episode[];
}

export const statusLabel = (status: string) =>
  status === "live" ? "مباشر الآن" : status === "ended" ? "انتهت" : "لم تبدأ";

export function formatKickoff(iso: string) {
  return new Intl.DateTimeFormat("ar", {
    hour: "2-digit",
    minute: "2-digit",
    day: "numeric",
    month: "long",
  }).format(new Date(iso));
}

export const DEVELOPER_NAME = "جهاد بطوش";
