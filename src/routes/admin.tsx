import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2, Plus, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TvShell, SectionTitle } from "@/components/tv/TvShell";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "لوحة التحكم — إدارة محتوى شاشتي TV" },
      { name: "description", content: "إضافة وتعديل وحذف المباريات والقنوات والمسلسلات والحلقات وروابط المشغلات." },
      { property: "og:title", content: "لوحة التحكم — شاشتي TV" },
      { property: "og:description", content: "إدارة كاملة لمحتوى تطبيق التلفزيون." },
    ],
  }),
  component: AdminPage,
});

type FieldDef = { key: string; label: string; type?: "text" | "number" };

const TABLES: Record<
  string,
  { label: string; fields: FieldDef[]; title: (row: any) => string; order: string }
> = {
  matches: {
    label: "المباريات",
    order: "kickoff",
    title: (r) => `${r.home_team} × ${r.away_team}`,
    fields: [
      { key: "home_team", label: "الفريق الأول" },
      { key: "away_team", label: "الفريق الثاني" },
      { key: "competition", label: "البطولة" },
      { key: "commentator", label: "المعلق" },
      { key: "channel_name", label: "القناة" },
      { key: "kickoff", label: "موعد المباراة (ISO)" },
      { key: "status", label: "الحالة (live/upcoming/ended)" },
      { key: "stream_url", label: "رابط المشغل" },
    ],
  },
  channels: {
    label: "القنوات",
    order: "sort_order",
    title: (r) => r.name,
    fields: [
      { key: "name", label: "اسم القناة" },
      { key: "category", label: "التصنيف" },
      { key: "logo_url", label: "رابط الشعار" },
      { key: "stream_url", label: "رابط البث" },
      { key: "sort_order", label: "الترتيب", type: "number" },
    ],
  },
  shows: {
    label: "المسلسلات والأفلام",
    order: "title",
    title: (r) => r.title,
    fields: [
      { key: "title", label: "العنوان" },
      { key: "kind", label: "النوع (series/movie)" },
      { key: "genre", label: "التصنيف" },
      { key: "year", label: "السنة", type: "number" },
      { key: "rating", label: "التقييم", type: "number" },
      { key: "poster_url", label: "رابط البوستر" },
      { key: "description", label: "الوصف" },
      { key: "stream_url", label: "رابط المشغل (للأفلام)" },
    ],
  },
  episodes: {
    label: "الحلقات",
    order: "season",
    title: (r) => `${r.title} (م${r.season} ح${r.episode_number})`,
    fields: [
      { key: "show_id", label: "معرّف المسلسل (UUID)" },
      { key: "season", label: "الموسم", type: "number" },
      { key: "episode_number", label: "رقم الحلقة", type: "number" },
      { key: "title", label: "عنوان الحلقة" },
      { key: "stream_url", label: "رابط المشغل" },
    ],
  },
};

const db = supabase as unknown as { from: (t: string) => any };

