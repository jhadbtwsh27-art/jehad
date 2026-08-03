import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { TvShell, SectionTitle } from "@/components/tv/TvShell";
import { ChannelCard } from "@/components/tv/Cards";
import { fetchChannels } from "@/lib/tv-data";

export const Route = createFileRoute("/channels")({
  head: () => ({
    meta: [
      { title: "القنوات المباشرة — شاشتي TV" },
      { name: "description", content: "قنوات رياضية وترفيهية وإخبارية للبث المباشر على شاشة التلفزيون." },
      { property: "og:title", content: "القنوات المباشرة — شاشتي TV" },
      { property: "og:description", content: "تصفح القنوات وشغّلها بالريموت مباشرة." },
    ],
  }),
  component: ChannelsPage,
});

function ChannelsPage() {
  const { data } = useQuery({ queryKey: ["channels"], queryFn: fetchChannels });
  const channels = data ?? [];
  const categories = Array.from(new Set(channels.map((c) => c.category)));

  return (
    <TvShell>
      <SectionTitle title="القنوات" subtitle="استخدم أسهم الريموت للتنقل والزر المركزي للتشغيل" />
      {categories.map((category) => (
        <section key={category} className="mb-10">
          <h2 className="mb-4 text-2xl font-bold text-primary">{category}</h2>
          <div className="grid grid-cols-3 gap-6 xl:grid-cols-5">
            {channels
              .filter((c) => c.category === category)
              .map((channel) => (
                <ChannelCard key={channel.id} channel={channel} />
              ))}
          </div>
        </section>
      ))}
    </TvShell>
  );
}
