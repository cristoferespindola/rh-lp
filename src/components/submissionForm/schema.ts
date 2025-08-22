import { z } from "zod";

export const FormSchema = z.object({
    firstName: z.string().min(1, {
      message: "First name is required.",
    }),
    lastName: z.string().min(1, {
      message: "Last name is required.",
    }),
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    phone: z.string().optional(),
    plusOne: z.string().min(1, {
      message: "Please select number of attendees.",
    }),
  });
  
  export type FormData = z.infer<typeof FormSchema>;

  export const FORM_FIELDS: {
    name: keyof FormData;
    label: string;
    required: boolean;
    type: string;
    placeholder?: string;
  }[] = [
    {
      name: "firstName",
      label: "First Name",
      required: true,
      type: "text",
      placeholder: "First Name*",
    },
    {
      name: "lastName",
      label: "Last Name",
      required: true,
      type: "text",
      placeholder: "Last Name*",
    },
    {
      name: "email",
      label: "Email",
      required: true,
      type: "email",
      placeholder: "Email*",
    },
    {
      name: "plusOne",
      label: "Number of Guests",
      required: true,
      type: "selector",
    },
  ];