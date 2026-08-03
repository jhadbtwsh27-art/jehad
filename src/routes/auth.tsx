import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TvShell, SectionTitle } from "@/components/tv/TvShell";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "تسجيل الدخول — لوحة تحكم شاشتي TV" },
      { name: "description", content: "تسجيل دخول المشرفين لإدارة المباريات والقنوات والمسلسلات." },
      { property: "og:title", content: "تسجيل الدخول — شاشتي TV" },
      { property: "og:description", content: "دخول المشرفين إلى لوحة الإدارة." },
    ],
  }),
  component: AuthPage,
});

const USERNAME_DOMAIN = "app.local";

function toEmail(username: string) {
  return `${username.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "")}@${USERNAME_DOMAIN}`;
}

function AuthPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    const email = toEmail(username);
    let result = await (mode === "login"
      ? supabase.auth.signInWithPassword({ email, password })
      : supabase.auth.signUp({ email, password }));

    // إنشاء الحساب تلقائياً عند أول تسجيل دخول لاسم مستخدم غير موجود
    if (mode === "login" && result.error) {
      const signUp = await supabase.auth.signUp({ email, password });
      if (!signUp.error) {
        result = await supabase.auth.signInWithPassword({ email, password });
      }
    }

    setLoading(false);
    if (result.error) {
      setMessage("اسم المستخدم أو كلمة المرور غير صحيحة");
      return;
    }
    navigate({ to: "/admin" });
  }

  return (
    <TvShell>
      <SectionTitle title="دخول المشرف" subtitle="اسم المستخدم وكلمة المرور فقط" />
      <form onSubmit={submit} className="max-w-xl rounded-2xl border border-border bg-card p-8">
        <label className="mb-2 block text-lg font-bold">اسم المستخدم</label>
        <input
          type="text"
          required
          autoComplete="username"
          dir="ltr"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="tv-focusable mb-6 w-full rounded-xl border border-input bg-background px-4 py-3 text-lg"
        />
        <label className="mb-2 block text-lg font-bold">كلمة المرور</label>
        <input
          type="password"
          required
          autoComplete="current-password"
          dir="ltr"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="tv-focusable mb-6 w-full rounded-xl border border-input bg-background px-4 py-3 text-lg"
        />
        {message ? <p className="mb-4 text-destructive">{message}</p> : null}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="tv-focusable-flat rounded-xl bg-primary px-6 py-3 text-lg font-bold text-primary-foreground"
          >
            {mode === "login" ? "تسجيل الدخول" : "إنشاء حساب"}
          </button>
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="tv-focusable-flat rounded-xl border border-border px-6 py-3 text-lg font-bold"
          >
            {mode === "login" ? "حساب جديد" : "لدي حساب"}
          </button>
        </div>
      </form>
    </TvShell>
  );
}
