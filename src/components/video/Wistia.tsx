"use client";

import useWistiaPlayer from "@/hooks/useWistiaPlayer";
import React from "react";

import "./style.css";

export default function Wistia({
  wistiaId,
  showPlayButton = true,
  id,
}: {
  wistiaId: string;
  showPlayButton?: boolean;
  id: string
}) {
  const { playAndEnterFullscreenFromGesture, setIsFullscreen, wistiaVideoEl } =
    useWistiaPlayer({ wistiaId, id });

  return (
    <div
      className="min-h-screen bg-black landscape-mode relative"
      id="wistia-video-mobile-fullscreen"
    >
      <div
        ref={wistiaVideoEl}
        id={id}
        className={`wistia_embed wistia_async_${wistiaId}`}
        style={{
          width: "100vw",
          height: "100vh",
        }}
        data-autoplay="true"
        data-muted="false"
        data-video-foam="true"
        data-fitStrategy="cover"
        data-playsinline="true"
        data-webkit-playsinline="true"
      />

      {showPlayButton && (
        <button
          onClick={() => {
            if (playAndEnterFullscreenFromGesture()) {
              setIsFullscreen(true);
              return;
            }

            const wistiaWindow = window as Window & {
              Wistia?: {
                api: (id: string) => {
                  play?: () => void;
                  requestFullscreen?: () => void;
                };
              };
            };
            const wv = wistiaWindow.Wistia?.api?.("avj1qhbupb");
            try {
              wv?.play?.();
              wv?.requestFullscreen?.();
              setIsFullscreen(true);
              return;
            } catch (e) {
              console.warn("Wistia play/requestFullscreen falhou:", e);
            }
          }}
          className="absolute w-full top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-50 bg-black/70 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-black/90 transition"
        >
          <svg
            x="0px"
            y="0px"
            viewBox="0 0 125 80"
            enable-background="new 0 0 125 80"
            aria-hidden="true"
            style={{
              fill: "rgb(255, 255, 255)",
              height: "88.3333px",
              left: "0px",
              strokeWidth: "0px",
              top: "0px",
              width: "100%",
              position: "absolute",
            }}
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              fill="#FFFFFF"
              opacity="1"
              transform="translate(44, 22)"
              d="M12.138 2.173C10.812 1.254 9 2.203 9 3.817v28.366c0 1.613 1.812 2.563 3.138 1.644l20.487-14.183a2 2 0 0 0 0-3.288L12.138 2.173Z"
            ></path>
          </svg>
        </button>
      )}
    </div>
  );
}
