"use client";

import Logo from "@/components/logo";
import Link from "next/link";

export default function Confirmation() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Thank you message */}
        <h1
          className="text-white text-center text-xl sm:text-2xl md:text-3xl"
          style={{
            fontFamily: "RH Serif",
            fontStyle: "normal",
            fontWeight: "400",
            padding: "0 68px",
            textTransform: "uppercase",
            letterSpacing: "0.48px",
          }}
        >
          THANK YOU FOR CONFIRMING YOUR RSVP
        </h1>

        <a
          href="mailto:RHParisOpeningParty@rh.com?subject=Reserve%20a%20Table%20at%20Le%20Jardin%20or%20Le%20Petit%20RH&amp;body=Please%20request%20a%20table%20for%20a%20party%20of%20two%20or%20four%20beginning%20at%207pm%20until%2011pm.%0A%0AReservations%20are%20exclusively%20available%20for%20guests%20invited%20to%20the%20unveiling%20of%20RH%20Paris%20on%204%20September"
          className="bg-white text-black px-[72px] h-[48px] text-center flex items-center justify-center mt-[48px]"
        >
          <span style={{
            fontFamily: "RH Sans",
            fontSize: "13px",
            fontStyle: "normal",
            fontWeight: "600",
            lineHeight: "13px",
            letterSpacing: "0.44px",
            textTransform: "uppercase",
            }}>BOOK A TABLE</span>
        </a>
      </div>

      {/* RH PARIS Logo */}
      <div className="flex justify-center pb-28">
        <Logo width={166} height={135} />
      </div>
    </div>
  );
}
