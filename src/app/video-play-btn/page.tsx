"use client";

import dynamic from "next/dynamic";


const VideoPageComponent = dynamic(() => import("./VideoPageComponent"), {
  ssr: false,
});

export default function VideoPage() {
  return (
      <VideoPageComponent />
  );
}
