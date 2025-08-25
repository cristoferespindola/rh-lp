"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { TurnOnPhone } from "@/components/svg/TurnOnPhone";
import VideoActions from "@/components/videoActions";
import StaticTurnOn from "@/components/video/StaticTurnOn";

export default function VimeoPage() {
  const [isMobile, setIsMobile] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [showTapToPlay, setShowTapToPlay] = useState(false);
  const [showCTA, setShowCTA] = useState(false);
  const [ctaShown, setCtaShown] = useState(false);
  const playerRef = useRef<HTMLIFrameElement>(null);
  const [player, setPlayer] = useState<{
    pause: () => Promise<void>;
    play: () => Promise<void>;
    requestFullscreen?: () => Promise<void>;
    on: (event: string, callback: (data: { seconds: number }) => void) => void;
  } | null>(null);

  const MOBILE_MAX_WIDTH = 1024;
  const CTA_TIME_SECONDS = 150; // 2:30

  const tryMinimizeBars = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      setTimeout(() => window.scrollTo(0, 1), 200);
    }
  };

  const isPortrait = () => window.matchMedia("(orientation: portrait)").matches;
  const isMobileish = () => window.innerWidth <= MOBILE_MAX_WIDTH;

  const requestFullscreenSafely = async () => {
    try {
      if (player && player.requestFullscreen) {
        await player.requestFullscreen();
      } else if (playerRef.current && playerRef.current.requestFullscreen) {
        await playerRef.current.requestFullscreen();
      }
    } catch (e) {
      console.log("Fullscreen failed:", e);
    }
  };

  const showRotateIfNeeded = useCallback(() => {
    const mobile = isMobileish();
    const portrait = isPortrait();

    setIsMobile(mobile);
    setIsLandscape(!portrait);

    if (mobile && portrait) {
      // Mobile portrait: show rotate message
      setShowTapToPlay(false);
      if (player) {
        player.pause().catch(() => {});
      }
    } else if (mobile && !portrait) {
      // Mobile landscape: show tap to play
      setShowTapToPlay(true);
    } else {
      // Desktop: auto play
      setShowTapToPlay(false);
      if (player) {
        player.play().catch(() => {});
      }
    }
  }, [player]);

  const handlePlayClick = async () => {
    setShowTapToPlay(false);
    tryMinimizeBars();
    await requestFullscreenSafely();
    try {
      if (player) {
        await player.play();
      }
    } catch (e) {
      console.log("Play failed:", e);
    }
  };

  useEffect(() => {
    // Load Vimeo Player API
    const script = document.createElement("script");
    script.src = "https://player.vimeo.com/api/player.js";
    script.async = true;
    script.onload = () => {
      if (playerRef.current && window.Vimeo) {
        const vimeoPlayer = new window.Vimeo.Player(playerRef.current);
        setPlayer(vimeoPlayer);

        // Listen for timeupdate to show CTA and pause video
        vimeoPlayer.on("timeupdate", (data: { seconds: number }) => {
          if (!ctaShown && data.seconds >= CTA_TIME_SECONDS) {
            setCtaShown(true);
            setShowCTA(true);
            // Pause the video at 2:30
            vimeoPlayer.pause().catch(() => {});
          }
        });

        // Show CTA if video ends before timestamp
        vimeoPlayer.on("ended", () => {
          if (!ctaShown) {
            setShowCTA(true);
          }
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [ctaShown]);

  useEffect(() => {
    showRotateIfNeeded();

    const handleOrientationChange = () => {
      setTimeout(showRotateIfNeeded, 300);
    };

    window.addEventListener("orientationchange", handleOrientationChange);
    window.addEventListener("resize", showRotateIfNeeded);

    // Keyboard escape closes CTA
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowCTA(false);
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("orientationchange", handleOrientationChange);
      window.removeEventListener("resize", showRotateIfNeeded);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [player, showRotateIfNeeded]);

  return (
    <div className="app">
      {/* Main Video Player */}
      <div className="player-wrap">
        <iframe
          ref={playerRef}
          src="https://player.vimeo.com/video/1112605590?autopause=1&muted=0&controls=0&title=0&byline=0&portrait=0&dnt=1&transparent=0"
          //   src="https://player.vimeo.com/video/1112605590?autopause=1&title=0&byline=0&portrait=0&dnt=1&transparent=0"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="vimeo-iframe"
        />
      </div>

      {/* Rotate Overlay for Mobile Portrait */}
      {isMobile && !isLandscape && (
        <div className="rotate-overlay visible">
          <div className="rotate-card">
            <StaticTurnOn />
          </div>
        </div>
      )}

      {/* Tap to Play Overlay for Mobile Landscape */}
      {showTapToPlay && (
        <div className="tap-to-play visible">
          <button className="play-btn" onClick={handlePlayClick} type="button">
            TAP TO ENTER EXPERIENCE
          </button>
        </div>
      )}

      {/* CTA Overlay at 2:31 */}
      {showCTA && (
        <div
          className="cta-slate visible"
          onClick={e => {
            if (e.target === e.currentTarget) {
              setShowCTA(false);
            }
          }}
        >
          <div className="cta-inner">
            <VideoActions onClose={() => setShowCTA(false)} />
          </div>
        </div>
      )}

      <style jsx>{`
        .app {
          position: relative;
          width: 100%;
          height: 100dvh;
          overflow: hidden;
          background: #000;
        }

        .player-wrap {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          background: #000;
        }

        .vimeo-iframe {
          width: 100%;
          height: 100%;
          border: 0;
          background: #000;
        }

        .rotate-overlay {
          position: absolute;
          inset: 0;
          background: #000;
          display: none;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 24px;
          gap: 20px;
          z-index: 10;
          color: #f5f5f5;
        }

        .rotate-overlay.visible {
          display: flex;
        }

        .rotate-card {
          max-width: 720px;
          width: 100%;
        }

        .rotate-title {
          font-size: clamp(22px, 4vw, 36px);
          letter-spacing: 0.12em;
          font-family: ui-serif, "Times New Roman", Times, serif;
        }

        .rotate-sub {
          margin-top: 8px;
          opacity: 0.8;
          font-size: clamp(14px, 2.5vw, 18px);
          font-family: ui-serif, "Times New Roman", Times, serif;
        }

        .tap-to-play {
          position: absolute;
          inset: 0;
          display: none;
          place-items: center;
          z-index: 11;
          background: rgba(0, 0, 0, 0.6);
        }

        .tap-to-play.visible {
          display: grid;
        }

        .play-btn {
          border: 1px solid #777;
          color: #fff;
          background: transparent;
          padding: 14px 28px;
          font-size: clamp(14px, 2.6vw, 18px);
          letter-spacing: 0.15em;
          cursor: pointer;
          font-family: ui-serif, "Times New Roman", Times, serif;
        }

        .cta-slate {
          position: absolute;
          inset: 0;
          display: none;
          background: rgba(0, 0, 0, 0.95);
          z-index: 12;
          align-items: center;
          justify-content: center;
          color: #f5f5f5;
        }

        .cta-slate.visible {
          display: flex;
        }

        .cta-inner {
          width: min(780px, 92vw);
          margin: 0 auto;
          text-align: center;
          position: relative;
        }

        .cta-link {
          display: inline-block;
          text-decoration: none;
          color: #f5f5f5;
          margin: 18px 0 30px;
          font-family: ui-serif, "Times New Roman", Times, serif;
        }

        .cta-link h2 {
          font-weight: 400;
          margin: 0;
          font-size: clamp(28px, 6vw, 56px);
          letter-spacing: 0.14em;
        }

        .cta-link small {
          display: block;
          margin-top: 8px;
          letter-spacing: 0.3em;
          font-size: clamp(10px, 2vw, 12px);
        }

        .divider {
          height: 28px;
        }

        .logo {
          margin-top: 24px;
          opacity: 0.85;
          letter-spacing: 0.5em;
          font-size: clamp(20px, 4.5vw, 40px);
          font-family: ui-serif, "Times New Roman", Times, serif;
        }

        .close-cta {
          position: absolute;
          top: -20px;
          right: -20px;
          background: rgba(0, 0, 0, 0.6);
          color: #fff;
          border: 0;
          padding: 10px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .close-cta:hover {
          background: rgba(0, 0, 0, 0.8);
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}
