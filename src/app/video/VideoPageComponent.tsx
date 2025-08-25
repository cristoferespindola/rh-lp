"use client";

import React, { useState, useEffect, useRef } from "react";
import { TurnOnPhone } from "@/components/svg/TurnOnPhone";
import VideoOverlayActions from "@/components/videoOverlayActions";

import "./style.css";
import StaticTurnOn from "@/components/video/StaticTurnOn";
import { isiOSDevice } from "@/lib/device";

type VideoWrapper = HTMLDivElement & {
  webkitEnterFullscreen: () => void;
  webkitRequestFullscreen: () => void;
  mozRequestFullScreen: () => void;
};

export default function VideoPageComponent() {
  const [isMobile, setIsMobile] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [visibleHotspots, setVisibleHotspots] = useState<string[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<VideoWrapper>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const isiOS = isiOSDevice();

  function getWistiaVideoEl():
    | (HTMLVideoElement & {
        webkitEnterFullscreen?: () => void;
        webkitRequestFullscreen?: () => void;
        mozRequestFullScreen?: () => void;
      })
    | null {
    return document.querySelector('video[id^="wistia_simple_video_"]');
  }

  function playAndEnterFullscreenFromGesture(): boolean {
    const vid = getWistiaVideoEl();
    const parent = containerRef.current;
    if (!vid) return false;

    try {
      if (vid.muted) vid.muted = false;
      if (vid.paused) vid.play();
      setIsPlaying(true);

      if (isiOS && typeof vid.webkitEnterFullscreen === "function") {
        parent?.webkitEnterFullscreen();
        return true;
      }
      if (typeof vid.requestFullscreen === "function") {
        parent?.requestFullscreen();
        return true;
      }
      if (typeof vid.webkitRequestFullscreen === "function") {
        parent?.webkitRequestFullscreen();
        return true;
      }
      if (typeof vid.mozRequestFullScreen === "function") {
        parent?.mozRequestFullScreen();
        return true;
      }
    } catch (e) {
      console.warn("Play+Fullscreen nativo falhou:", e);
    }
    return false;
  }

  const toggleFullscreen = (
    videoElement: HTMLVideoElement & {
      mozRequestFullScreen?: () => void;
      webkitRequestFullscreen?: () => void;
      webkitEnterFullscreen?: () => void;
    }
  ) => {
    if (isFullscreen) {
      // Exit fullscreen
      console.log("Exiting fullscreen...");
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (
        (document as Document & { mozCancelFullScreen?: () => void })
          .mozCancelFullScreen
      ) {
        (
          document as Document & { mozCancelFullScreen?: () => void }
        ).mozCancelFullScreen?.();
      } else if (
        (document as Document & { webkitExitFullscreen?: () => void })
          .webkitExitFullscreen
      ) {
        (
          document as Document & { webkitExitFullscreen?: () => void }
        ).webkitExitFullscreen?.();
      }
      setIsFullscreen(false);
    } else {
      // Enter fullscreen
      console.log("Entering fullscreen...");

      // Fallback: try native fullscreen
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
      setIsFullscreen(true);
    }
  };

  const stopVideo = () => {
    const wistiaWindow = window as Window & {
      Wistia?: { api: (id: string) => { pause: () => void; play: () => void } };
    };
    if (wistiaWindow.Wistia) {
      const video = wistiaWindow.Wistia.api("avj1qhbupb");
      if (video) {
        video.pause();
      }
    }

    if (ref.current) {
      ref.current.innerHTML = "";
    }

    const wistiaMessage = document.querySelector(
      "#video-message ~ div"
    ) as HTMLElement;
    if (wistiaMessage) {
      console.log("wistiaMessage", wistiaMessage);
      wistiaMessage.style.display = "none";
    }

    const wistiaChromeElements = document.querySelectorAll(
      '[id^="wistia_chrome_"]'
    );
    wistiaChromeElements.forEach(element => {
      element.remove();
    });
  };

  useEffect(() => {
    const loadWistiaScript = () => {
      if (!document.querySelector('script[src*="fast.wistia.com"]')) {
        const script = document.createElement("script");
        script.src = "//fast.wistia.com/assets/external/E-v1.js";
        script.async = true;
        script.onload = () => {
          console.log("Wistia script loaded");

          const wistiaWindow = window as Window & {
            _wq?: Array<{
              id: string;
              onReady: (video: {
                requestFullscreen: () => void;
                bind: (
                  event: string,
                  callback: (data?: number) => void
                ) => void;
              }) => void;
            }>;
          };

          if (wistiaWindow._wq) {
            wistiaWindow._wq.push({
              id: "avj1qhbupb",
              onReady: video => {
                console.log("Wistia video ready via queue");
                (
                  window as Window & {
                    wistiaVideo?: { requestFullscreen: () => void };
                  }
                ).wistiaVideo = video;

                // Bind to secondchange event to show hotspots progressively
                video.bind("secondchange", (seconds?: number) => {
                  if (seconds === undefined) return;
                  console.log("Video second changed:", seconds);

                  // Convert time to seconds (e.g., 2.30 = 2 minutes 30 seconds = 150 seconds)
                  const hotspot1Time = 2 * 60 + 30; // 2:30 = 150 seconds
                  const hotspot2Time = 2 * 60 + 37; // 2:37 = 157 seconds
                  const hotspot3Time = 2 * 60 + 40; // 2:40 = 160 seconds

                  if (
                    seconds >= hotspot1Time &&
                    !visibleHotspots.includes("hotspot-1")
                  ) {
                    console.log("Showing hotspot 1 at", seconds, "seconds");
                    setVisibleHotspots(prev => [...prev, "hotspot-1"]);
                  }

                  if (
                    seconds >= hotspot2Time &&
                    !visibleHotspots.includes("hotspot-2")
                  ) {
                    console.log("Showing hotspot 2 at", seconds, "seconds");
                    setVisibleHotspots(prev => [...prev, "hotspot-2"]);
                  }

                  if (
                    seconds >= hotspot3Time &&
                    !visibleHotspots.includes("hotspot-3")
                  ) {
                    console.log("Showing hotspot 3 at", seconds, "seconds");
                    setVisibleHotspots(prev => [...prev, "hotspot-3"]);
                  }
                });
              },
            });
          }
        };
        document.head.appendChild(script);
      }
    };

    const checkMobile = () => {
      const userAgent =
        navigator.userAgent ||
        navigator.vendor ||
        (window as Window & { opera?: string }).opera ||
        "";
      const isMobileDevice =
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
          userAgent.toLowerCase()
        );
      setIsMobile(isMobileDevice);
    };

    const checkOrientation = () => {
      const isLandscapeOrientation = window.innerWidth > window.innerHeight;
      console.log("Orientation check:", {
        width: window.innerWidth,
        height: window.innerHeight,
        isLandscape: isLandscapeOrientation,
        isMobile,
        showVideo,
      });
      setIsLandscape(isLandscapeOrientation);

      if (isMobile && isLandscapeOrientation) {
        console.log("Mobile landscape detected, setting showVideo to true");
        setShowVideo(true);
      } else if (isMobile && !isLandscapeOrientation) {
        console.log("Mobile portrait detected, setting showVideo to false");
        setShowVideo(false);
        stopVideo();
      }
    };

    loadWistiaScript();
    checkMobile();
    checkOrientation();

    const handleOrientationChange = () => {
      console.log("Orientation change event detected");
      setTimeout(checkOrientation, 300);
    };

    const handleResize = () => {
      checkOrientation();
    };

    window.addEventListener("orientationchange", handleOrientationChange);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("orientationchange", handleOrientationChange);
      window.removeEventListener("resize", handleResize);
    };
  }, [isMobile]);

  useEffect(() => {
    if (isMobile && isLandscape && showVideo) {
      console.log("Mobile landscape detected, initializing video...");

      const initVideo = () => {
        const wistiaWindow = window as Window & {
          Wistia?: {
            api: (id: string) => {
              play: () => void;
              pause: () => void;
              muted: boolean;
              bind: (event: string, callback: () => void) => void;
            };
          };
        };

        if (wistiaWindow.Wistia) {
          const video = wistiaWindow.Wistia.api("avj1qhbupb");
          if (video) {
            console.log("Wistia video found, attempting to play...");

            // First, try to play via Wistia API
            try {
              //   video.muted = true;
              // video.play();
              console.log("Play command sent to Wistia");
            } catch (err) {
              console.log("Wistia play failed:", err);
            }

            // Wait for video element and handle fullscreen
            const waitForVideoElement = () => {
              const videoElement = document.querySelector(
                "#wistia-video-mobile video"
              ) as HTMLVideoElement & {
                mozRequestFullScreen?: () => void;
                webkitRequestFullscreen?: () => void;
                webkitEnterFullscreen?: () => void;
              };

              if (videoElement) {
                console.log(
                  "Video element found, attempting to play and enter fullscreen..."
                );

                // Add event listeners to detect when video is ready
                videoElement.addEventListener("loadeddata", () => {
                  console.log("Video data loaded");
                });

                videoElement.addEventListener("canplay", () => {
                  console.log("Video can play");
                });

                videoElement.addEventListener("playing", () => {
                  console.log("Video is playing");
                });

                // Try to play the video element directly
                if (videoElement.paused) {
                  console.log("Video is paused, attempting to play...");
                  //   videoElement.play();
                } else {
                  // Video is already playing, enter fullscreen
                  setTimeout(() => {
                    toggleFullscreen(videoElement);
                  }, 1000);
                }
              } else {
                console.log("Video element not found, retrying...");
                setTimeout(waitForVideoElement, 1000);
              }
            };

            // Start checking for video element after 2 seconds
            setTimeout(waitForVideoElement, 2000);
          } else {
            console.log("Wistia video not found, retrying...");
            setTimeout(initVideo, 1000);
          }
        } else {
          console.log("Wistia not ready, retrying...");
          setTimeout(initVideo, 1000);
        }
      };

      // Start initialization after 1 second
      setTimeout(initVideo, 1000);
    }
  }, [isMobile, isLandscape, showVideo]);

  useEffect(() => {
    if (isMobile && !isLandscape && showVideo) {
      stopVideo();
      setShowVideo(false);
    }
  }, [isMobile, isLandscape, showVideo]);

  useEffect(() => {
    if (isMobile && !isLandscape) {
      stopVideo();
      setShowVideo(false);

      setTimeout(() => {
        if (ref.current) {
          ref.current.innerHTML = "";
        }
      }, 100);
    }
  }, [isMobile, isLandscape]);

  useEffect(() => {
    if (!isMobile) {
      const initDesktopVideo = () => {
        const wistiaWindow = window as Window & {
          Wistia?: {
            api: (id: string) => {
              play: () => void;
              pause: () => void;
              bind: (event: string, callback: (data?: number) => void) => void;
            };
          };
        };
        if (wistiaWindow.Wistia) {
          const video = wistiaWindow.Wistia.api("avj1qhbupb");
          if (video) {
            console.log("Desktop: Wistia video found, attempting to play...");
            try {
              // Bind to secondchange event to show hotspots progressively
              video.bind("secondchange", (seconds?: number) => {
                if (seconds === undefined) return;
                console.log("Desktop: Video second changed:", seconds);

                // Convert time to seconds (e.g., 2.30 = 2 minutes 30 seconds = 150 seconds)
                const hotspot1Time = 2 * 60 + 34; // 2:30 = 150 seconds
                const hotspot2Time = 2 * 60 + 37; // 2:37 = 157 seconds
                const hotspot3Time = 2 * 60 + 40; // 2:40 = 160 seconds

                if (
                  seconds >= hotspot1Time &&
                  !visibleHotspots.includes("hotspot-1")
                ) {
                  console.log(
                    "Desktop: Showing hotspot 1 at",
                    seconds,
                    "seconds"
                  );
                  setVisibleHotspots(prev => [...prev, "hotspot-1"]);
                }

                if (
                  seconds >= hotspot2Time &&
                  !visibleHotspots.includes("hotspot-2")
                ) {
                  console.log(
                    "Desktop: Showing hotspot 2 at",
                    seconds,
                    "seconds"
                  );
                  setVisibleHotspots(prev => [...prev, "hotspot-2"]);
                }

                if (
                  seconds >= hotspot3Time &&
                  !visibleHotspots.includes("hotspot-3")
                ) {
                  console.log(
                    "Desktop: Showing hotspot 3 at",
                    seconds,
                    "seconds"
                  );
                  setVisibleHotspots(prev => [...prev, "hotspot-3"]);
                }
              });
            } catch (err) {
              console.log(
                "Desktop: Autoplay failed, user interaction required:",
                err
              );
            }
          }
        } else {
          setTimeout(initDesktopVideo, 500);
        }
      };

      setTimeout(initDesktopVideo, 1000);
    }
  }, [isMobile]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  useEffect(() => {
    console.log("visibleHotspots state changed:", visibleHotspots);
  }, [visibleHotspots]);

  if (!isMobile) {
    console.log("Desktop mode - rendering video");
    return (
      <div className="min-h-screen bg-black">
        <div
          id="wistia-video"
          className="wistia_embed wistia_async_avj1qhbupb"
          style={{
            width: "100vw",
            height: "100vh",
            position: "relative",
          }}
          data-autoplay="true"
          data-muted="false"
          data-video-foam="true"
          data-fitStrategy="fill"
        >
          <VideoOverlayActions
            visibleHotspots={visibleHotspots}
            containerId="wistia-hotspots-desktop"
          />
        </div>
      </div>
    );
  }
  if (isMobile && !isLandscape) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-8">
        <div className="text-center space-y-8">
          <div className="mx-auto max-w-3xl w-1/2">
            <TurnOnPhone className="w-full h-full" />
          </div>
          <div className="space-y-4" id="video-message">
            <h1 className="text-2xl font-rh-sans font-light">
              Rotate Your Phone
            </h1>
            <p className="text-lg font-rh-sans font-light opacity-80">
              This Video Is Horizontal
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isMobile && isLandscape && showVideo) {
    return (
      <div
        className="min-h-screen bg-black landscape-mode relative"
        id="wistia-video-mobile-fullscreen"
        ref={containerRef}
      >
        <VideoOverlayActions
          visibleHotspots={visibleHotspots}
          containerId="wistia-video-mobile-fullscreen"
        />
        <div
          ref={ref}
          id="wistia-video-mobile"
          className="wistia_embed wistia_async_avj1qhbupb"
          style={{
            width: "100vw",
            height: "100vh",
          }}
          data-autoplay="true"
          data-muted="false"
          data-video-foam="true"
          data-fitStrategy="fill"
          data-playsinline="true"
          data-webkit-playsinline="true"
        />

        {!isPlaying ? (
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
                containerRef.current?.requestFullscreen();
                setIsFullscreen(true);
                setIsPlaying(true);
                return;
              } catch (e) {
                console.warn("Wistia play/requestFullscreen falhou:", e);
              }
            }}
            className="absolute w-16 h-16 top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-50 bg-black/70 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-black/90 transition"
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
        ) : null}
      </div>
    );
  }

  if (isMobile && isLandscape && !showVideo) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-2xl font-rh-sans font-light">Loading Video...</h1>
        </div>
      </div>
    );
  }

  if (isMobile && !isLandscape) {
    return <StaticTurnOn />;
  }

  if (isMobile && isLandscape && !showVideo) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-2xl font-rh-sans font-light">Loading Video...</h1>
        </div>
      </div>
    );
  }

  return null;
}
