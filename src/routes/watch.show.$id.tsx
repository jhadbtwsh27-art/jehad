import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { TvShell } from "@/components/tv/TvShell";
import { TvPlayer } from "@/components/tv/TvPlayer";
import { fetchEpisodes, fetchShow } from "@/lib/tv-data";

export const Route = createFileRoute("/watch/show/$id")({
  head: () => ({
    meta: [
      { title: "المشاهدة — مسلسلات وأفلام شاشتي TV" },
      { name: "description", content: "شغّل الحلقات والأفلام مع قائمة مواسم قابلة للتنقل بالريموت." },
      { property: "og:title", content: "المشاهدة — شاشتي TV" },
      { property: "og:description", content: "مشغّل 16:9 مع لوحة مواسم وحلقات." },
    ],
  }),
  component: WatchShow,
});

function WatchShow() {
  const { id } = Route.useParams();
  const { data: show } = useQuery({ queryKey: ["show", id], queryFn: () => fetchShow(id) });
  const { data: episodes } = useQuery({
    queryKey: ["episodes", id],
    queryFn: () => fetchEpisodes(id),
  });
  const [currentId, setCurrentId] = useState<string | null>(null);

  const list = episodes ?? [];
  const current = list.find((e) => e.id === currentId) ?? list[0];
  const src = show?.kind === "movie" ? (show.stream_url ?? null) : (current?.stream_url ?? null);
  const seasons = Array.from(new Set(list.map((e) => e.season))).sort((a, b) => a - b);

  return (
    <TvShell>
      <div className="grid grid-cols-[1fr_22rem] gap-8">
        <div>
          <TvPlayer src={src} title={show?.title ?? "مشاهدة"} />
          <h1 className="mt-6 text-4xl font-black">{show?.title ?? "..."}</h1>
          {current && show?.kind !== "movie" ? (
            <p className="mt-2 text-xl text-primary">
              الموسم {current.season} — {current.title}
            </p>
          ) : null}
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted-foreground">
            {show?.description}
          </p>
        </div>

        <aside className="rounded-2xl border border-border bg-surface p-4">
          <h2 className="mb-4 px-2 text-xl font-bold">
            {show?.kind === "movie" ? "معلومات" : "المواسم والحلقات"}
          </h2>
          {show?.kind === "movie" ? (
            <div className="px-2 text-muted-foreground">
              <p>النوع: {show.genre ?? "—"}</p>
              <p>السنة: {show.year ?? "—"}</p>
              <p>التقييم: {show.rating ?? "—"}</p>
            </div>
          ) : (
            seasons.map((season) => (
              <div key={season} className="mb-4">
                <p className="mb-2 px-2 text-sm font-bold text-primary">الموسم {season}</p>
                <div className="flex flex-col gap-2">
                  {list
                    .filter((e) => e.season === season)
                    .map((ep) => (
                      <button
                        key={ep.id}
                        onClick={() => setCurrentId(ep.id)}
                        className={`tv-focusable-flat rounded-xl px-4 py-3 text-right ${
                          current?.id === ep.id ? "bg-secondary" : ""
                        }`}
                      >
                        <span className="font-bold">
                          {ep.episode_number}. {ep.title}
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            ))
          )}
        </aside>
      </div>
    </TvShell>
  );
}
