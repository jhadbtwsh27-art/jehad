import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { TvShell, SectionTitle } from "@/components/tv/TvShell";
import { PosterCard } from "@/components/tv/Cards";
import { fetchShows } from "@/lib/tv-data";

export const Route = createFileRoute("/movies")({
  head: () => ({
    meta: [
      { title: "الأفلام — شاشتي TV" },
      { name: "description", content: "مكتبة أفلام عربية وعالمية للمشاهدة على شاشة التلفزيون بالريموت." },
      { property: "og:title", content: "الأفلام — شاشتي TV" },
      { property: "og:description", content: "شغّل الأفلام مباشرة بواجهة Leanback عربية." },
    ],
  }),
  component: MoviesPage,
});

function MoviesPage() {
  const { data } = useQuery({ queryKey: ["shows", "movie"], queryFn: () => fetchShows("movie") });
  return (
    <TvShell>
      <SectionTitle title="الأفلام" subtitle="اضغط الزر المركزي لبدء التشغيل" />
      <div className="grid grid-cols-4 gap-6 xl:grid-cols-6">
        {(data ?? []).map((show) => (
          <PosterCard key={show.id} show={show} />
        ))}
      </div>
    </TvShell>
  );
}
