import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: "unread" | "read" | "archived";
  created_at: string;
  updated_at: string;
};

type WebhookPayload = {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  schema: string;
  record: ContactMessage | null;
  old_record: ContactMessage | null;
};

export async function POST(request: NextRequest) {
  try {
    /*
     * ---------------------------------------------------------
     * 1. Verify the Supabase webhook request
     * ---------------------------------------------------------
     */

    const webhookSecret = process.env.CONTACT_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error(
        "CONTACT_WEBHOOK_SECRET is not configured."
      );

      return NextResponse.json(
        {
          success: false,
          error: "Webhook security is not configured.",
        },
        { status: 500 }
      );
    }

    const incomingSecret = request.headers.get("apikey");

    if (
      !incomingSecret ||
      incomingSecret !== webhookSecret
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    /*
     * ---------------------------------------------------------
     * 2. Read the webhook payload
     * ---------------------------------------------------------
     */

    const payload =
      (await request.json()) as WebhookPayload;

    /*
     * We only care about new contact messages.
     */

    if (
      payload.type !== "INSERT" ||
      payload.schema !== "public" ||
      payload.table !== "contact_messages" ||
      !payload.record
    ) {
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: "Not a new contact message.",
      });
    }

    const contactMessage = payload.record;

    /*
     * ---------------------------------------------------------
     * 3. Create a server-side Supabase client
     * ---------------------------------------------------------
     *
     * This key must NEVER be exposed to the browser.
     */

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const supabaseSecretKey =
      process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !supabaseSecretKey) {
      console.error(
        "Supabase server credentials are missing."
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Supabase server credentials are not configured.",
        },
        { status: 500 }
      );
    }

    const supabase = createClient(
      supabaseUrl,
      supabaseSecretKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    /*
     * ---------------------------------------------------------
     * 4. Load notification settings
     * ---------------------------------------------------------
     */

    const { data: settings, error: settingsError } =
      await supabase
        .from("notification_settings")
        .select(
          `
          whatsapp_enabled,
          admin_whatsapp_number,
          contact_message_notifications
          `
        )
        .limit(1)
        .maybeSingle();

    if (settingsError) {
      console.error(
        "Error loading notification settings:",
        settingsError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Could not load notification settings.",
        },
        { status: 500 }
      );
    }

    /*
     * ---------------------------------------------------------
     * 5. Check contact-message notifications
     * ---------------------------------------------------------
     */

    if (!settings?.contact_message_notifications) {
      return NextResponse.json({
        success: true,
        skipped: true,
        reason:
          "Contact message notifications are disabled.",
      });
    }

    /*
     * ---------------------------------------------------------
     * 6. Check WhatsApp notifications
     * ---------------------------------------------------------
     */

    if (!settings.whatsapp_enabled) {
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: "WhatsApp notifications are disabled.",
      });
    }

    /*
     * ---------------------------------------------------------
     * 7. Check admin WhatsApp number
     * ---------------------------------------------------------
     */

    const adminWhatsAppNumber =
      settings.admin_whatsapp_number?.trim();

    if (!adminWhatsAppNumber) {
      console.error(
        "WhatsApp notifications are enabled, but no admin WhatsApp number is configured."
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "No admin WhatsApp number is configured.",
        },
        { status: 400 }
      );
    }

    /*
     * ---------------------------------------------------------
     * 8. Read Meta WhatsApp credentials
     * ---------------------------------------------------------
     *
     * These will be added when Meta WhatsApp Business
     * Platform is connected.
     */

    const whatsappAccessToken =
      process.env.WHATSAPP_ACCESS_TOKEN;

    const whatsappPhoneNumberId =
      process.env.WHATSAPP_PHONE_NUMBER_ID;

    /*
     * Meta is not connected yet.
     *
     * Stop safely instead of pretending a notification
     * was sent.
     */

    if (
      !whatsappAccessToken ||
      !whatsappPhoneNumberId
    ) {
      console.log(
        "Contact message received, but WhatsApp provider is not connected yet."
      );

      return NextResponse.json({
        success: true,
        skipped: true,
        reason:
          "WhatsApp provider is not connected yet.",
        contact_message_id: contactMessage.id,
      });
    }

    /*
     * ---------------------------------------------------------
     * 9. Format the WhatsApp notification
     * ---------------------------------------------------------
     */

    const formattedDate = new Date(
      contactMessage.created_at
    ).toLocaleString("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Africa/Lagos",
    });

    const whatsappMessage = [
      "🔔 *New GLAW Naturale Contact Message*",
      "",
      `*Name:* ${contactMessage.name}`,
      `*Email:* ${contactMessage.email}`,
      `*Phone:* ${
        contactMessage.phone || "Not provided"
      }`,
      `*Subject:* ${
        contactMessage.subject || "No subject"
      }`,
      "",
      "*Message:*",
      contactMessage.message,
      "",
      `*Received:* ${formattedDate}`,
    ].join("\n");

    /*
     * ---------------------------------------------------------
     * 10. Send through Meta WhatsApp Cloud API
     * ---------------------------------------------------------
     */

    const whatsappApiUrl =
      `https://graph.facebook.com/v23.0/${whatsappPhoneNumberId}/messages`;

    const whatsappResponse = await fetch(
      whatsappApiUrl,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${whatsappAccessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: adminWhatsAppNumber,
          type: "text",
          text: {
            preview_url: false,
            body: whatsappMessage,
          },
        }),
      }
    );

    const whatsappResult =
      await whatsappResponse.json();

    /*
     * ---------------------------------------------------------
     * 11. Handle WhatsApp API errors
     * ---------------------------------------------------------
     */

    if (!whatsappResponse.ok) {
      console.error(
        "Meta WhatsApp API error:",
        whatsappResult
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "WhatsApp notification could not be sent.",
        },
        { status: 502 }
      );
    }

    /*
     * ---------------------------------------------------------
     * 12. Success
     * ---------------------------------------------------------
     */

    console.log(
      `WhatsApp notification sent for contact message ${contactMessage.id}.`
    );

    return NextResponse.json({
      success: true,
      sent: true,
      contact_message_id: contactMessage.id,
      provider: "meta-whatsapp-cloud-api",
    });
  } catch (error) {
    console.error(
      "Unexpected contact notification error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Unexpected notification error.",
      },
      { status: 500 }
    );
  }
}