"use client";

import React, { useState, useEffect, useRef } from "react";
import { TurnOnPhone } from "@/components/svg/TurnOnPhone";
import { Play, Maximize, Minimize } from "lucide-react";
import { domEvent } from "dom-event-simulate";

import "./style.css";

export default function VimeoPage() {
  const [isMobile, setIsMobile] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fullscreenButtonRef = useRef<HTMLButtonElement>(null);

  const simulateFullscreenClick = () => {
    console.log("Simulating fullscreen click...");
    
    if (fullscreenButtonRef.current) {
      const button = fullscreenButtonRef.current;
      const rect = button.getBoundingClientRect();
      
      // Calculate center coordinates of the button
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      console.log("Button coordinates:", { centerX, centerY, rect });
      
      // Simulate mouse/touch events
      try {
        // Simulate mousedown
        domEvent(button, 'mousedown', {
          clientX: centerX,
          clientY: centerY,
        });
        
        // Simulate mouseup (click)
        domEvent(button, 'mouseup', {
          clientX: centerX,
          clientY: centerY,
        });
        
        // Simulate click
        domEvent(button, 'click', {
          clientX: centerX,
          clientY: centerY,
        });
        
        console.log("Click simulation completed");
      } catch (error) {
        console.log("Click simulation failed:", error);
      }
    }
  };

  const handlePlayAndFullscreen = () => {
    console.log("Play and fullscreen button clicked");
    
    if (videoRef.current) {
      // First play the video
      videoRef.current.play().then(() => {
        setIsPlaying(true);
        console.log("Video play successful");
        
        // Then try to enter fullscreen via simulated click
        setTimeout(() => {
          simulateFullscreenClick();
        }, 500);
      }).catch((err) => {
        console.log("Video play failed:", err);
      });
    }
  };

  const handleFullscreenToggle = () => {
    if (isFullscreen) {
      // Exit fullscreen
      console.log("Exiting fullscreen...");
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    } else {
      // Enter fullscreen
      console.log("Entering fullscreen...");
      
      if (videoRef.current) {
        videoRef.current.requestFullscreen().then(() => {
          setIsFullscreen(true);
        }).catch((err) => {
          console.log("Fullscreen failed:", err);
        });
      }
    }
  };

  const stopVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  useEffect(() => {
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
        // Exit fullscreen when rotating back to portrait
        if (document.fullscreenElement) {
          document.exitFullscreen();
          setIsFullscreen(false);
        }
      }
    };

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

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      } else {
        setIsFullscreen(true);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  if (!isMobile) {
    console.log("Desktop mode - rendering video");
    return (
      <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          src="/720p.mp4"
          className="w-full h-full object-cover"
          controls
          playsInline
          preload="metadata"
        />
      </div>
    );
  }

  if (isMobile && !isLandscape) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-8 overflow-hidden">
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
      <div className="min-h-screen bg-black relative overflow-hidden">
        <video
          ref={videoRef}
          src="/720p.mp4"
          className="w-full h-full object-cover"
          playsInline
          preload="metadata"
        />

        {/* Custom Play and Fullscreen Button */}
        {!isPlaying && (
          <button
            onClick={handlePlayAndFullscreen}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-black bg-opacity-80 text-white p-6 rounded-full hover:bg-opacity-90 transition-all duration-200 flex items-center justify-center"
          >
            <Play className="w-12 h-12 ml-1" />
          </button>
        )}

        {/* Fullscreen Toggle Button (only when playing) */}
        {isPlaying && (
          <button
            ref={fullscreenButtonRef}
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
      <div className="min-h-screen bg-black flex items-center justify-center text-white overflow-hidden">
        <div className="text-center">
          <h1 className="text-2xl font-rh-sans font-light">Loading Video...</h1>
        </div>
      </div>
    );
  }

  return null;
}
