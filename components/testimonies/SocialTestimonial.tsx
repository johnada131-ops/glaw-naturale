"use client";

import { useEffect, useRef } from "react";

type SocialTestimonialProps = {
  mediaType: "instagram" | "facebook" | "tiktok" | "youtube";
  mediaUrl: string;
};

function getYouTubeId(url: string) {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.slice(1);
    }

    if (parsed.hostname.includes("youtube.com")) {
      if (parsed.pathname === "/watch") {
        return parsed.searchParams.get("v");
      }

      if (parsed.pathname.startsWith("/shorts/")) {
        return parsed.pathname.split("/shorts/")[1]?.split("/")[0];
      }

      if (parsed.pathname.startsWith("/embed/")) {
        return parsed.pathname.split("/embed/")[1]?.split("/")[0];
      }
    }

    return null;
  } catch {
    return null;
  }
}

function getTikTokId(url: string) {
  const match = url.match(/\/video\/(\d+)/);
  return match?.[1] ?? null;
}

export default function SocialTestimonial({
  mediaType,
  mediaUrl,
}: SocialTestimonialProps) {
  const embedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!embedRef.current) return;

    const loadScript = (
      src: string,
      id: string,
      callback?: () => void
    ) => {
      const existing = document.getElementById(id);

      if (existing) {
        callback?.();
        return;
      }

      const script = document.createElement("script");
      script.id = id;
      script.src = src;
      script.async = true;

      script.onload = () => {
        callback?.();
      };

      document.body.appendChild(script);
    };

    /*
     * INSTAGRAM
     */
    if (mediaType === "instagram") {
      loadScript(
        "https://www.instagram.com/embed.js",
        "instagram-embed-script",
        () => {
          const instagram = (
            window as typeof window & {
              instgrm?: {
                Embeds?: {
                  process: () => void;
                };
              };
            }
          ).instgrm;

          instagram?.Embeds?.process();
        }
      );
    }

    /*
     * FACEBOOK
     */
    if (mediaType === "facebook") {
      loadScript(
        "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v26.0",
        "facebook-jssdk",
        () => {
          const FB = (
            window as typeof window & {
              FB?: {
                XFBML?: {
                  parse: (element?: HTMLElement) => void;
                };
              };
            }
          ).FB;

          FB?.XFBML?.parse(embedRef.current!);
        }
      );
    }

    /*
     * TIKTOK
     */
    if (mediaType === "tiktok") {
      loadScript(
        "https://www.tiktok.com/embed.js",
        "tiktok-embed-script",
        () => {
          const tiktok = (
            window as typeof window & {
              tiktok?: {
                reload?: () => void;
              };
            }
          ).tiktok;

          tiktok?.reload?.();
        }
      );
    }
  }, [mediaType, mediaUrl]);

  /*
   * YOUTUBE
   */
  if (mediaType === "youtube") {
    const videoId = getYouTubeId(mediaUrl);

    if (!videoId) {
      return (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          Invalid YouTube video URL.
        </div>
      );
    }

    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?playsinline=1&rel=0`}
          title="GLAW Naturale testimonial video"
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  /*
   * INSTAGRAM
   */
  if (mediaType === "instagram") {
    return (
      <div
        ref={embedRef}
        className="flex w-full justify-center overflow-hidden rounded-2xl"
      >
        <blockquote
          className="instagram-media"
          data-instgrm-permalink={mediaUrl}
          data-instgrm-version="14"
          style={{
            background: "#FFF",
            border: 0,
            borderRadius: "12px",
            margin: 0,
            maxWidth: "540px",
            minWidth: "326px",
            padding: 0,
            width: "100%",
          }}
        />
      </div>
    );
  }

  /*
   * FACEBOOK
   */
  if (mediaType === "facebook") {
    return (
      <div
        ref={embedRef}
        className="flex w-full justify-center overflow-hidden rounded-2xl"
      >
        <div
          className="fb-post"
          data-href={mediaUrl}
          data-width="500"
        />
      </div>
    );
  }

  /*
   * TIKTOK
   */
  if (mediaType === "tiktok") {
    const videoId = getTikTokId(mediaUrl);

    if (!videoId) {
      return (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          Invalid TikTok video URL.
        </div>
      );
    }

    return (
      <div className="flex w-full justify-center overflow-hidden rounded-2xl">
        <iframe
          src={`https://www.tiktok.com/player/v1/${videoId}?description=1&music_info=1&rel=0`}
          className="w-full max-w-[605px]"
          style={{
            height: "720px",
            border: "none",
          }}
          allow="fullscreen"
          title="GLAW Naturale TikTok testimonial"
        />
      </div>
    );
  }

  return null;
}