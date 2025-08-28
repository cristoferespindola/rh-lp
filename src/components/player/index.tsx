"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import StaticTurnOn from "@/components/video/StaticTurnOn";
import VideoActions from "@/components/videoActions";

type Props = {
  vimeoUrl: string; // ex: https://vimeo.com/1112605590
  rotateImageUrl?: string;
  ctaTimeSec?: number; // default 151
  autoOpenModalAt?: "cta" | "ended" | null;
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
  const vimeoPlayerRef = useRef<any | null>(null); // guarda a instância única do Vimeo.Player

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

  // pseudo-fullscreen fallback p/ iOS que não suporta requestFullscreen no container
  const [pseudoFS, setPseudoFS] = useState(false);

  // --- helpers
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

    // monitorar mudanças de fullscreen p/ desativar pseudoFS quando sair
    const onFSChange = () => {
      const fsEl =
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).msFullscreenElement;
      if (!fsEl) setPseudoFS(false);
    };
    document.addEventListener("fullscreenchange", onFSChange as any);
    document.addEventListener("webkitfullscreenchange", onFSChange as any);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onOrientation);
      document.removeEventListener("fullscreenchange", onFSChange as any);
      document.removeEventListener("webkitfullscreenchange", onFSChange as any);
    };
  }, [computeIOS, refreshOverlays]);

  // --- inicializa 1x o Vimeo.Player e registra listeners
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

      // evita re-instanciar
      if (!vimeoPlayerRef.current) {
        vimeoPlayerRef.current = new (window as any).Vimeo.Player(iframeRef.current);

        const player = vimeoPlayerRef.current as any;

        player.on("loaded", () => {
          if (disposed) return;
          setIsReady(true);
          refreshOverlays();
        });

        player.on("timeupdate", (data: { seconds: number }) => {
          if (!ctaShown && data.seconds >= ctaTimeSec) {
            setCtaShown(true);
            if (autoOpenModalAt === "cta") {
              // **NÃO** sair de fullscreen aqui; queremos modal **por cima** do container
              setShowModal(true);
            }
          }
        });

        player.on("ended", () => {
          if (!ctaShown) setCtaShown(true);
          if (autoOpenModalAt === "ended") {
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

  // --- fullscreen do container (SEM timeout; precisa do gesto)
  const requestContainerFullscreen = useCallback(async () => {
    const el = wrapRef.current;
    if (!el) return false;
    try {
      if (el.requestFullscreen) {
        await el.requestFullscreen();
        return true;
      }
      const wEl = el as any;
      if (wEl.webkitRequestFullscreen) {
        await wEl.webkitRequestFullscreen();
        return true;
      }
      if (wEl.msRequestFullscreen) {
        await wEl.msRequestFullscreen();
        return true;
      }
    } catch {}
    return false;
  }, []);

  // --- fallback pseudo-fullscreen (CSS)
  const enterPseudoFullscreen = useCallback(() => {
    setPseudoFS(true);
  }, []);

  // --- handler do “enter experience”
  const handleEnterExperience = useCallback(async () => {
    setHasEntered(true);
    setShowTapToPlay(false);

    const player = vimeoPlayerRef.current;
    try {
      await player?.play();
    } catch (e) {
      // alguns iOS exigem toque extra; manter o botão visível se falhar
      setShowTapToPlay(true);
      return;
    }
    const videoElement = wrapRef.current as any;

    if (videoElement.requestFullscreen) {
      videoElement
        .requestFullscreen()
        .catch(err => console.log("Fullscreen error:", err));
    } else if (videoElement.mozRequestFullScreen) {
      videoElement.mozRequestFullScreen();
    } else if (videoElement.webkitRequestFullscreen) {
      videoElement.webkitRequestFullscreen();
    } else if (videoElement.webkitEnterFullscreen) {
      videoElement.webkitEnterFullscreen();
    }
  }, [enterPseudoFullscreen, isIOS, requestContainerFullscreen]);

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

  // estilos
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
        position: pseudoFS ? ("fixed" as const) : ("absolute" as const),
        inset: 0,
        display: "grid",
        placeItems: "center",
        background: "#000",
        // cria stacking context p/ modal ficar acima
        zIndex: 0,
      },
      iframe: (modalOpen: boolean) => ({
        width: "100%",
        height: "100%",
        border: 0,
        position: "relative" as const,
        zIndex: 1, // vídeo abaixo da modal
        pointerEvents: modalOpen ? ("none" as const) : ("auto" as const), // quando modal abrir, desabilita o iframe
        background: "#000",
      }),
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
        zIndex: 5, // acima do iframe e hotspots
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
    [showRotateOverlay, showTapToPlay, ctaShown, isReady, hasError, pseudoFS]
  );

  return (
    <div style={styles.app}>
      <div
        ref={wrapRef}
        style={styles.wrap}
        id="video-wrap"
      >
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
          style={styles.iframe(showModal)}
          onLoad={onReady}
          onError={onError}
        />

        {/* Overlay: gire o telefone */}
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
          </div>
        </div>

        {/* Tap to enter */}
        <div style={styles.tapToPlay} aria-hidden={!showTapToPlay}>
          <button type="button" style={styles.playBtn} onClick={handleEnterExperience}>
            TAP TO ENTER EXPERIENCE
          </button>
        </div>

        {/* Hotspots invisíveis */}
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

        {/* Modal dentro do mesmo container (fica por cima do vídeo) */}
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
                {/* botão opcional para tentar FS de novo */}
                {isIOS && (
                  <motion.button
                    onClick={async () => {
                      const ok = await requestContainerFullscreen();
                      if (!ok) setPseudoFS(true);
                    }}
                    style={{
                      position: "absolute",
                      bottom: 20,
                      right: 20,
                      background: "rgba(255,255,255,0.2)",
                      border: "1px solid rgba(255,255,255,0.3)",
                      color: "#fff",
                      padding: "8px 12px",
                      borderRadius: 6,
                      fontSize: "12px",
                      cursor: "pointer",
                      zIndex: 10000,
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Fullscreen
                  </motion.button>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
