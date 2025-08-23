"use client";

import React, { useState, useEffect } from "react";
import { TurnOnPhone } from "@/components/svg/TurnOnPhone";

export default function VideoPage() {
  const [isMobile, setIsMobile] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [showVideo, setShowVideo] = useState(false);



  useEffect(() => {
    // Load Wistia script
    const loadWistiaScript = () => {
      if (!document.querySelector('script[src*="fast.wistia.com"]')) {
        const script = document.createElement('script');
        script.src = '//fast.wistia.com/assets/external/E-v1.js';
        script.async = true;
        document.head.appendChild(script);
      }
    };

    // Check if device is mobile
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as Window & { opera?: string }).opera || "";
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      setIsMobile(isMobileDevice);
    };

    // Check orientation
    const checkOrientation = () => {
      const isLandscapeOrientation = window.innerWidth > window.innerHeight;
      console.log('Orientation check:', { width: window.innerWidth, height: window.innerHeight, isLandscape: isLandscapeOrientation });
      setIsLandscape(isLandscapeOrientation);
      
      // If mobile and landscape, show video
      if (isMobile && isLandscapeOrientation) {
        setShowVideo(true);
      }
    };

    // Initial checks
    loadWistiaScript();
    checkMobile();
    checkOrientation();

    // Listen for orientation changes
    const handleOrientationChange = () => {
      setTimeout(checkOrientation, 100); // Small delay to ensure orientation is updated
    };

    const handleResize = () => {
      checkOrientation();
    };

    // Add event listeners
    window.addEventListener("orientationchange", handleOrientationChange);
    window.addEventListener("resize", handleResize);
    
    // For devtools testing, also listen for device orientation
    if ('ondeviceorientation' in window) {
      window.addEventListener('deviceorientation', handleOrientationChange);
    }

    // Cleanup
    return () => {
      window.removeEventListener("orientationchange", handleOrientationChange);
      window.removeEventListener("resize", handleResize);
      if ('ondeviceorientation' in window) {
        window.removeEventListener('deviceorientation', handleOrientationChange);
      }
    };
  }, [isMobile]);

  // Effect to handle video autoplay when mobile landscape
  useEffect(() => {
    if (isMobile && isLandscape && showVideo) {
      // Wait for Wistia to be ready and then autoplay
      const initVideo = () => {
        const wistiaWindow = window as Window & { Wistia?: { api: (id: string) => { play: () => void } } };
        if (wistiaWindow.Wistia) {
          const video = wistiaWindow.Wistia.api('avj1qhbupb');
          if (video) {
            video.play();
          }
        } else {
          // If Wistia isn't ready yet, try again in 500ms
          setTimeout(initVideo, 500);
        }
      };
      
      setTimeout(initVideo, 1000); // Give time for the embed to load
    }
  }, [isMobile, isLandscape, showVideo]);

  // Effect to configure video styling for full screen
  useEffect(() => {
    const configureVideoStyling = () => {
      // Add CSS to make video fill the container
      const style = document.createElement('style');
      style.textContent = `
        .wistia_embed {
          position: relative !important;
          width: 100vw !important;
          height: 100vh !important;
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
      `;
      document.head.appendChild(style);
    };

    configureVideoStyling();
  }, []);

  // If not mobile, show video directly
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

  // If mobile and not landscape, show rotation screen
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

  // If mobile and landscape, show video
  if (isMobile && isLandscape && showVideo) {
    return (
      <div className="min-h-screen bg-black">
        <div 
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

  return null;
}