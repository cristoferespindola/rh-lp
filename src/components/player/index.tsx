"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";
import StaticTurnOn from "@/components/video/StaticTurnOn";
import VideoActions from "@/components/videoActions";

type Props = {
  vimeoUrl: string; // ex: https://vimeo.com/1112605590
  rotateImageUrl?: string; // opcional, img do aviso "gire o telefone"
  ctaTimeSec?: number; // default 151 (2:31)
  autoOpenModalAt?: "cta" | "ended" | null; // quando abrir a modal automaticamente
};

const MOBILE_MAX_WIDTH = 1024;

export default function VideoExperience({
  vimeoUrl,
  rotateImageUrl,
  ctaTimeSec = 151,
  autoOpenModalAt = "cta",
}: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef(null);

  const [isPortrait, setIsPortrait] = useState(false);
  const [isMobileish, setIsMobileish] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);

  const [showRotateOverlay, setShowRotateOverlay] = useState(false);
  const [showTapToPlay, setShowTapToPlay] = useState(false);

  const [hasEntered, setHasEntered] = useState(false); // já clicou no tap-to-enter
  const [ctaShown, setCtaShown] = useState(false);     // hotspots já visíveis
  const [showModal, setShowModal] = useState(false);   // modal Framer Motion

  // --- helpers de ambiente/orientação
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

  // --- controlar overlays de rotate/tap
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
      // só mostra tap-to-play se ainda não entrou
      setShowTapToPlay(!hasEntered);
    } else {
      setShowRotateOverlay(false);
      setShowTapToPlay(false);
    }
  }, [computePortrait, computeMobileish, hasEntered]);

  useEffect(() => {
    setIsIOS(computeIOS());
    refreshOverlays();
    const onResize = () => refreshOverlays();
    const onOrientation = () => refreshOverlays();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onOrientation);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onOrientation);
    };
  }, [computeIOS, refreshOverlays]);

  // Carregar API do Vimeo e configurar monitoramento de tempo
  useEffect(() => {
    if (!window.Vimeo) {
      const script = document.createElement("script");
      script.src = "https://player.vimeo.com/api/player.js";
      script.async = true;
      script.onload = () => {
        // Configurar monitoramento de tempo após carregar a API
        const iframe = playerRef.current;
        if (iframe && window.Vimeo) {
          const player = new window.Vimeo.Player(iframe);
          
          // Monitorar progresso do vídeo
          player.on('timeupdate', (data: { seconds: number }) => {
            if (!ctaShown && data.seconds >= ctaTimeSec) {
              setCtaShown(true);
              if (autoOpenModalAt === "cta") {
                setShowModal(true);
              }
            }
          });

          // Monitorar fim do vídeo
          player.on('ended', () => {
            if (!ctaShown) {
              setCtaShown(true);
              if (autoOpenModalAt === "ended") {
                setShowModal(true);
              }
            }
          });
        }
      };
      document.head.appendChild(script);
    } else {
      // Se a API já estiver carregada, configurar diretamente
      const iframe = playerRef.current;
      if (iframe && window.Vimeo) {
        const player = new window.Vimeo.Player(iframe);
        
        // Monitorar progresso do vídeo
        player.on('timeupdate', (data: { seconds: number }) => {
          if (!ctaShown && data.seconds >= ctaTimeSec) {
            setCtaShown(true);
            if (autoOpenModalAt === "cta") {
              setShowModal(true);
            }
          }
        });

        // Monitorar fim do vídeo
        player.on('ended', () => {
          if (!ctaShown) {
            setCtaShown(true);
            if (autoOpenModalAt === "ended") {
              setShowModal(true);
            }
          }
        });
      }
    }
  }, [ctaShown, ctaTimeSec, autoOpenModalAt]);

  // --- tentar fullscreen no container (não no player)
  const requestFullscreenSafely = useCallback(async () => {
    // Evitar nativo no iOS (não sobrepõe bem)
    if (isIOS) return;
    const el = wrapRef.current;
    if (!el) return;
    try {
      if (el.requestFullscreen) await el.requestFullscreen();
      else {
        const webkitEl = el as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> };
        if (webkitEl.webkitRequestFullscreen) await webkitEl.webkitRequestFullscreen();
        else {
          const msEl = el as HTMLElement & { msRequestFullscreen?: () => Promise<void> };
          if (msEl.msRequestFullscreen) await msEl.msRequestFullscreen();
        }
      }
    } catch {
      // no-op
    }
  }, [isIOS]);

  const handleEnterExperience = useCallback(async () => {
    console.log("Entering experience...");
    setHasEntered(true);
    setShowTapToPlay(false);
    await requestFullscreenSafely();

    // dar play após gesto do usuário usando API do Vimeo
    const iframe = playerRef.current;
    if (iframe && window.Vimeo) {
      try {
        const player = new window.Vimeo.Player(iframe);
        await player.play();
      } catch (error) {
        console.error("Error playing video:", error);
      }
    }
  }, [requestFullscreenSafely]);

  // --- callbacks do player

  const onReady = useCallback(() => {
    console.log("Player ready!");
    setIsReady(true);
    setHasError(false);
  }, []);

  const onError = useCallback((error: any) => {
    console.error("Player error:", error);
    setHasError(true);
    setIsReady(false);
  }, []);

  // --- estilos inline (poderia ser CSS)
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
        zIndex: 10,
        background: "#000",
        color: "#f5f5f5",
      },
      tapToPlay: {
        position: "absolute" as const,
        inset: 0,
        display: showTapToPlay ? "grid" : "none",
        placeItems: "center",
        zIndex: 11,
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
        zIndex: 12,
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
        zIndex: 20,
        display: "grid",
        placeItems: "center",
        pointerEvents: "auto" as const,
      },
      modalCard: {
        width: "min(92vw, 720px)",
        background: "#111",
        color: "#fff",
        border: "1px solid #333",
        borderRadius: 12,
        padding: 24,
      },
      loadingOverlay: {
        position: "absolute" as const,
        inset: 0,
        display: !isReady && !hasError ? "flex" : "none",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 5,
        background: "#000",
        color: "#fff",
      },
      errorOverlay: {
        position: "absolute" as const,
        inset: 0,
        display: hasError ? "flex" : "none",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 5,
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
      {/* Container que tenta virar fullscreen */}
      <div ref={wrapRef} style={styles.wrap} id="video-wrap">
        {/* Loading Overlay */}
        <div style={styles.loadingOverlay}>
          <div>Carregando vídeo...</div>
        </div>

        {/* Error Overlay */}
        <div style={styles.errorOverlay}>
          <div>Erro ao carregar o vídeo</div>
          <button 
            onClick={() => window.location.reload()} 
            style={{ padding: "8px 16px", background: "#333", color: "#fff", border: "none", borderRadius: 4 }}
          >
            Tentar novamente
          </button>
        </div>

        {/* Vimeo Player */}
        <iframe
          ref={playerRef}
          src={`https://player.vimeo.com/video/${vimeoUrl.split('/').pop()}?autopause=1&muted=0&controls=0&title=0&byline=0&portrait=0&dnt=1&transparent=0`}
          width="100%"
          height="100%"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          style={{ background: "#000" }}
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
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <StaticTurnOn />
            )}
          </div>
        </div>

        {/* Tap-to-enter (necessário para iOS dar play) */}
        <div style={styles.tapToPlay} aria-hidden={!showTapToPlay}>
          <button type="button" style={styles.playBtn} onClick={handleEnterExperience}>
            TAP TO ENTER EXPERIENCE
          </button>
        </div>

        {/* Hotspots invisíveis (RSVP / BOOK) */}
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

        {/* Modal com VideoActions (Framer Motion) — abre sobre o vídeo dentro do "fullscreen" do container */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              style={styles.modalBackdrop}
              initial={{ backgroundColor: "rgba(0,0,0,0)" }}
              animate={{ backgroundColor: "rgba(0,0,0,0.95)" }}
              exit={{ backgroundColor: "rgba(0,0,0,0)" }}
            >
              <motion.div
                style={{ width: "100%", height: "100%" }}
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
