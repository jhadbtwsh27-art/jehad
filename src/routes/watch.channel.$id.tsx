import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { TvShell } from "@/components/tv/TvShell";
import { TvPlayer } from "@/components/tv/TvPlayer";
import { fetchChannel, fetchChannels } from "@/lib/tv-data";

export const Route = createFileRoute("/watch/channel/$id")({
  head: () => ({
    meta: [
      { title: "مشاهدة القناة — شاشتي TV" },
      { name: "description", content: "بث مباشر للقنوات مع قائمة تبديل سريعة عبر الريموت." },
      { property: "og:title", content: "مشاهدة القناة — شاشتي TV" },
      { property: "og:description", content: "بدّل بين القنوات بأسهم الريموت أثناء البث." },
    ],
  }),
  component: WatchChannel,
});

function WatchChannel() {
  const { id } = Route.useParams();
  const { data: channel } = useQuery({ queryKey: ["channel", id], queryFn: () => fetchChannel(id) });
  const { data: all } = useQuery({ queryKey: ["channels"], queryFn: fetchChannels });

  return (
    <TvShell>
      <div className="grid grid-cols-[1fr_22rem] gap-8">
        <div>
          <TvPlayer src={channel?.stream_url ?? null} title={channel?.name ?? "قناة"} />
          <h1 className="mt-6 text-4xl font-black">{channel?.name ?? "..."}</h1>
          <p className="mt-2 text-lg text-muted-foreground">{channel?.category}</p>
        </div>
        <aside className="rounded-2xl border border-border bg-surface p-4">
          <h2 className="mb-4 px-2 text-xl font-bold">تبديل القناة</h2>
          <div className="flex flex-col gap-2">
            {(all ?? []).map((c) => (
              <Link
                key={c.id}
                to="/watch/channel/$id"
                params={{ id: c.id }}
                className={`tv-focusable-flat rounded-xl px-4 py-3 text-right font-bold ${
                  c.id === id ? "bg-secondary" : ""
                }`}
              >
                {c.name}
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </TvShell>
  );
}