function AdminPage() {
  const [session, setSession] = useState<"loading" | "out" | "in">("loading");
  const [isAdmin, setIsAdmin] = useState(false);
  const [table, setTable] = useState<keyof typeof TABLES>("matches");
  const [form, setForm] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!active) return;
      if (!data.user) {
        setSession("out");
        return;
      }
      setSession("in");
      const { data: roles } = await db
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id);
      setIsAdmin(Boolean(roles?.some((r: { role: string }) => r.role === "admin")));
    });
    return () => {
      active = false;
    };
  }, []);

  const config = TABLES[table]!;
  const rows = useQuery({
    queryKey: ["admin", table],
    enabled: session === "in",
    queryFn: async () => {
      const { data, error: err } = await db.from(table).select("*").order(config.order);
      if (err) throw err;
      return (data ?? []) as any[];
    },
  });

  async function addRow(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const payload: Record<string, unknown> = {};
    for (const field of config.fields) {
      const value = form[field.key];
      if (value === undefined || value === "") continue;
      payload[field.key] = field.type === "number" ? Number(value) : value;
    }
    const { error: err } = await db.from(table).insert(payload);
    if (err) {
      setError(err.message);
      return;
    }
    setForm({});
    queryClient.invalidateQueries({ queryKey: ["admin", table] });
  }

  async function updateField(id: string, key: string, value: string, type?: string) {
    const { error: err } = await db
      .from(table)
      .update({ [key]: type === "number" ? Number(value) : value })
      .eq("id", id);
    if (err) setError(err.message);
    else queryClient.invalidateQueries({ queryKey: ["admin", table] });
  }

  async function removeRow(id: string) {
    const { error: err } = await db.from(table).delete().eq("id", id);
    if (err) setError(err.message);
    else queryClient.invalidateQueries({ queryKey: ["admin", table] });
  }

  if (session === "loading") {
    return (
      <TvShell>
        <p className="text-xl text-muted-foreground">جارٍ التحميل…</p>
      </TvShell>
    );
  }

  if (session === "out") {
    return (
      <TvShell>
        <SectionTitle title="لوحة التحكم" subtitle="يلزم تسجيل الدخول للمتابعة" />
        <Link
          to="/auth"
          className="tv-focusable-flat inline-flex rounded-xl bg-primary px-6 py-3 text-lg font-bold text-primary-foreground"
        >
          تسجيل الدخول
        </Link>
      </TvShell>
    );
  }

  return (
    <TvShell>
      <SectionTitle title="لوحة التحكم" subtitle="إضافة وتعديل وحذف محتوى التطبيق" />

      {!isAdmin ? (
        <p className="mb-6 rounded-xl border border-destructive/40 bg-destructive/10 px-5 py-4 text-lg">
          حسابك غير مُصنّف كمدير، لذلك ستفشل عمليات الحفظ. اطلب من مالك التطبيق منحك صلاحية
          «admin».
        </p>
      ) : null}

      <div className="mb-8 flex flex-wrap gap-3">
        {Object.entries(TABLES).map(([key, value]) => (
          <button
            key={key}
            onClick={() => setTable(key as keyof typeof TABLES)}
            className={`tv-focusable-flat rounded-xl border border-border px-5 py-3 text-lg font-bold ${
              key === table ? "bg-secondary" : ""
            }`}
          >
            {value.label}
          </button>
        ))}
        <button
          onClick={() => rows.refetch()}
          className="tv-focusable-flat rounded-xl border border-border px-5 py-3 text-lg font-bold"
        >
          <RefreshCw className="size-5" />
        </button>
      </div>

      {error ? <p className="mb-6 text-destructive">{error}</p> : null}

      <form onSubmit={addRow} className="mb-10 rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 text-2xl font-bold">إضافة عنصر جديد</h2>
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
          {config.fields.map((field) => (
            <label key={field.key} className="block">
              <span className="mb-1 block text-sm text-muted-foreground">{field.label}</span>
              <input
                type={field.type === "number" ? "number" : "text"}
                value={form[field.key] ?? ""}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                className="tv-focusable w-full rounded-xl border border-input bg-background px-4 py-2.5"
              />
            </label>
          ))}
        </div>
        <button
          type="submit"
          className="tv-focusable-flat mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-lg font-bold text-primary-foreground"
        >
          <Plus className="size-5" /> إضافة
        </button>
      </form>

      <div className="flex flex-col gap-4">
        {(rows.data ?? []).map((row) => (
          <div key={row.id} className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xl font-bold">{config.title(row)}</p>
              <button
                onClick={() => removeRow(row.id)}
                className="tv-focusable-flat rounded-xl border border-destructive/50 px-4 py-2 text-destructive"
              >
                <Trash2 className="size-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
              {config.fields.map((field) => (
                <label key={field.key} className="block">
                  <span className="mb-1 block text-sm text-muted-foreground">{field.label}</span>
                  <input
                    type={field.type === "number" ? "number" : "text"}
                    defaultValue={row[field.key] ?? ""}
                    onBlur={(e) => {
                      if (e.target.value !== String(row[field.key] ?? "")) {
                        updateField(row.id, field.key, e.target.value, field.type);
                      }
                    }}
                    className="tv-focusable w-full rounded-xl border border-input bg-background px-4 py-2.5"
                  />
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </TvShell>
  );
}
