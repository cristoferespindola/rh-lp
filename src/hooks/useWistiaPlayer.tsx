import { isiOSDevice, isMobileDevice } from "@/lib/device";
import { useState, useRef, useEffect } from "react";

type WistiaWindow = Window & {
  _wq?: Array<{
    id: string;
    onReady: (video: { requestFullscreen: () => void }) => void;
  }>;
  Wistia?: {
    api: (id: string) => { pause: () => void; play: () => void };
  };
};

export default function useWistiaPlayer({
  wistiaId,
}: {
  wistiaId: string;
  id: string;
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const wistiaVideoEl = useRef<HTMLDivElement>(null);
  const wistiaWindow = window as WistiaWindow;
  const videoInstance = useRef<{ pause: () => void; play: () => void } | null>(
    null
  );

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
    if (!vid) return false;

    try {
      if (vid.muted) vid.muted = false;
      if (vid.paused) vid.play();

      if (isiOS && typeof vid.webkitEnterFullscreen === "function") {
        vid.webkitEnterFullscreen();
        return true;
      }
      if (typeof vid.requestFullscreen === "function") {
        vid.requestFullscreen();
        return true;
      }
      if (typeof vid.webkitRequestFullscreen === "function") {
        vid.webkitRequestFullscreen();
        return true;
      }
      if (typeof vid.mozRequestFullScreen === "function") {
        vid.mozRequestFullScreen();
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
      console.log("Entering fullscreen...");

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
    if (wistiaWindow.Wistia) {
      const video = wistiaWindow.Wistia.api(wistiaId);
      if (video) {
        video.pause();
      }
    }

    if (wistiaVideoEl.current) {
      wistiaVideoEl.current.innerHTML = "";
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

          if (wistiaWindow._wq) {
            wistiaWindow._wq.push({
              id: wistiaId,
              onReady: video => {
                console.log("Wistia video ready via queue");
                (
                  window as Window & {
                    wistiaVideo?: { requestFullscreen: () => void };
                  }
                ).wistiaVideo = video;
              },
            });
            videoInstance.current = wistiaWindow.Wistia?.api(wistiaId) || null;
          }
        };
        document.head.appendChild(script);
      }
    };

    const checkMobile = () => {
      const _isMobileDevice = isMobileDevice();
      setIsMobile(_isMobileDevice);
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
          const video = wistiaWindow.Wistia.api(wistiaId);
          if (video) {
            console.log("Wistia video found, attempting to play...");

            try {
              console.log("Play command sent to Wistia");
            } catch (err) {
              console.log("Wistia play failed:", err);
            }

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

                videoElement.addEventListener("loadeddata", () => {
                  console.log("Video data loaded");
                });

                videoElement.addEventListener("canplay", () => {
                  console.log("Video can play");
                });

                videoElement.addEventListener("playing", () => {
                  console.log("Video is playing");
                });

                if (videoElement.paused) {
                  console.log("Video is paused, attempting to play...");
                  //   videoElement.play();
                } else {
                  setTimeout(() => {
                    toggleFullscreen(videoElement);
                  }, 1000);
                }
              } else {
                console.log("Video element not found, retrying...");
                setTimeout(waitForVideoElement, 1000);
              }
            };

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
        if (wistiaVideoEl.current) {
          wistiaVideoEl.current.innerHTML = "";
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
          const video = wistiaWindow.Wistia.api(wistiaId);
          if (video) {
            console.log("Desktop: Wistia video found, attempting to play...");
            try {
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

  return {
    wistiaVideoEl,
    isMobile,
    isLandscape,
    showVideo,
    isFullscreen,
    playAndEnterFullscreenFromGesture,
    toggleFullscreen,
    stopVideo,
    isiOS,
    videoInstance,
    wistiaWindow,
    setIsFullscreen,
    setShowVideo,
    setIsLandscape,
    setIsMobile,
  };
}
