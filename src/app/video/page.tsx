"use client";

import React, { useState, useEffect, useRef } from "react";
import { TurnOnPhone } from "@/components/svg/TurnOnPhone";

export default function VideoPage() {
  const [isMobile, setIsMobile] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

    // Only clear our container, don't remove it
    if (ref.current) {
      ref.current.innerHTML = "";
    }

    const wistiaMessage = document.querySelector('#video-message ~ div') as HTMLElement;
    if (wistiaMessage) {
        console.log("wistiaMessage", wistiaMessage);
      wistiaMessage.style.display = 'none';
    }

    // Only remove Wistia chrome elements, not our containers
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

    // Check orientation
    const checkOrientation = () => {
      const isLandscapeOrientation = window.innerWidth > window.innerHeight;
      console.log("Orientation check:", {
        width: window.innerWidth,
        height: window.innerHeight,
        isLandscape: isLandscapeOrientation,
      });
      setIsLandscape(isLandscapeOrientation);

      if (isMobile && isLandscapeOrientation) {
        setShowVideo(true);
      } else if (isMobile && !isLandscapeOrientation) {
        setShowVideo(false);
        stopVideo();
      }
    };

    loadWistiaScript();
    checkMobile();
    checkOrientation();

    const handleOrientationChange = () => {
      setTimeout(checkOrientation, 100);
    };

    const handleResize = () => {
      checkOrientation();
    };

    window.addEventListener("orientationchange", handleOrientationChange);
    window.addEventListener("resize", handleResize);

    if ("ondeviceorientation" in window) {
      window.addEventListener("deviceorientation", handleOrientationChange);
    }

    // Cleanup
    return () => {
      window.removeEventListener("orientationchange", handleOrientationChange);
      window.removeEventListener("resize", handleResize);
      if ("ondeviceorientation" in window) {
        window.removeEventListener(
          "deviceorientation",
          handleOrientationChange
        );
      }
    };
  }, [isMobile]);

  useEffect(() => {
    if (isMobile && isLandscape && showVideo) {
      const initVideo = () => {
        const wistiaWindow = window as Window & {
          Wistia?: {
            api: (id: string) => { play: () => void; pause: () => void };
          };
        };
        if (wistiaWindow.Wistia) {
          const video = wistiaWindow.Wistia.api("avj1qhbupb");
          if (video) {
            video.play();
          }
        } else {
          setTimeout(initVideo, 500);
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
        if (ref.current) {
          ref.current.innerHTML = "";
        }
      }, 100);
    }
  }, [isMobile, isLandscape]);


  useEffect(() => {
    const configureVideoStyling = () => {
      const style = document.createElement("style");
      style.textContent = `
        /* Mobile viewport fixes */
        body {
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
        }
        
        /* Full screen container */
        .min-h-screen {
          min-height: 100vh !important;
          min-height: 100dvh !important;
          width: 100vw !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        
        .wistia_embed {
          position: relative !important;
          width: 100vw !important;
          height: 100vh !important;
          height: 100dvh !important;
        }
        .wistia_embed iframe {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
        }
        .wistia_embed video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
        }
        
        /* Hide Wistia chrome elements when in portrait mode */
        [id^="wistia_chrome_"] {
          display: none !important;
        }
        
        /* Show Wistia chrome elements only when in landscape and video is ready */
        .landscape-mode [id^="wistia_chrome_"] {
          display: inline-block !important;
        }
        
        /* Mobile specific fixes */
        @media screen and (max-width: 768px) {
          body {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            background-color: #000 !important;
          }
          
          .min-h-screen {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            background-color: #000 !important;
          }
          
          /* iPhone safe area support */
          @supports (padding: env(safe-area-inset-top)) {
            body {
              padding-top: env(safe-area-inset-top) !important;
              padding-bottom: env(safe-area-inset-bottom) !important;
              padding-left: env(safe-area-inset-left) !important;
              padding-right: env(safe-area-inset-right) !important;
            }
            
            .min-h-screen {
              padding-top: env(safe-area-inset-top) !important;
              padding-bottom: env(safe-area-inset-bottom) !important;
              padding-left: env(safe-area-inset-left) !important;
              padding-right: env(safe-area-inset-right) !important;
            }
          }
        }
      `;
      document.head.appendChild(style);
    };

    configureVideoStyling();
  }, []);

  if (!isMobile) {
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
      <div className="min-h-screen bg-black landscape-mode">
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
        />
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
