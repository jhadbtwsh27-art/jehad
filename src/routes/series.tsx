import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { TvShell, SectionTitle } from "@/components/tv/TvShell";
import { PosterCard } from "@/components/tv/Cards";
import { fetchShows } from "@/lib/tv-data";

export const Route = createFileRoute("/series")({
  head: () => ({
    meta: [
      { title: "المسلسلات — شاشتي TV" },
      { name: "description", content: "مسلسلات عربية بجودة عالية مع قوائم مواسم وحلقات تعمل بالريموت." },
      { property: "og:title", content: "المسلسلات — شاشتي TV" },
      { property: "og:description", content: "تصفح المواسم والحلقات بواجهة مخصصة للتلفزيون." },
    ],
  }),
  component: SeriesPage,
});

function SeriesPage() {
  const { data } = useQuery({ queryKey: ["shows", "series"], queryFn: () => fetchShows("series") });
  return (
    <TvShell>
      <SectionTitle title="المسلسلات" subtitle="اختر مسلسلاً لعرض المواسم والحلقات" />
      <div className="grid grid-cols-4 gap-6 xl:grid-cols-6">
        {(data ?? []).map((show) => (
          <PosterCard key={show.id} show={show} />
        ))}
      </div>
    </TvShell>
  );
}
