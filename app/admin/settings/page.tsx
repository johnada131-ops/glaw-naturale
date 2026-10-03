"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type NotificationSettings = {
  id: string;
  whatsapp_enabled: boolean;
  admin_whatsapp_number: string | null;
  contact_message_notifications: boolean;
};

type SiteSettings = {
  id: string;
  email: string | null;
  business_phone: string | null;
  business_address: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  linkedin_url: string | null;
  tiktok_url: string | null;
  order_whatsapp_number: string | null;
  maintenance_mode: boolean;
};

export default function SettingsPage() {
  const supabase = createClient();
  const router = useRouter();

  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings | null>(null);

  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(
    null
  );

  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [adminWhatsappNumber, setAdminWhatsappNumber] = useState("");
  const [contactMessageNotifications, setContactMessageNotifications] =
    useState(true);

  const [email, setEmail] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");

  const [instagramUrl, setInstagramUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");

  const [orderWhatsappNumber, setOrderWhatsappNumber] = useState("");

  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const [adminEmail, setAdminEmail] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingNotification, setIsTestingNotification] = useState(false);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [notificationTestMessage, setNotificationTestMessage] = useState("");
  const [accountMessage, setAccountMessage] = useState("");
  const [accountError, setAccountError] = useState("");

  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      setErrorMessage("");

      const [notificationResult, siteResult, userResult] =
        await Promise.all([
          supabase
            .from("notification_settings")
            .select(
              "id, whatsapp_enabled, admin_whatsapp_number, contact_message_notifications"
            )
            .limit(1)
            .maybeSingle(),

          supabase
            .from("site_settings")
            .select(
              "id, email, business_phone, business_address, instagram_url, facebook_url, linkedin_url, tiktok_url, order_whatsapp_number, maintenance_mode"
            )
            .limit(1)
            .maybeSingle(),

          supabase.auth.getUser(),
        ]);

      if (notificationResult.error) {
        console.error(
          "Error loading notification settings:",
          notificationResult.error
        );

        setErrorMessage("We couldn't load your notification settings.");
      }

      if (siteResult.error) {
        console.error("Error loading site settings:", siteResult.error);

        setErrorMessage("We couldn't load your website settings.");
      }

      if (notificationResult.data) {
        const data = notificationResult.data;

        setNotificationSettings(data);
        setWhatsappEnabled(data.whatsapp_enabled);
        setAdminWhatsappNumber(data.admin_whatsapp_number ?? "");
        setContactMessageNotifications(
          data.contact_message_notifications
        );
      }

      if (siteResult.data) {
        const data = siteResult.data;

        setSiteSettings(data);

        setEmail(data.email ?? "");
        setBusinessPhone(data.business_phone ?? "");
        setBusinessAddress(data.business_address ?? "");

        setInstagramUrl(data.instagram_url ?? "");
        setFacebookUrl(data.facebook_url ?? "");
        setLinkedinUrl(data.linkedin_url ?? "");
        setTiktokUrl(data.tiktok_url ?? "");

        setOrderWhatsappNumber(data.order_whatsapp_number ?? "");

        setMaintenanceMode(data.maintenance_mode);
      }

      const currentEmail = userResult.data.user?.email ?? "";

      setAdminEmail(currentEmail);
      setNewAdminEmail(currentEmail);

      setIsLoading(false);
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSuccessMessage("");
    setErrorMessage("");
    setNotificationTestMessage("");

    if (whatsappEnabled && !adminWhatsappNumber.trim()) {
      setErrorMessage(
        "Enter an admin WhatsApp number before enabling notifications."
      );

      setIsSaving(false);
      return;
    }

    if (!notificationSettings || !siteSettings) {
      setErrorMessage(
        "Settings are not ready yet. Please refresh the page."
      );

      setIsSaving(false);
      return;
    }

    const [notificationResult, siteResult] = await Promise.all([
      supabase
        .from("notification_settings")
        .update({
          whatsapp_enabled: whatsappEnabled,
          admin_whatsapp_number:
            adminWhatsappNumber.trim() || null,
          contact_message_notifications: contactMessageNotifications,
          updated_at: new Date().toISOString(),
        })
        .eq("id", notificationSettings.id),

      supabase
        .from("site_settings")
        .update({
          email: email.trim() || null,
          business_phone: businessPhone.trim() || null,
          business_address: businessAddress.trim() || null,

          instagram_url: instagramUrl.trim() || null,
          facebook_url: facebookUrl.trim() || null,
          linkedin_url: linkedinUrl.trim() || null,
          tiktok_url: tiktokUrl.trim() || null,

          order_whatsapp_number:
            orderWhatsappNumber.trim() || null,

          maintenance_mode: maintenanceMode,
          updated_at: new Date().toISOString(),
        })
        .eq("id", siteSettings.id),
    ]);

    if (notificationResult.error || siteResult.error) {
      console.error(
        "Error saving settings:",
        notificationResult.error || siteResult.error
      );

      setErrorMessage("We couldn't save your settings.");
      setIsSaving(false);
      return;
    }

    setSuccessMessage("Settings saved successfully.");
    setIsSaving(false);
  };

  const handleTestNotification = async () => {
    setNotificationTestMessage("");
    setSuccessMessage("");
    setErrorMessage("");

    if (!adminWhatsappNumber.trim()) {
      setNotificationTestMessage(
        "Enter an admin WhatsApp number first."
      );

      return;
    }

    if (!whatsappEnabled) {
      setNotificationTestMessage(
        "WhatsApp notifications are currently turned off."
      );

      return;
    }

    setIsTestingNotification(true);

    /*
     * Meta WhatsApp is not connected yet.
     *
     * We deliberately do not pretend to send a message.
     * This button currently verifies that the notification
     * settings are ready for the provider connection.
     */

    await new Promise((resolve) => setTimeout(resolve, 700));

    setNotificationTestMessage(
      "Your notification settings are ready. WhatsApp is not connected to Meta yet, so no message was sent."
    );

    setIsTestingNotification(false);
  };

  const handleUpdateEmail = async () => {
    setAccountMessage("");
    setAccountError("");

    const trimmedEmail = newAdminEmail.trim();

    if (!trimmedEmail) {
      setAccountError("Enter a new admin email address.");
      return;
    }

    if (trimmedEmail.toLowerCase() === adminEmail.toLowerCase()) {
      setAccountError(
        "The new email address is the same as your current email."
      );
      return;
    }

    setIsUpdatingEmail(true);

    const { error } = await supabase.auth.updateUser({
      email: trimmedEmail,
    });

    if (error) {
      console.error("Error updating admin email:", error);

      setAccountError(error.message);
      setIsUpdatingEmail(false);
      return;
    }

    setAccountMessage(
      "Email change requested. Check the relevant email inboxes and follow Supabase's confirmation instructions."
    );

    setIsUpdatingEmail(false);
  };

  const handleUpdatePassword = async () => {
    setAccountMessage("");
    setAccountError("");

    if (!newPassword) {
      setAccountError("Enter a new password.");
      return;
    }

    if (newPassword.length < 8) {
      setAccountError("Your new password must be at least 8 characters.");
      return;
    }

    setIsUpdatingPassword(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error("Error updating admin password:", error);

      setAccountError(error.message);
      setIsUpdatingPassword(false);
      return;
    }

    setNewPassword("");
    setAccountMessage("Your admin password has been updated.");
    setIsUpdatingPassword(false);
  };

  const handleSignOut = async () => {
    setAccountMessage("");
    setAccountError("");
    setIsSigningOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error signing out:", error);

      setAccountError("We couldn't sign you out. Please try again.");
      setIsSigningOut(false);
      return;
    }

    router.push("/admin/login");
    router.refresh();
  };

  if (isLoading) {
    return (
      <main className="min-h-full bg-[#f7f8fa] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-gray-100 bg-white px-6 py-16 text-center shadow-sm">
            <p className="text-sm text-gray-500">
              Loading settings...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-full bg-[#f7f8fa] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* PAGE HEADER */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red">
            Administration
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-navy sm:text-4xl">
            Settings
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
            Manage the important settings that control the GLAW Naturale
            website and admin system.
          </p>
        </div>

        {successMessage && (
          <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-700">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mt-6 rounded-2xl border border-red/20 bg-red/5 px-5 py-4 text-sm text-red">
            {errorMessage}
          </div>
        )}

        <div className="mt-8 space-y-6">
          {/* NOTIFICATIONS */}
          <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-6 sm:px-8">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-red">
                Notifications
              </p>

              <h2 className="mt-2 text-xl font-bold text-navy">
                WhatsApp Notifications
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                Control how GLAW Naturale receives administrative
                notifications.
              </p>
            </div>

            <div className="space-y-7 px-6 py-6 sm:px-8 sm:py-8">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-navy">
                    WhatsApp notifications
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-gray-500">
                    Turn automatic WhatsApp notifications on or off.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setWhatsappEnabled(!whatsappEnabled)}
                  aria-pressed={whatsappEnabled}
                  className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                    whatsappEnabled ? "bg-red" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                      whatsappEnabled
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="border-t border-gray-100 pt-7">
                <label
                  htmlFor="admin-whatsapp-number"
                  className="text-sm font-semibold text-navy"
                >
                  Admin WhatsApp number
                </label>

                <p className="mt-1 text-sm leading-6 text-gray-500">
                  This is the WhatsApp number that will receive
                  administrative notifications. It is not displayed
                  publicly.
                </p>

                <input
                  id="admin-whatsapp-number"
                  type="tel"
                  value={adminWhatsappNumber}
                  onChange={(event) =>
                    setAdminWhatsappNumber(event.target.value)
                  }
                  placeholder="e.g. 2348069161689"
                  className="mt-4 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-navy outline-none transition-colors placeholder:text-gray-400 focus:border-navy sm:max-w-md"
                />

                <p className="mt-2 text-xs text-gray-400">
                  Use the international format, including the country
                  code.
                </p>
              </div>

              <div className="border-t border-gray-100 pt-7">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-navy">
                      New contact message notifications
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-gray-500">
                      Send a WhatsApp notification whenever a new contact
                      message is received.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setContactMessageNotifications(
                        !contactMessageNotifications
                      )
                    }
                    aria-pressed={contactMessageNotifications}
                    className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                      contactMessageNotifications
                        ? "bg-red"
                        : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                        contactMessageNotifications
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* TEST NOTIFICATION */}
              <div className="border-t border-gray-100 pt-7">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-navy">
                      Test notification
                    </h3>

                    <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
                      Check whether your notification settings are ready
                      before connecting WhatsApp.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleTestNotification}
                    disabled={isTestingNotification}
                    className="shrink-0 rounded-full border border-navy px-5 py-2.5 text-sm font-semibold text-navy transition-all hover:-translate-y-0.5 hover:bg-navy hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isTestingNotification
                      ? "Checking..."
                      : "Test Notification"}
                  </button>
                </div>

                {notificationTestMessage && (
                  <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-700">
                    {notificationTestMessage}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* WEBSITE INFORMATION */}
          <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-6 sm:px-8">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-red">
                Website Information
              </p>

              <h2 className="mt-2 text-xl font-bold text-navy">
                Business Information
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Manage contact information displayed across the website.
              </p>
            </div>

            <div className="grid gap-6 px-6 py-6 sm:grid-cols-2 sm:px-8 sm:py-8">
              <div>
                <label
                  htmlFor="email"
                  className="text-sm font-semibold text-navy"
                >
                  Email
                </label>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  The public email address used across the website.
                </p>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="example@glawnaturale.com"
                  className="mt-3 h-12 w-full rounded-xl border border-gray-200 px-4 text-sm text-navy outline-none focus:border-navy"
                />
              </div>

              <div>
                <label
                  htmlFor="business-phone"
                  className="text-sm font-semibold text-navy"
                >
                  Business phone
                </label>

                <input
                  id="business-phone"
                  type="tel"
                  value={businessPhone}
                  onChange={(event) =>
                    setBusinessPhone(event.target.value)
                  }
                  placeholder="+234..."
                  className="mt-3 h-12 w-full rounded-xl border border-gray-200 px-4 text-sm text-navy outline-none focus:border-navy"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="business-address"
                  className="text-sm font-semibold text-navy"
                >
                  Business address
                </label>

                <textarea
                  id="business-address"
                  value={businessAddress}
                  onChange={(event) =>
                    setBusinessAddress(event.target.value)
                  }
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm leading-6 text-navy outline-none focus:border-navy"
                />
              </div>

              <div className="sm:col-span-2">
                <h3 className="text-sm font-semibold text-navy">
                  Social media
                </h3>

                <div className="mt-4 grid gap-5 sm:grid-cols-2">
                  <input
                    type="url"
                    value={instagramUrl}
                    onChange={(event) =>
                      setInstagramUrl(event.target.value)
                    }
                    placeholder="Instagram URL"
                    className="h-12 rounded-xl border border-gray-200 px-4 text-sm text-navy outline-none focus:border-navy"
                  />

                  <input
                    type="url"
                    value={facebookUrl}
                    onChange={(event) =>
                      setFacebookUrl(event.target.value)
                    }
                    placeholder="Facebook URL"
                    className="h-12 rounded-xl border border-gray-200 px-4 text-sm text-navy outline-none focus:border-navy"
                  />

                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(event) =>
                      setLinkedinUrl(event.target.value)
                    }
                    placeholder="LinkedIn URL"
                    className="h-12 rounded-xl border border-gray-200 px-4 text-sm text-navy outline-none focus:border-navy"
                  />

                  <input
                    type="url"
                    value={tiktokUrl}
                    onChange={(event) =>
                      setTiktokUrl(event.target.value)
                    }
                    placeholder="TikTok URL"
                    className="h-12 rounded-xl border border-gray-200 px-4 text-sm text-navy outline-none focus:border-navy"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ORDERS & CONTACT */}
          <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-6 sm:px-8">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-red">
                Orders & Contact
              </p>

              <h2 className="mt-2 text-xl font-bold text-navy">
                Customer Communication
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Manage the numbers and contact information used for
                customer communication.
              </p>
            </div>

            <div className="grid gap-6 px-6 py-6 sm:grid-cols-2 sm:px-8 sm:py-8">
              <div>
                <label
                  htmlFor="order-whatsapp"
                  className="text-sm font-semibold text-navy"
                >
                  Order WhatsApp number
                </label>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Number customers use when placing WhatsApp orders.
                </p>

                <input
                  id="order-whatsapp"
                  type="tel"
                  value={orderWhatsappNumber}
                  onChange={(event) =>
                    setOrderWhatsappNumber(event.target.value)
                  }
                  placeholder="234..."
                  className="mt-3 h-12 w-full rounded-xl border border-gray-200 px-4 text-sm text-navy outline-none focus:border-navy"
                />
              </div>
            </div>
          </section>

          {/* ACCOUNT */}
          <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-6 sm:px-8">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-red">
                Account
              </p>

              <h2 className="mt-2 text-xl font-bold text-navy">
                Admin Account
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Manage the email address and password used to access the
                GLAW Naturale admin dashboard.
              </p>
            </div>

            <div className="space-y-8 px-6 py-6 sm:px-8 sm:py-8">
              {/* EMAIL */}
              <div>
                <label
                  htmlFor="admin-email"
                  className="text-sm font-semibold text-navy"
                >
                  Current admin email
                </label>

                <input
                  id="admin-email"
                  type="email"
                  value={adminEmail}
                  disabled
                  className="mt-3 h-12 w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-gray-500 sm:max-w-md"
                />

                <div className="mt-6">
                  <label
                    htmlFor="new-admin-email"
                    className="text-sm font-semibold text-navy"
                  >
                    Change admin email
                  </label>

                  <p className="mt-1 text-sm leading-6 text-gray-500">
                    Supabase may require email confirmation before the new
                    address becomes active.
                  </p>

                  <div className="mt-3 flex flex-col gap-3 sm:max-w-xl sm:flex-row">
                    <input
                      id="new-admin-email"
                      type="email"
                      value={newAdminEmail}
                      onChange={(event) =>
                        setNewAdminEmail(event.target.value)
                      }
                      placeholder="new-admin@example.com"
                      className="h-12 flex-1 rounded-xl border border-gray-200 px-4 text-sm text-navy outline-none focus:border-navy"
                    />

                    <button
                      type="button"
                      onClick={handleUpdateEmail}
                      disabled={isUpdatingEmail}
                      className="h-12 shrink-0 rounded-xl border border-navy px-5 text-sm font-semibold text-navy transition-colors hover:bg-navy hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isUpdatingEmail
                        ? "Updating..."
                        : "Update Email"}
                    </button>
                  </div>
                </div>
              </div>

              {/* PASSWORD */}
              <div className="border-t border-gray-100 pt-8">
                <label
                  htmlFor="new-password"
                  className="text-sm font-semibold text-navy"
                >
                  Change admin password
                </label>

                <p className="mt-1 text-sm leading-6 text-gray-500">
                  Use at least 8 characters. You do not need to enter your
                  current password while already authenticated.
                </p>

                <div className="mt-3 flex flex-col gap-3 sm:max-w-xl sm:flex-row">
                  <input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(event) =>
                      setNewPassword(event.target.value)
                    }
                    placeholder="New password"
                    minLength={8}
                    className="h-12 flex-1 rounded-xl border border-gray-200 px-4 text-sm text-navy outline-none focus:border-navy"
                  />

                  <button
                    type="button"
                    onClick={handleUpdatePassword}
                    disabled={isUpdatingPassword}
                    className="h-12 shrink-0 rounded-xl border border-navy px-5 text-sm font-semibold text-navy transition-colors hover:bg-navy hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isUpdatingPassword
                      ? "Updating..."
                      : "Update Password"}
                  </button>
                </div>
              </div>

              {/* ACCOUNT FEEDBACK */}
              {(accountMessage || accountError) && (
                <div
                  className={`rounded-xl px-4 py-3 text-sm leading-6 ${
                    accountError
                      ? "border border-red/20 bg-red/5 text-red"
                      : "border border-green-200 bg-green-50 text-green-700"
                  }`}
                >
                  {accountError || accountMessage}
                </div>
              )}

              {/* SIGN OUT */}
              <div className="border-t border-gray-100 pt-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-navy">
                      Sign out
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-gray-500">
                      End your current admin session on this device.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="rounded-xl border border-red px-5 py-2.5 text-sm font-semibold text-red transition-colors hover:bg-red hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSigningOut ? "Signing out..." : "Sign Out"}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* SYSTEM */}
          <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-6 sm:px-8">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-red">
                System
              </p>

              <h2 className="mt-2 text-xl font-bold text-navy">
                Website Controls
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Controls for future technical and operational features.
              </p>
            </div>

            <div className="px-6 py-6 sm:px-8 sm:py-8">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-navy">
                    Maintenance mode
                  </h3>

                  <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
                    Temporarily hide the public website while keeping the
                    admin dashboard accessible.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setMaintenanceMode(!maintenanceMode)
                  }
                  aria-pressed={maintenanceMode}
                  className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                    maintenanceMode ? "bg-red" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                      maintenanceMode
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* SAVE */}
          <div className="flex justify-end pb-8">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-full bg-navy px-7 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-red hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save All Settings"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}