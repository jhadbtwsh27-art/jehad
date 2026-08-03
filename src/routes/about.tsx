import { createFileRoute, Link } from "@tanstack/react-router";
import { TvShell, SectionTitle } from "@/components/tv/TvShell";
import { DEVELOPER_NAME } from "@/lib/tv-data";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: `حول التطبيق — تطوير ${DEVELOPER_NAME}` },
      { name: "description", content: "معلومات عن تطبيق شاشتي TV المخصص لشاشات Android TV والتحكم بالريموت." },
      { property: "og:title", content: "حول تطبيق شاشتي TV" },
      { property: "og:description", content: `تطبيق تلفزيون ذكي عربي من تطوير ${DEVELOPER_NAME}.` },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <TvShell>
      <SectionTitle title="حول التطبيق" />
      <div className="max-w-3xl rounded-2xl border border-border bg-card p-8">
        <p className="text-2xl font-bold">شاشتي TV</p>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          تطبيق مخصص لشاشات Android TV بواجهة Leanback عربية بالكامل واتجاه من اليمين لليسار،
          مُحسّن للتحكم عبر أسهم الريموت والزر المركزي (D-Pad) دون الحاجة إلى مؤشر فأرة.
        </p>
        <div className="mt-8 rounded-xl border border-primary/40 bg-primary/10 px-6 py-5">
          <p className="text-sm text-muted-foreground">المطور</p>
          <p className="text-3xl font-black text-primary">{DEVELOPER_NAME}</p>
        </div>
        <Link
          to="/"
          className="tv-focusable-flat mt-8 inline-flex rounded-xl border border-border px-6 py-3 text-lg font-bold"
        >
          العودة للرئيسية
        </Link>
      </div>
    </TvShell>
  );
}
