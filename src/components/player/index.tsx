"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import StaticTurnOn from "@/components/video/StaticTurnOn";
import VideoActions from "@/components/videoActions";

type Props = {
  vimeoUrl: string;              // ex: https://vimeo.com/1112605590
  rotateImageUrl?: string;       // imagem para o aviso "gire"
  ctaTimeSec?: number;           // ponto-alvo (default 151s)
  autoOpenModalAt?: "cta" | "ended" | null; // quando abrir a modal (default "cta")
};

const MOBILE_MAX_WIDTH = 1024;

export default function VideoExperience({
  vimeoUrl,
  rotateImageUrl,
  ctaTimeSec = 151,
  autoOpenModalAt = "cta",
}: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const vimeoPlayerRef = useRef<any | null>(null); // instância única do Vimeo.Player

  const [isPortrait, setIsPortrait] = useState(false);
  const [isMobileish, setIsMobileish] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);

  const [showRotateOverlay, setShowRotateOverlay] = useState(false);
  const [showTapToPlay, setShowTapToPlay] = useState(false);

  const [hasEntered, setHasEntered] = useState(false);
  const [ctaShown, setCtaShown] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // ----------------- helpers de ambiente/orientação -----------------
  const computePortrait = useCallback(
    () => window.matchMedia && window.matchMedia("(orientation: portrait)").matches,
    []
  );
  const computeMobileish = useCallback(() => window.innerWidth <= MOBILE_MAX_WIDTH, []);
  const computeIOS = useCallback(() => {
    const ua = navigator.userAgent || "";
    const isTouchMac = (navigator.platform === "MacIntel" && (navigator as any).maxTouchPoints > 1);
    return /iPad|iPhone|iPod/.test(ua) || isTouchMac;
  }, []);

  const refreshOverlays = useCallback(() => {
    const p = computePortrait();
    const m = computeMobileish();
    setIsPortrait(p);
    setIsMobileish(m);

    if (m && p) {
      setShowRotateOverlay(true);
      setShowTapToPlay(false);
    } else if (m && !p) {
      setShowRotateOverlay(false);
      setShowTapToPlay(!hasEntered);
    } else {
      setShowRotateOverlay(false);
      setShowTapToPlay(false);
    }
  }, [computePortrait, computeMobileish, hasEntered]);

  useEffect(() => {
    setIsIOS(computeIOS());
    refreshOverlays();

    const onResize = () => setTimeout(() => refreshOverlays(), 50);
    const onOrientation = () => setTimeout(() => refreshOverlays(), 300);
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onOrientation);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onOrientation);
    };
  }, [computeIOS, refreshOverlays]);

  // ----------------- carregar API do Vimeo e instanciar 1x -----------------
  useEffect(() => {
    let disposed = false;

    const ensureVimeo = () =>
      new Promise<void>((resolve) => {
        if ((window as any).Vimeo?.Player) return resolve();
        const script = document.createElement("script");
        script.src = "https://player.vimeo.com/api/player.js";
        script.async = true;
        script.onload = () => resolve();
        document.head.appendChild(script);
      });

    (async () => {
      await ensureVimeo();
      if (disposed) return;
      if (!iframeRef.current || !(window as any).Vimeo?.Player) return;

      if (!vimeoPlayerRef.current) {
        vimeoPlayerRef.current = new (window as any).Vimeo.Player(iframeRef.current);
        const player = vimeoPlayerRef.current as any;

        player.on("loaded", () => {
          if (disposed) return;
          setIsReady(true);
          refreshOverlays();
        });

        // tempo-alvo: pausar → sair do FS → abrir modal
        player.on("timeupdate", async (data: { seconds: number }) => {
          if (!ctaShown && data.seconds >= ctaTimeSec) {
            setCtaShown(true);
            try { await player.pause(); } catch {}
            await exitAnyFullscreen();
            if (autoOpenModalAt === "cta" || autoOpenModalAt === "ended") {
              setShowModal(true);
            }
          }
        });

        // no fim: mesma coisa
        player.on("ended", async () => {
          if (!ctaShown) setCtaShown(true);
          try { await player.pause(); } catch {}
          await exitAnyFullscreen();
          if (autoOpenModalAt === "ended" || autoOpenModalAt === "cta") {
            setShowModal(true);
          }
        });

        player.on("error", () => {
          if (disposed) return;
          setHasError(true);
          setIsReady(false);
        });
      }
    })();

    return () => {
      disposed = true;
      if (vimeoPlayerRef.current) {
        try {
          vimeoPlayerRef.current.off("loaded");
          vimeoPlayerRef.current.off("timeupdate");
          vimeoPlayerRef.current.off("ended");
          vimeoPlayerRef.current.off("error");
        } catch {}
      }
    };
  }, [ctaShown, ctaTimeSec, autoOpenModalAt, refreshOverlays]);

  // ----------------- fullscreen helpers (player + documento) -----------------
  const requestVideoFullscreen = useCallback(async () => {
    const p = vimeoPlayerRef.current as any;
    if (!p) return false;
    try {
      if (p.requestFullscreen) {
        await p.requestFullscreen(); // fullscreen nativo do player (vídeo)
        return true;
      }
    } catch (e) {
      console.warn("player.requestFullscreen falhou:", e);
    }
    return false;
  }, []);

  const exitAnyFullscreen = useCallback(async () => {
    const p = vimeoPlayerRef.current as any;
    try {
      if (p?.exitFullscreen) {
        await p.exitFullscreen(); // sai do FS do player, se ativo
      }
    } catch (e) {
      console.warn("player.exitFullscreen falhou:", e);
    }

    const d: any = document;
    try { if (document.fullscreenElement && document.exitFullscreen) await document.exitFullscreen(); } catch {}
    try { if (d.webkitFullscreenElement && d.webkitExitFullscreen) await d.webkitExitFullscreen(); } catch {}
  }, []);

  // fallback opcional: tentar fullscreen do container/html
  const requestAnyDocFullscreen = useCallback(async () => {
    const tryFs = async (target: Element | Document) => {
      // @ts-ignore
      if (target.requestFullscreen) return await (target as any).requestFullscreen();
      // @ts-ignore
      if (target.webkitRequestFullscreen) return await (target as any).webkitRequestFullscreen();
      // @ts-ignore
      if (target.msRequestFullscreen) return await (target as any).msRequestFullscreen();
      throw new Error("FS not supported");
    };
    try {
      if (wrapRef.current) {
        await tryFs(wrapRef.current);
        return true;
      }
    } catch {}
    try {
      await tryFs(document.documentElement);
      return true;
    } catch {}
    return false;
  }, []);

  // ----------------- handler de entrada (tap) -----------------
  const handleEnterExperience = useCallback(async () => {
    setHasEntered(true);
    setShowTapToPlay(false);

    // pedir fullscreen do VÍDEO no MESMO gesto
    const fsOk = await requestVideoFullscreen();

    // tocar vídeo
    try {
      await vimeoPlayerRef.current?.play();
    } catch (e) {
      console.warn("play() falhou", e);
      setShowTapToPlay(true);
      return;
    }

    // se o FS do player não rolou, tenta o do container/html (opcional)
    if (!fsOk) {
      try { await requestAnyDocFullscreen(); } catch {}
    }
  }, [requestVideoFullscreen, requestAnyDocFullscreen]);

  const onReady = useCallback(() => {
    setIsReady(true);
    setHasError(false);
    setTimeout(() => refreshOverlays(), 100);
  }, [refreshOverlays]);

  const onError = useCallback((error: any) => {
    console.error("Player error:", error);
    setHasError(true);
    setIsReady(false);
  }, []);

  // ----------------- estilos -----------------
  const styles = useMemo(
    () => ({
      app: {
        position: "relative" as const,
        width: "100%",
        height: "100dvh",
        background: "#000",
        overflow: "hidden",
      },
      wrap: {
        position: "absolute" as const,
        inset: 0,
        display: "grid",
        placeItems: "center",
        background: "#000",
        zIndex: 0,
      },
      iframe: {
        width: "100%",
        height: "100%",
        border: 0,
        position: "relative" as const,
        zIndex: 1,
        background: "#000",
      },
      rotateOverlay: {
        position: "absolute" as const,
        inset: 0,
        display: showRotateOverlay ? "flex" : "none",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center" as const,
        padding: 24,
        gap: 20,
        zIndex: 2,
        background: "#000",
        color: "#f5f5f5",
      },
      tapToPlay: {
        position: "absolute" as const,
        inset: 0,
        display: showTapToPlay ? "grid" : "none",
        placeItems: "center",
        zIndex: 3,
        background: "rgba(0,0,0,.6)",
      },
      playBtn: {
        border: "1px solid #777",
        color: "#fff",
        background: "transparent",
        padding: "14px 28px",
        letterSpacing: ".15em",
        cursor: "pointer",
      },
      ctaSlate: {
        position: "absolute" as const,
        inset: 0,
        display: ctaShown ? "block" : "none",
        background: "transparent",
        zIndex: 4,
        pointerEvents: "none" as const,
      },
      hotspot: {
        position: "absolute" as const,
        left: "50%",
        transform: "translateX(-50%)",
        width: "min(76vw, 800px)",
        height: "clamp(44px, 12vh, 120px)",
        pointerEvents: "auto" as const,
        textIndent: "-9999px",
        overflow: "hidden",
      },
      rsvpHotspot: { top: "30%" },
      bookHotspot: { top: "50%" },
      modalBackdrop: {
        position: "absolute" as const,
        inset: 0,
        zIndex: 5,
        display: "grid",
        placeItems: "center",
        pointerEvents: "auto" as const,
      },
      loadingOverlay: {
        position: "absolute" as const,
        inset: 0,
        display: !isReady && !hasError ? "flex" : "none",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 6,
        background: "#000",
        color: "#fff",
      },
      errorOverlay: {
        position: "absolute" as const,
        inset: 0,
        display: hasError ? "flex" : "none",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 6,
        background: "#000",
        color: "#fff",
        flexDirection: "column" as const,
        gap: 16,
      },
    }),
    [showRotateOverlay, showTapToPlay, ctaShown, isReady, hasError]
  );

  return (
    <div style={styles.app}>
      <div ref={wrapRef} style={styles.wrap} id="video-wrap">
        {/* Loading */}
        <div style={styles.loadingOverlay}>Carregando vídeo...</div>

        {/* Error */}
        <div style={styles.errorOverlay}>
          <div>Erro ao carregar o vídeo</div>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: "8px 16px", background: "#333", color: "#fff", border: "none", borderRadius: 4 }}
          >
            Tentar novamente
          </button>
        </div>

        {/* Vimeo Iframe */}
        <iframe
          ref={iframeRef}
          src={`https://player.vimeo.com/video/${vimeoUrl.split('/').pop()}?autopause=1&muted=0&controls=0&title=0&byline=0&portrait=0&dnt=1&transparent=0&playsinline=1`}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          style={styles.iframe}
          onLoad={onReady}
          onError={onError}
        />

        {/* Overlay: gire o telefone (mostra em portrait) */}
        <div style={styles.rotateOverlay} aria-hidden={!showRotateOverlay}>
          <div style={{ maxWidth: 720, width: "100%" }}>
            {rotateImageUrl ? (
              <img
                src={rotateImageUrl}
                alt="Gire o telefone"
                style={{ maxWidth: "100%", height: "auto", display: "block", margin: "0 auto 18px" }}
                onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
              />
            ) : (
              <StaticTurnOn />
            )}
            <div style={{ marginTop: 12, opacity: 0.8, fontSize: "clamp(14px,2.5vw,18px)" }}>
              Rotacione seu aparelho para Paisagem.
            </div>
          </div>
        </div>

        {/* Tap to enter (mostra em landscape, mobile) */}
        <div style={styles.tapToPlay} aria-hidden={!showTapToPlay}>
          <button type="button" style={styles.playBtn} onClick={handleEnterExperience}>
            TAP TO ENTER EXPERIENCE
          </button>
        </div>

        {/* Hotspots invisíveis (se ainda quiser) */}
        <div style={styles.ctaSlate} aria-hidden={!ctaShown}>
          <a
            href="https://rhparisevent.com"
            target="_blank"
            rel="noopener"
            aria-label="RSVP"
            style={{ ...styles.hotspot, ...styles.rsvpHotspot }}
          >
            RSVP
          </a>
          <a
            href="mailto:carlos@multitudeone.com"
            aria-label="Book a Table"
            style={{ ...styles.hotspot, ...styles.bookHotspot }}
          >
            BOOK
          </a>
        </div>

        {/* Modal por cima do vídeo (após sair do fullscreen) */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              style={styles.modalBackdrop}
              initial={{ backgroundColor: "rgba(0,0,0,0)" }}
              animate={{ backgroundColor: "rgba(0,0,0,0.95)" }}
              exit={{ backgroundColor: "rgba(0,0,0,0)" }}
            >
              <motion.div
                style={{ width: "100%", height: "100%", position: "relative" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 280, damping: 26 }}
                role="dialog"
                aria-modal="true"
                aria-label="Informações"
              >
                <VideoActions onClose={() => setShowModal(false)} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
