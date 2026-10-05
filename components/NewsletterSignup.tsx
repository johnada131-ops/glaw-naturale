"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setMessageType("error");
      setMessage("Please enter your email address.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    setMessageType("");

    const supabase = createClient();

    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({
        email: trimmedEmail,
        status: "active",
      });

    if (error) {
      console.error("Newsletter subscription error:", error);

      if (error.code === "23505") {
        setMessageType("error");
        setMessage("This email is already subscribed.");
      } else {
        setMessageType("error");
        setMessage("We couldn't subscribe you right now. Please try again.");
      }

      setIsSubmitting(false);
      return;
    }

    setEmail("");
    setMessageType("success");
    setMessage("You're subscribed. Thank you!");

    setIsSubmitting(false);
  }

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="mt-6 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row"
      >
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>

        <input
          id="newsletter-email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Your email address"
          required
          disabled={isSubmitting}
          className="min-h-11 flex-1 rounded-full border border-white/20 bg-white px-5 text-sm text-navy outline-none placeholder:text-gray-400 focus:border-white disabled:cursor-not-allowed disabled:opacity-70"
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="min-h-11 rounded-full bg-red px-6 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-navy disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Subscribing..." : "Subscribe"}
        </button>
      </form>

      {message && (
        <p
          className={`mt-3 text-xs leading-5 ${
            messageType === "success"
              ? "text-green-300"
              : "text-red-200"
          }`}
          role="status"
        >
          {message}
        </p>
      )}
    </div>
  );
}