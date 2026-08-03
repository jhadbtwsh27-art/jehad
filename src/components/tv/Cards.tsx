import { Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import type { Match, Show, Channel } from "@/lib/tv-data";
import { formatKickoff, statusLabel } from "@/lib/tv-data";

export function MatchCard({ match }: { match: Match }) {
  const live = match.status === "live";
  return (
    <Link
      to="/watch/match/$id"
      params={{ id: match.id }}
      className="tv-focusable block rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]"
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{match.competition}</span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            live ? "live-dot bg-live/15 text-live" : "bg-secondary text-muted-foreground"
          }`}
        >
          {statusLabel(match.status)}
        </span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="flex-1 text-right text-2xl font-bold">{match.home_team}</span>
        <span className="text-lg text-muted-foreground">VS</span>
        <span className="flex-1 text-left text-2xl font-bold">{match.away_team}</span>
      </div>
      <div className="mt-5 flex items-center justify-between text-sm text-muted-foreground">
        <span>{formatKickoff(match.kickoff)}</span>
        <span>{match.channel_name ?? "—"}</span>
      </div>
    </Link>
  );
}

export function PosterCard({ show }: { show: Show }) {
  return (
    <Link
      to="/watch/show/$id"
      params={{ id: show.id }}
      className="tv-focusable block overflow-hidden rounded-2xl border border-border bg-card"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-secondary">
        {show.poster_url ? (
          <img
            src={show.poster_url}
            alt={show.title}
            loading="lazy"
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-5xl font-black text-muted-foreground">
            {show.title.slice(0, 1)}
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="truncate text-lg font-bold">{show.title}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {show.genre ?? "—"} {show.year ? `· ${show.year}` : ""}
        </p>
      </div>
    </Link>
  );
}

export function ChannelCard({ channel }: { channel: Channel }) {
  return (
    <Link
      to="/watch/channel/$id"
      params={{ id: channel.id }}
      className="tv-focusable flex aspect-video flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card p-4 text-center"
    >
      {channel.logo_url ? (
        <img src={channel.logo_url} alt={channel.name} className="h-12 object-contain" />
      ) : (
        <Play className="size-8 text-primary" />
      )}
      <p className="text-xl font-bold">{channel.name}</p>
      <p className="text-sm text-muted-foreground">{channel.category}</p>
    </Link>
  );
}
