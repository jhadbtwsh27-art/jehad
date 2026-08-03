import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { PlayCircle } from "lucide-react";
import { TvShell, SectionTitle } from "@/components/tv/TvShell";
import { MatchCard, PosterCard } from "@/components/tv/Cards";
import { fetchMatches, fetchShows, formatKickoff, DEVELOPER_NAME } from "@/lib/tv-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "شاشتي TV — مباريات مباشرة وقنوات ومسلسلات على شاشتك" },
      {
        name: "description",
        content:
          "تطبيق Android TV عربي بواجهة Leanback للتحكم بالريموت: مباريات مباشرة، قنوات، مسلسلات وأفلام.",
      },
      { property: "og:title", content: "شاشتي TV — بث مباشر على شاشة التلفزيون" },
      {
        property: "og:description",
        content: "واجهة عربية RTL مخصصة للشاشات الذكية والتحكم عبر D-Pad.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const matches = useQuery({ queryKey: ["matches"], queryFn: fetchMatches });
  const shows = useQuery({ queryKey: ["shows"], queryFn: () => fetchShows() });

  const list = matches.data ?? [];
  const featured = list.find((m) => m.status === "live") ?? list[0];

  return (
    <TvShell>
      <div className="mb-8 flex items-center justify-between">
        <SectionTitle title="المباريات المباشرة" subtitle="اختر مباراة وابدأ المشاهدة فوراً" />
        <span className="rounded-xl border border-border bg-card px-4 py-2 text-sm text-muted-foreground">
          تطوير <span className="font-bold text-primary">{DEVELOPER_NAME}</span>
        </span>
      </div>

      {featured ? (
        <Link
          to="/watch/match/$id"
          params={{ id: featured.id }}
          className="tv-focusable mb-10 flex items-center justify-between gap-8 rounded-3xl border border-primary/30 bg-gradient-to-l from-card to-surface p-10"
        >
          <div>
            <span className="live-dot rounded-full bg-live/15 px-3 py-1 text-sm font-bold text-live">
              {featured.status === "live" ? "مباشر الآن" : "المباراة القادمة"}
            </span>
            <h2 className="mt-4 text-5xl font-black">
              {featured.home_team} <span className="text-primary">×</span> {featured.away_team}
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">
              {featured.competition} · {formatKickoff(featured.kickoff)}
              {featured.commentator ? ` · تعليق ${featured.commentator}` : ""}
            </p>
          </div>
          <PlayCircle className="size-24 shrink-0 text-primary" />
        </Link>
      ) : null}

      <div className="grid grid-cols-2 gap-6 xl:grid-cols-3">
        {list.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>

      <h2 className="mt-14 mb-6 text-3xl font-extrabold">أحدث الأعمال</h2>
      <div className="grid grid-cols-4 gap-6 xl:grid-cols-6">
        {(shows.data ?? []).map((show) => (
          <PosterCard key={show.id} show={show} />
        ))}
      </div>
    </TvShell>
  );
}
