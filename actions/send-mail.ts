"use server";

import { Resend } from "resend";

type SendEmailProps = {
    to: string;
    subject: string;
// React component to render as email body
    react: React.ReactNode;
};

export async function sendEmail({ to, subject, react }: SendEmailProps) {
  const resend = new Resend(process.env.RESEND_API_KEY || "");

  try {
    const data = await resend.emails.send({
      from: "Finance App <onboarding@resend.dev>",
      to,
      subject,
      react,
    });

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}
