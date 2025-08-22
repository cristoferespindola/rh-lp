"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Selector from "../selector";
import { Input } from "../ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { FormData, FormSchema, FORM_FIELDS } from "./schema";

const GOOGLE_FORM_URL = process.env.NEXT_PUBLIC_GOOGLE_FORM_URL as string;

const CustomInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    style?: React.CSSProperties;
  }
>(({ type, placeholder, style, ...props }, ref) => {
  return (
    <Input
      ref={ref}
      type={type}
      placeholder={placeholder}
      className="w-full px-3 py-2 h-12 bg-black border border-white text-white rounded-none focus:outline-none focus:border-white font-helvetica font-light"
      style={{
        fontSize: "13px",
        fontStyle: "normal",
        fontWeight: "300",
        lineHeight: "17.25px",
        letterSpacing: "0.4px",
        ...style,
      }}
      {...props}
    />
  );
});
CustomInput.displayName = "CustomInput";



export default function SubmissionForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      plusOne: "1",
    },
  });

  const handleSelectChange = (value: string) => {
    form.setValue("plusOne", value);
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      await fetch(GOOGLE_FORM_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "First Name": data.firstName,
          "Last Name": data.lastName,
          Email: data.email,
          Phone: data.phone || "",
          "Number of Guests": data.plusOne,
          Date: new Date().toISOString().split("T")[0],
        }),
      });

      toast.success("RSVP submitted successfully!");

      form.reset();

      setTimeout(() => {
        router.push("/confirmation");
      }, 1000);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Error submitting RSVP. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 flex flex-col gap-12 px-5 md:max-w-[80%] lg:max-w-none w-full mx-auto"
      >
        <div className="flex flex-col gap-4 mb-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {FORM_FIELDS.map(fieldConfig => (
              <FormField
                key={fieldConfig.name}
                control={form.control}
                name={fieldConfig.name}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      {fieldConfig.type === "text" ||
                      fieldConfig.type === "email" ? (
                        <CustomInput
                          type={fieldConfig.type}
                          placeholder={fieldConfig.placeholder}
                          {...field}
                        />
                      ) : (
                        <Selector
                          value={field.value || "1"}
                          onChange={handleSelectChange}
                          required
                        />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-center relative">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-[235px] mx-auto bg-white cursor-pointer text-black font-rh-sans font-roman h-12 flex items-center justify-center px-8 hover:bg-gray-100 focus:outline-none transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "SUBMITTING..." : "CONFIRM"}
          </button>
        </div>
      </form>
    </Form>
  );
}
