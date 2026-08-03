import { useRef } from "react";

export function TvPlayer({ src, title }: { src: string | null; title: string }) {
  const ref = useRef<HTMLIFrameElement>(null);

  if (!src) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-2xl border border-border bg-card text-xl text-muted-foreground">
        لا يوجد رابط مشغل متاح حالياً
      </div>
    );
  }

  return (
    <div className="tv-focusable overflow-hidden rounded-2xl border border-border bg-black" tabIndex={0}>
      <iframe
        ref={ref}
        src={src}
        title={title}
        className="aspect-video w-full"
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
