"use client";

import React, { useState, useEffect, useRef } from "react";
import { TurnOnPhone } from "@/components/svg/TurnOnPhone";
import { Maximize, Minimize, X } from "lucide-react";

import "./style.css";

export default function VideoPageComponent() {
  const [isMobile, setIsMobile] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFakeFullscreen, setIsFakeFullscreen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const fullscreenButtonRef = useRef<HTMLButtonElement>(null);

  const tryMinimizeBars = () => {
    // iOS retrai a barra após um "scroll" pequeno; precisa ocorrer após um gesto real
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      // pequeno atraso para o Safari recalcular a viewport
      setTimeout(() => window.scrollTo(0, 1), 200);
    }
  };

  const enterFakeFullscreen = () => {
    console.log("Entering fake fullscreen...");
    setIsFakeFullscreen(true);
    tryMinimizeBars();
  };

  const exitFakeFullscreen = () => {
    console.log("Exiting fake fullscreen...");
    setIsFakeFullscreen(false);
  };

  const toggleFullscreen = (
    videoElement: HTMLVideoElement & {
      mozRequestFullScreen?: () => void;
      webkitRequestFullscreen?: () => void;
      webkitEnterFullscreen?: () => void;
    }
  ) => {
    if (isFullscreen || isFakeFullscreen) {
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
      setIsFakeFullscreen(false);
    } else {
      // Try real fullscreen first, fallback to fake fullscreen
      console.log("Entering fullscreen...");

      if (videoElement.requestFullscreen) {
        videoElement
          .requestFullscreen()
          .then(() => {
            setIsFullscreen(true);
            console.log("Real fullscreen successful");
          })
          .catch(err => {
            console.log("Real fullscreen failed, using fake fullscreen:", err);
            enterFakeFullscreen();
          });
      } else if (videoElement.mozRequestFullScreen) {
        videoElement.mozRequestFullScreen();
        setIsFullscreen(true);
      } else if (videoElement.webkitRequestFullscreen) {
        videoElement.webkitRequestFullscreen();
        setIsFullscreen(true);
      } else if (videoElement.webkitEnterFullscreen) {
        videoElement.webkitEnterFullscreen();
        setIsFullscreen(true);
      } else {
        // Fallback to fake fullscreen
        enterFakeFullscreen();
      }
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
              onReady: (video: { requestFullscreen: () => void }) => void;
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
            };
          };
        };

        if (wistiaWindow.Wistia) {
          const video = wistiaWindow.Wistia.api("avj1qhbupb");
          if (video) {
            console.log("Wistia video found, attempting to play...");

            // First, try to play via Wistia API
            try {
              video.play();
              // Auto enter fake fullscreen after play
              setTimeout(() => {
                enterFakeFullscreen();
              }, 1000);
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
                  videoElement.play();
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
            };
          };
        };
        if (wistiaWindow.Wistia) {
          const video = wistiaWindow.Wistia.api("avj1qhbupb");
          if (video) {
            console.log("Desktop: Wistia video found, attempting to play...");
            try {
              video.play();
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

  // Listen for fullscreen changes
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

  // Fake Fullscreen Overlay
  if (isFakeFullscreen) {
    return (
      <div className="overlay">
        <div
          id="wistia-video-fake-fullscreen"
          className="wistia_embed wistia_async_avj1qhbupb"
          style={{
            width: "100dvw",
            height: "100dvh",
            maxWidth: "100%",
            maxHeight: "100%",
            display: "block",
            border: "0",
          }}
          data-autoplay="true"
          data-muted="false"
          data-video-foam="true"
          data-fitStrategy="cover"
          data-playsinline="true"
          data-webkit-playsinline="true"
        />
        <button
          onClick={exitFakeFullscreen}
          className="close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    );
  }

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
          }}
          data-autoplay="true"
          data-muted="false"
          data-video-foam="true"
          data-fitStrategy="cover"
        />
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
      >
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
          data-fitStrategy="cover"
          data-playsinline="true"
          data-webkit-playsinline="true"
        />

        <button
            ref={fullscreenButtonRef}
          onClick={() => {
            const wistiaWindow = window as Window & {
              Wistia?: {
                api: (id: string) => {
                  requestFullscreen: () => void;
                };
              };
            };

            if (wistiaWindow.Wistia) {
              const video = wistiaWindow.Wistia.api("avj1qhbupb");
              if (video && video.requestFullscreen) {
                console.log("Using Wistia API for fullscreen");
                video.requestFullscreen();
                setIsFullscreen(true);
                return;
              }
            }
            
            // Fallback to fake fullscreen
            enterFakeFullscreen();
          }}
          className="absolute top-4 left-4 z-50 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-all duration-200"
        >
          {isFullscreen || isFakeFullscreen ? <Minimize /> : <Maximize />}
        </button>
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
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-8">
        <div className="text-center space-y-8">
          <div className="mx-auto max-w-3xl w-1/2">
            <TurnOnPhone className="w-full h-full" />
          </div>
          <div className="space-y-4">
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
