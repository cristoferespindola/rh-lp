"use client";

import { useState } from "react";
import Logo from "@/components/logo";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  plusOne: string;
}

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    plusOne: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      plusOne: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbyPRPn4Ix6u-J6JEeA8juthXBB4WGQKxJaYY2Jjc1-mSdmqzAQDZJ3v177Po1oDZ9s8/exec",
        {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            "First Name": formData.firstName,
            "Last Name": formData.lastName,
            Email: formData.email,
            Phone: '',
            "Number of Guests": formData.plusOne,
            Date: new Date().toISOString().split("T")[0],
          }),
        }
      );

      setSubmitStatus("success");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        plusOne: "",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="max-w-3xl mx-auto px-4 py-12 flex flex-col gap-10 lg:gap-20">
        {/* Logo */}
        <div className="flex justify-center">
          <Logo />
        </div>

        {/* Main Heading */}
        {submitStatus === "idle" || submitStatus === "error" ? (
          <>
            <div className="text-center max-w-3xs mx-auto">
              <h1
                className="text-3xl text-white"
                style={{
                  textAlign: "center",
                  fontFamily: "RH Serif",
                  fontSize: "29px",
                  fontStyle: "normal",
                  fontWeight: "300",
                  lineHeight: "32px",
                  textTransform: "uppercase",
                }}
              >
                PLEASE CONFIRM YOUR RSVP
              </h1>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-6 flex flex-col gap-20"
            >
              <div className="flex flex-col gap-8 mb-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
                  <div>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 h-12 bg-black border border-white text-white rounded-none focus:outline-none focus:border-white font-rh-sans font-light placeholder-gray-400"
                      placeholder="First Name"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 h-12 bg-black border border-white text-white rounded-none focus:outline-none focus:border-white font-rh-sans font-light placeholder-gray-400"
                      placeholder="Last Name"
                    />
                  </div>
                </div>

                {/* Email and Phone Fields */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-4 mb-0">
                  <div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 h-12 bg-black border border-white text-white rounded-none focus:outline-none focus:border-white font-rh-sans font-light placeholder-gray-400"
                    />
                  </div>

                  <div className="flex flex-col gap-4 relative">
                    <div className="w-full">
                      <Select onValueChange={handleSelectChange} required>
                        <SelectTrigger className="w-full px-3 py-2 !h-12 text-md bg-black border border-white text-white rounded-none focus:outline-none focus:border-white appearance-none font-rh-sans font-light">
                          <SelectValue
                            className="text-white font-rh-sans text-lg"
                            placeholder="Number of Guests"
                          />
                        </SelectTrigger>
                        <SelectContent className="bg-black border border-white text-white rounded-none">
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2 (you and a guest)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center relative">
                <div className="absolute -top-[76px] lg:-top-16 left-0 w-full">
                  {submitStatus === "error" ? (
                    <div className="p-4 bg-transparent border border-red-700">
                      <p className="text-sm font-medium text-red-300">
                        Error submitting. Please try again.
                      </p>
                    </div>
                  ) : null}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 mx-auto bg-white cursor-pointer text-black font-rh-sans font-roman py-4 px-8 hover:bg-gray-100 focus:outline-none transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "SUBMITTING..." : "CONFIRM"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-8 mb-0">
              <div className="bg-transparent max-w-[732px] mx-auto">
                <p
                  className="text-sm font-medium text-white font-rh-sans"
                  style={{
                    textAlign: "center",
                    fontFamily: "RH Serif",
                    fontSize: "29px",
                    fontStyle: "normal",
                    fontWeight: "300",
                    lineHeight: "36px",
                    textTransform: "uppercase",
                  }}
                >
                  thank you for confirming your attendance.
                  <br />
                  <br />
                  we look forward to welcoming you
                  <br />
                  forthe unveiling of rh paris.
                </p>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
