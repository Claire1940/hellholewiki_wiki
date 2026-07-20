"use client";

import { useEffect, useRef, useState } from "react";
import { Play, ExternalLink } from "lucide-react";

interface VideoFeatureProps {
  videoId: string;
  title: string;
}

/**
 * 视频区域：进入视口时自动加载播放（autoplay + mute + loop），
 * 同时保留点击播放按钮作为手动后备。
 */
export function VideoFeature({ videoId, title }: VideoFeatureProps) {
  const [active, setActive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  // loop 需要 playlist 参数等于同一个 videoId 才能在嵌入播放器中生效
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playsinline=1&rel=0&playlist=${videoId}`;
  const thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  useEffect(() => {
    const node = containerRef.current;
    if (!node || active) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [active]);

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-lg bg-black"
        style={{ paddingBottom: "56.25%" }}
      >
        {active ? (
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setActive(true)}
            className="absolute inset-0 h-full w-full group"
            aria-label={`Play video: ${title}`}
          >
            <img
              src={thumbnail}
              alt={title}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
            <span className="absolute inset-0 bg-black/40 transition-colors group-hover:bg-black/30" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--nav-theme))] shadow-lg transition-colors group-hover:bg-[hsl(var(--nav-theme)/0.9)] md:h-20 md:w-20">
                <Play
                  className="ml-1 h-7 w-7 text-white md:h-9 md:w-9"
                  fill="currentColor"
                />
              </span>
            </span>
          </button>
        )}
      </div>

      <div className="flex justify-center">
        <a
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
        >
          Watch on YouTube
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
