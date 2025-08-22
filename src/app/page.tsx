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
            Phone: formData.phone,
            "Are you bringing a plus one": formData.plusOne,
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
      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* Logo */}
        <div className="flex justify-center mb-12">
          <Logo />
        </div>

        {/* Main Heading */}
        <div className="text-center mb-4 lg:mb-8 max-w-md mx-auto mt-12 lg:mt-16">
          <h1
            className="text-3xl text-white mb-2 px-8"
            style={{
              textAlign: "center",
              fontFamily: "RH Serif",
              fontSize: "38px",
              fontStyle: "normal",
              fontWeight: "300",
              lineHeight: "48px",
              letterSpacing: "-1.3px",
              textTransform: "uppercase",
            }}
          >
            PLEASE CONFIRM YOUR RSVP
          </h1>
          <p className="text-white text-sm font-rh-sans pt-5" style={{
              fontSize: "16px",
              fontStyle: "normal",
              fontWeight: "300",
              lineHeight: "24px",
              letterSpacing: "0.24px",
          }}>
            Kindly provide the following details.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 flex flex-col lg:gap-4">
          {/* Name Fields */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-4">
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-4 mb-0">
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
            <div>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 h-12 bg-black border border-white text-white rounded-none focus:outline-none focus:border-white font-rh-sans font-light placeholder-gray-400"
                placeholder="Phone"
              />
            </div>

            <div className="flex flex-col gap-4 relative">
              <div className="w-full absolute -top-6 left-0">
                <p className="text-white text-sm mb-2 font-rh-sans font-light">
                  Will you be bringing a plus one?
                </p>
              </div>
              <div className="w-full">
                <Select onValueChange={handleSelectChange}>
                  <SelectTrigger className="w-full px-3 py-2 !h-12 text-md bg-black border border-white text-white rounded-none focus:outline-none focus:border-white appearance-none font-rh-sans font-light">
                    <SelectValue className="text-white font-rh-sans text-lg" placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border border-white text-white rounded-none">
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 lg:pt-6 flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-1/2 mx-auto bg-white text-black font-rh-sans font-roman py-4 px-8 hover:bg-gray-100 focus:outline-none transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "SUBMITTING..." : "SUBMIT"}
            </button>
          </div>

          {/* Status Messages */}
          {submitStatus === "success" && (
            <div className="mt-6 p-4 bg-green-900 border border-green-700">
              <p className="text-sm font-medium text-green-300">
                RSVP submitted successfully!
              </p>
            </div>
          )}

          {submitStatus === "error" && (
            <div className="mt-6 p-4 bg-red-900 border border-red-700">
              <p className="text-sm font-medium text-red-300">
                Error submitting RSVP. Please try again.
              </p>
            </div>
          )}
        </form>
      </main>
    </div>
  );
}
