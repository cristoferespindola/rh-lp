"use client";

import React, { useEffect, useRef } from "react";
import "./styles.css";

// container ref dimensions 932/400
// first left 44% top 17% width 12% height 13%
// second left 39% top 36% width 22% height 13%
// third left 33% top 57% width 34% height 13%

// cover
// const HOTSPOTS = [
//   {
//     x: 44,
//     y: 17,
//     w: 12,
//     h: 13,
//     label: "Hotspot 1",
//     id: "hotspot-1",
//     href: "https://rhparisevent.com",
//     target: "_self",
//     time: 2.35
//   },
//   {
//     x: 39,
//     y: 36,
//     w: 22,
//     h: 13,
//     label: "Hotspot 2",
//     id: "hotspot-2",
//     href: "mailto:RHParisOpeningParty@rh.com?subject=Reserve%20a%20Table%20at%20Le%20Jardin%20or%20Le%20Petit%20RH&body=Please%20request%20a%20table%20for%20a%20party%20of%20two%20or%20four%20beginning%20at%207pm%20until%2011pm.%0A%0AReservations%20are%20exclusively%20available%20for%20guests%20invited%20to%20the%20unveiling%20of%20RH%20Paris%20on%204%20September",
//     target: "_self",
//     time: 2.37
//   },
//   {
//     x: 33,
//     y: 57,
//     w: 34,
//     h: 13,
//     label: "Hotspot 3",
//     id: "hotspot-3",
//     href: "#",
//     target: "_self",
//     time: 2.40
//   }
// ];

// fill
const HOTSPOTS = [
    {
      x: 44,
      y: 25,
      w: 12,
      h: 11,
      label: "Hotspot 1",
      id: "hotspot-1",
      href: "https://rhparisevent.com",
      target: "_self",
      time: 2.35
    },
    {
      x: 39,
      y: 40,
      w: 22,
      h: 11,
      label: "Hotspot 2",
      id: "hotspot-2",
      href: "mailto:RHParisOpeningParty@rh.com?subject=Reserve%20a%20Table%20at%20Le%20Jardin%20or%20Le%20Petit%20RH&body=Please%20request%20a%20table%20for%20a%20party%20of%20two%20or%20four%20beginning%20at%207pm%20until%2011pm.%0A%0AReservations%20are%20exclusively%20available%20for%20guests%20invited%20to%20the%20unveiling%20of%20RH%20Paris%20on%204%20September",
      target: "_self",
      time: 2.37
    },
    {
      x: 33,
      y: 54,
      w: 34,
      h: 11,
      label: "Hotspot 3",
      id: "hotspot-3",
      href: "#",
      target: "_self",
      time: 2.40
    }
  ];


interface VideoOverlayActionsProps {
  visibleHotspots?: string[];
  containerId?: string;
}

function renderHotspots(container: HTMLElement, visibleHotspots: string[]) {
  container.innerHTML = "";
  HOTSPOTS.forEach(h => {
    // Only render hotspots that are visible
    if (!visibleHotspots.includes(h.id)) {
      return;
    }
    
    const a = document.createElement("a");
    a.className = "wistia-hotspot";
    a.href = h.href;
    a.target = h.target || "_self";
    a.setAttribute("aria-label", h.label || h.id);

    a.style.left   = h.x + "%";
    a.style.top    = h.y + "%";
    a.style.width  = h.w + "%";
    a.style.height = h.h + "%";

    // if (h.label) a.textContent = h.label;
    container.appendChild(a);
  });
}

export default function VideoOverlayActions({ 
  visibleHotspots = [], 
}: VideoOverlayActionsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (innerRef.current) {
      renderHotspots(innerRef.current, visibleHotspots);
    }
  }, [visibleHotspots]);

  useEffect(() => {
    console.log("visibleHotspots", visibleHotspots);
    if (containerRef.current) {
      if (visibleHotspots.length > 0) {
        containerRef.current.classList.add("show");
      } else {
        containerRef.current.classList.remove("show");
      }
    }
  }, [visibleHotspots]);

  return (
    <div 
      ref={containerRef}
      className="wistia-hotspots"
    >
        <div ref={innerRef} className="relative w-full h-full"/>
    </div>
  );
}