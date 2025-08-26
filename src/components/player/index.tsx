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

  // Forçar refresh dos overlays quando a orientação mudar
  useEffect(() => {
    const handleOrientationChange = () => {
      // Delay para garantir que a orientação foi detectada
      setTimeout(() => {
        refreshOverlays();
        // Forçar remoção do overlay de rotação se não estiver mais em portrait
        if (!computePortrait()) {
          setShowRotateOverlay(false);
        }
      }, 100);
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [refreshOverlays, computePortrait]);

  useEffect(() => {
    setIsIOS(computeIOS());
    refreshOverlays();
    
    const onResize = () => {
      // Delay para evitar múltiplas chamadas
      setTimeout(() => refreshOverlays(), 50);
    };
    
    const onOrientation = () => {
      // Delay maior para orientação para garantir que foi detectada
      setTimeout(() => refreshOverlays(), 300);
    };
    
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
          
          // Marcar como pronto quando o player estiver carregado
          player.on('loaded', () => {
            console.log("Vimeo player loaded");
            setIsReady(true);
            refreshOverlays();
          });
          
          // Monitorar progresso do vídeo
          player.on('timeupdate', (data: { seconds: number }) => {
            if (!ctaShown && data.seconds >= ctaTimeSec) {
              setCtaShown(true);
              if (autoOpenModalAt === "cta") {
                // Sair do fullscreen antes de mostrar a modal
                if (isIOS) {
                  try {
                    (player as any).exitFullscreen();
                  } catch (error) {
                    console.log("Erro ao sair do fullscreen:", error);
                  }
                }
                setShowModal(true);
              }
            }
          });

          // Monitorar fim do vídeo
          player.on('ended', () => {
            if (!ctaShown) {
              setCtaShown(true);
              if (autoOpenModalAt === "ended") {
                // Sair do fullscreen antes de mostrar a modal
                if (isIOS) {
                  try {
                    (player as any).exitFullscreen();
                  } catch (error) {
                    console.log("Erro ao sair do fullscreen:", error);
                  }
                }
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
        
        // Marcar como pronto quando o player estiver carregado
        player.on('loaded', () => {
          console.log("Vimeo player loaded");
          setIsReady(true);
          refreshOverlays();
        });
        
        // Monitorar progresso do vídeo
        player.on('timeupdate', (data: { seconds: number }) => {
          if (!ctaShown && data.seconds >= ctaTimeSec) {
            setCtaShown(true);
            if (autoOpenModalAt === "cta") {
              // Sair do fullscreen antes de mostrar a modal
              if (isIOS) {
                try {
                  (player as any).exitFullscreen();
                } catch (error) {
                  console.log("Erro ao sair do fullscreen:", error);
                }
              }
              setShowModal(true);
            }
          }
        });

        // Monitorar fim do vídeo
        player.on('ended', () => {
          if (!ctaShown) {
            setCtaShown(true);
            if (autoOpenModalAt === "ended") {
              // Sair do fullscreen antes de mostrar a modal
              if (isIOS) {
                try {
                  (player as any).exitFullscreen();
                } catch (error) {
                  console.log("Erro ao sair do fullscreen:", error);
                }
              }
              setShowModal(true);
            }
          }
        });
      }
    }
  }, [ctaShown, ctaTimeSec, autoOpenModalAt, refreshOverlays]);

  // --- tentar fullscreen no container (não no player)
  const requestFullscreenSafely = useCallback(async () => {
    const el = wrapRef.current;
    if (!el) return;
    
    try {
      // No iOS, tentar fullscreen do iframe do vídeo em vez do container
      if (isIOS) {
        const iframe = playerRef.current;
        if (iframe && window.Vimeo) {
          const player = new window.Vimeo.Player(iframe);
          console.log("Tentando fullscreen do Vimeo no iOS...");
          await player.requestFullscreen();
          console.log("Fullscreen do Vimeo ativado!");
        } else {
          console.log("Vimeo API não disponível para fullscreen");
          // Fallback: tentar fullscreen do iframe diretamente
          const iframe = playerRef.current;
          if (iframe && (iframe as any).requestFullscreen) {
            try {
              await (iframe as any).requestFullscreen();
              console.log("Fullscreen do iframe ativado!");
            } catch (e) {
              console.log("Fullscreen do iframe falhou:", e);
            }
          }
        }
      } else {
        // Em outros dispositivos, tentar fullscreen do container
        if (el.requestFullscreen) await el.requestFullscreen();
        else {
          const webkitEl = el as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> };
          if (webkitEl.webkitRequestFullscreen) await webkitEl.webkitRequestFullscreen();
          else {
            const msEl = el as HTMLElement & { msRequestFullscreen?: () => Promise<void> };
            if (msEl.msRequestFullscreen) await msEl.msRequestFullscreen();
          }
        }
      }
    } catch (error) {
      console.log("Fullscreen failed:", error);
    }
  }, [isIOS]);

  const handleEnterExperience = useCallback(async () => {
    console.log("Entering experience...");
    setHasEntered(true);
    setShowTapToPlay(false);

    // dar play após gesto do usuário usando API do Vimeo
    const iframe = playerRef.current;
    if (iframe && window.Vimeo) {
      try {
        const player = new window.Vimeo.Player(iframe);
        await player.play();
        
        // No iOS, não entrar em fullscreen automaticamente para permitir que a modal apareça
        if (!isIOS) {
          await requestFullscreenSafely();
        }
      } catch (error) {
        console.error("Error playing video:", error);
      }
    }
  }, [requestFullscreenSafely, isIOS]);

  // --- callbacks do player

  const onReady = useCallback(() => {
    console.log("Player ready!");
    setIsReady(true);
    setHasError(false);
    
    // Forçar refresh dos overlays após o vídeo estar pronto
    setTimeout(() => {
      refreshOverlays();
    }, 100);
  }, [refreshOverlays]);

  // Fallback: se o onReady não for chamado, marcar como pronto após um tempo
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isReady && !hasError) {
        console.log("Fallback: marking as ready");
        setIsReady(true);
        refreshOverlays();
      }
    }, 3000); // 3 segundos de timeout

    return () => clearTimeout(timer);
  }, [isReady, hasError, refreshOverlays]);

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
        zIndex: 9999,
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

        {/* Debug info para iOS */}
        {isIOS && (
          <div style={{
            position: 'absolute',
            top: 10,
            left: 10,
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '4px 8px',
            fontSize: '12px',
            zIndex: 1000,
            display: isReady ? 'none' : 'block'
          }}>
            iOS: {isPortrait ? 'Portrait' : 'Landscape'} | Mobile: {isMobileish ? 'Yes' : 'No'}
            <br />
            <button 
              onClick={requestFullscreenSafely}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid white',
                color: 'white',
                padding: '2px 6px',
                fontSize: '10px',
                marginTop: '4px'
              }}
            >
              Test Fullscreen
            </button>
          </div>
        )}

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
          onLoadStart={() => console.log("Iframe load started")}
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
                
                {/* Botão de fullscreen para iOS */}
                {isIOS && (
                  <motion.button
                    onClick={requestFullscreenSafely}
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
                    transition={{ delay: 1 }}
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
