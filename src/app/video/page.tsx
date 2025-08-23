"use client";

import React, { useState, useEffect, useRef } from "react";
import { TurnOnPhone } from "@/components/svg/TurnOnPhone";
import { Play, Maximize, Minimize } from "lucide-react";

import "./style.css";

export default function VideoPage() {
  const [isMobile, setIsMobile] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const customPlayButtonRef = useRef<HTMLButtonElement>(null);

  const handlePlayAndFullscreen = () => {
    console.log("Play and fullscreen button clicked");
    
    const wistiaWindow = window as Window & {
      Wistia?: {
        api: (id: string) => {
          play: () => void;
          pause: () => void;
          requestFullscreen: () => void;
        };
      };
    };

    if (wistiaWindow.Wistia) {
      const video = wistiaWindow.Wistia.api("avj1qhbupb");
      if (video) {
        // First play the video
        try {
          video.play();
          setIsPlaying(true);
          console.log("Video play command sent");
        } catch (err) {
          console.log("Wistia play failed:", err);
        }

        // Then try to enter fullscreen
        setTimeout(() => {
          const videoElement = document.querySelector("#wistia-video-mobile video") as HTMLVideoElement;
          const containerElement = document.querySelector("#wistia-video-mobile-fullscreen") as HTMLElement;
          
          if (videoElement) {
            // Try video element first
            videoElement.requestFullscreen().then(() => {
              setIsFullscreen(true);
              console.log("Video fullscreen successful");
            }).catch((err) => {
              console.log("Video fullscreen failed, trying container:", err);
              // Fallback to container element
              if (containerElement && containerElement.requestFullscreen) {
                containerElement.requestFullscreen().then(() => {
                  setIsFullscreen(true);
                  console.log("Container fullscreen successful");
                }).catch((err2) => {
                  console.log("Container fullscreen also failed:", err2);
                });
              }
            });
          } else if (containerElement) {
            // Try container element directly
            containerElement.requestFullscreen().then(() => {
              setIsFullscreen(true);
              console.log("Container fullscreen successful");
            }).catch((err) => {
              console.log("Container fullscreen failed:", err);
            });
          }
        }, 500);
      }
    }
  };

  const handleFullscreenToggle = () => {
    if (isFullscreen) {
      // Exit fullscreen
      console.log("Exiting fullscreen...");
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as Document & { mozCancelFullScreen?: () => void }).mozCancelFullScreen) {
        (document as Document & { mozCancelFullScreen?: () => void }).mozCancelFullScreen?.();
      } else if ((document as Document & { webkitExitFullscreen?: () => void }).webkitExitFullscreen) {
        (document as Document & { webkitExitFullscreen?: () => void }).webkitExitFullscreen?.();
      }
      setIsFullscreen(false);
    } else {
      // Enter fullscreen
      console.log("Entering fullscreen...");
      
      const videoElement = document.querySelector("#wistia-video-mobile video") as HTMLVideoElement;
      const containerElement = document.querySelector("#wistia-video-mobile-fullscreen") as HTMLElement;
      
      if (videoElement) {
        // Try video element first
        videoElement.requestFullscreen().then(() => {
          setIsFullscreen(true);
        }).catch((err) => {
          console.log("Video fullscreen failed, trying container:", err);
          // Fallback to container element
          if (containerElement && containerElement.requestFullscreen) {
            containerElement.requestFullscreen().then(() => {
              setIsFullscreen(true);
            }).catch((err2) => {
              console.log("Container fullscreen also failed:", err2);
            });
          }
        });
      } else if (containerElement) {
        // Try container element directly
        containerElement.requestFullscreen().then(() => {
          setIsFullscreen(true);
        }).catch((err) => {
          console.log("Container fullscreen failed:", err);
        });
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
        setIsPlaying(false);
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
            _wq?: Array<{ id: string; onReady: (video: { requestFullscreen: () => void }) => void }>;
          };
          
          if (wistiaWindow._wq) {
            wistiaWindow._wq.push({
              id: "avj1qhbupb",
              onReady: (video) => {
                console.log("Wistia video ready via queue");
                (window as Window & { wistiaVideo?: { requestFullscreen: () => void } }).wistiaVideo = video;
              }
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

  // Desktop video initialization
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
            console.log("Desktop: Wistia video found, ready for user interaction");
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

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
    };
  }, []);

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
          data-autoplay="false"
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
          data-autoplay="false"
          data-muted="false"
          data-video-foam="true"
          data-fitStrategy="cover"
          data-playsinline="true"
          data-webkit-playsinline="true"
        />

        {/* Custom Play and Fullscreen Button */}
        {!isPlaying && (
          <button
            ref={customPlayButtonRef}
            onClick={handlePlayAndFullscreen}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-black bg-opacity-80 text-white p-6 rounded-full hover:bg-opacity-90 transition-all duration-200 flex items-center justify-center"
          >
            <Play className="w-12 h-12 ml-1" />
          </button>
        )}

        {/* Fullscreen Toggle Button (only when playing) */}
        {isPlaying && (
          <button
            onClick={handleFullscreenToggle}
            className="absolute top-4 left-4 z-50 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-all duration-200"
          >
            {isFullscreen ? <Minimize /> : <Maximize />}
          </button>
        )}
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
