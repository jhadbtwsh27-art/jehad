import { Link, useRouterState } from "@tanstack/react-router";
import { Radio, Tv, Clapperboard, Film, Settings, Info } from "lucide-react";
import type { ReactNode } from "react";
import { DEVELOPER_NAME } from "@/lib/tv-data";

const NAV = [
  { to: "/", label: "المباريات المباشرة", icon: Radio },
  { to: "/channels", label: "القنوات", icon: Tv },
  { to: "/series", label: "المسلسلات", icon: Clapperboard },
  { to: "/movies", label: "الأفلام", icon: Film },
  { to: "/about", label: "حول التطبيق", icon: Info },
  { to: "/admin", label: "لوحة التحكم", icon: Settings },
] as const;

export function TvShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="sticky top-0 flex h-screen w-72 shrink-0 flex-col justify-between border-l border-border bg-surface px-5 py-8">
        <div>
          <div className="mb-10 px-2">
            <p className="text-3xl font-extrabold text-primary">شاشتي TV</p>
            <p className="mt-1 text-sm text-muted-foreground">بث مباشر · مسلسلات · أفلام</p>
          </div>
          <nav className="flex flex-col gap-2">
            {NAV.map((item) => {
              const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`tv-focusable-flat flex items-center gap-3 rounded-xl px-4 py-3 text-lg font-semibold ${
                    active
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <item.icon className="size-6 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">تطوير</p>
          <p className="text-lg font-bold text-primary">{DEVELOPER_NAME}</p>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-10 py-8">{children}</main>
    </div>
  );
}

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-4xl font-extrabold tracking-tight">{title}</h1>
      {subtitle ? <p className="mt-2 text-lg text-muted-foreground">{subtitle}</p> : null}
    </div>
  );
}
