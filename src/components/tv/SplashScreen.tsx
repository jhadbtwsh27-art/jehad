import { useEffect, useState } from "react";
import { DEVELOPER_NAME } from "@/lib/tv-data";

export function SplashScreen() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setHidden(true), 2200);
    return () => window.clearTimeout(timer);
  }, []);

  if (hidden) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background transition-opacity duration-500">
      <p className="text-6xl font-black text-primary">شاشتي TV</p>
      <p className="mt-4 text-xl text-muted-foreground">بث مباشر · قنوات · مسلسلات · أفلام</p>
      <div className="mt-12 rounded-2xl border border-primary/40 bg-primary/10 px-10 py-5 text-center">
        <p className="text-sm text-muted-foreground">تطوير</p>
        <p className="text-4xl font-black text-primary">{DEVELOPER_NAME}</p>
      </div>
    </div>
  );
}
