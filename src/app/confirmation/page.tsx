"use client";

import Logo from "@/components/logo";

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
              padding: "0 70px",
              textTransform: "uppercase",
              letterSpacing: "0.48px",
            }}
          >
            THANK YOU FOR CONFIRMING YOUR RSVP
          </h1>
        </div>

        {/* RH PARIS Logo */}
        <div className="flex justify-center pb-28">
          <Logo width={166} height={135} />
        </div>
      </div>
  );
}