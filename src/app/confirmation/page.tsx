"use client";

import Logo from "@/components/logo";

export default function Confirmation() {
      return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Thank you message */}
          <h1 
            className="text-white text-center"
            style={{
              fontFamily: "RH Serif",
              fontSize: "32px",
              fontStyle: "normal",
              fontWeight: "300",
              lineHeight: "40px",
              textTransform: "uppercase",
              letterSpacing: "-0.5px",
            }}
          >
            THANK YOU FOR CONFIRMING YOUR RSVP
          </h1>
        </div>

        {/* RH PARIS Logo */}
        <div className="flex justify-center pb-12">
          <Logo width={166} height={135} />
        </div>
      </div>
  );
}