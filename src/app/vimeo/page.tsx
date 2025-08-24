"use client";

export default function VimeoPage() {
  return (
    <div>
      <div style={{padding: "67.2% 0 0 0", position: "relative"}}>
        <iframe
          src="https://player.vimeo.com/video/1112605590?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          style={{position: "absolute", top: 0, left: 0, width: "100%", height: "100%"}}
          title="Spec_Ad_Dear Paris_Video_v39_iPad_Invite_English Comp"
        ></iframe>
      </div>
      <script src="https://player.vimeo.com/api/player.js" async></script>
    </div>
  );
}
