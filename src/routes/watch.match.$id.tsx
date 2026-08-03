import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { TvShell } from "@/components/tv/TvShell";
import { TvPlayer } from "@/components/tv/TvPlayer";
import { fetchMatch, fetchMatches, formatKickoff, statusLabel } from "@/lib/tv-data";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/watch/match/$id")({
  head: () => ({
    meta: [
      { title: "مشاهدة المباراة — شاشتي TV" },
      { name: "description", content: "شاهد المباراة مباشرة مع تفاصيلها وقائمة المباريات الأخرى." },
      { property: "og:title", content: "مشاهدة المباراة — شاشتي TV" },
      { property: "og:description", content: "بث مباشر بنسبة 16:9 مع تحكم كامل بالريموت." },
    ],
  }),
  component: WatchMatch,
});

function WatchMatch() {
  const { id } = Route.useParams();
  const { data: match } = useQuery({ queryKey: ["match", id], queryFn: () => fetchMatch(id) });
  const { data: all } = useQuery({ queryKey: ["matches"], queryFn: fetchMatches });

  return (
    <TvShell>
      <div className="grid grid-cols-[1fr_22rem] gap-8">
        <div>
          <TvPlayer src={match?.stream_url ?? null} title={match?.home_team ?? "مباراة"} />
          <h1 className="mt-6 text-4xl font-black">
            {match ? `${match.home_team} × ${match.away_team}` : "..."}
          </h1>
          {match ? (
            <div className="mt-4 flex flex-wrap gap-3 text-lg text-muted-foreground">
              <span className="rounded-lg bg-card px-4 py-2">{match.competition}</span>
              <span className="rounded-lg bg-card px-4 py-2">{formatKickoff(match.kickoff)}</span>
              <span className="rounded-lg bg-card px-4 py-2">{statusLabel(match.status)}</span>
              {match.commentator ? (
                <span className="rounded-lg bg-card px-4 py-2">تعليق: {match.commentator}</span>
              ) : null}
              {match.channel_name ? (
                <span className="rounded-lg bg-card px-4 py-2">قناة: {match.channel_name}</span>
              ) : null}
            </div>
          ) : null}
        </div>

        <aside className="rounded-2xl border border-border bg-surface p-4">
          <h2 className="mb-4 px-2 text-xl font-bold">مباريات أخرى</h2>
          <div className="flex flex-col gap-2">
            {(all ?? [])
              .filter((m) => m.id !== id)
              .map((m) => (
                <Link
                  key={m.id}
                  to="/watch/match/$id"
                  params={{ id: m.id }}
                  className="tv-focusable-flat rounded-xl px-4 py-3 text-right"
                >
                  <p className="font-bold">
                    {m.home_team} × {m.away_team}
                  </p>
                  <p className="text-sm opacity-70">{formatKickoff(m.kickoff)}</p>
                </Link>
              ))}
          </div>
        </aside>
      </div>
    </TvShell>
  );
}
