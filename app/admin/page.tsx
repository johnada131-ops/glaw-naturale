"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FiBell,
  FiBookOpen,
  FiChevronLeft,
  FiChevronRight,
  FiExternalLink,
  FiHome,
  FiLogOut,
  FiMail,
  FiPackage,
  FiSettings,
  FiUsers,
} from "react-icons/fi";
import { createClient } from "@/lib/supabase/client";

const navigation = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: FiHome,
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: FiPackage,
  },
  {
    label: "Blog",
    href: "/admin/blog",
    icon: FiBookOpen,
  },
  {
    label: "Messages",
    href: "/admin/messages",
    icon: FiMail,
  },
  {
    label: "Subscribers",
    href: "/admin/subscribers",
    icon: FiUsers,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: FiSettings,
  },
];

type NotificationMessage = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  created_at: string;
};

const SUBSCRIBER_LAST_SEEN_KEY = "glaw_subscriber_last_seen";

export default function AdminDashboardPage() {
  /*
   * One sidebar state for both desktop and mobile.
   *
   * true  = expanded
   * false = collapsed
   */
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [productCount, setProductCount] = useState(0);
  const [blogPostCount, setBlogPostCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [subscriberCount, setSubscriberCount] = useState(0);

  const [loadingStats, setLoadingStats] = useState(true);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notifications, setNotifications] = useState<
    NotificationMessage[]
  >([]);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const [newSubscriberCount, setNewSubscriberCount] = useState(0);

  const unreadNotificationCount = notifications.length;

  useEffect(() => {
    const supabase = createClient();

    async function loadDashboardStats() {
      const [
        productsResult,
        blogResult,
        messagesResult,
        subscribersResult,
      ] = await Promise.all([
        supabase
          .from("products")
          .select("*", {
            count: "exact",
            head: true,
          }),

        supabase
          .from("blog_posts")
          .select("*", {
            count: "exact",
            head: true,
          }),

        supabase
          .from("contact_messages")
          .select("*", {
            count: "exact",
            head: true,
          }),

        supabase
          .from("newsletter_subscribers")
          .select("*", {
            count: "exact",
            head: true,
          }),
      ]);

      if (!productsResult.error) {
        setProductCount(productsResult.count ?? 0);
      }

      if (!blogResult.error) {
        setBlogPostCount(blogResult.count ?? 0);
      }

      if (!messagesResult.error) {
        setMessageCount(messagesResult.count ?? 0);
      }

      if (!subscribersResult.error) {
        setSubscriberCount(subscribersResult.count ?? 0);
      }

      setLoadingStats(false);
    }

    async function loadNotifications() {
      const settingsResult = await supabase
        .from("notification_settings")
        .select("contact_message_notifications")
        .limit(1)
        .maybeSingle();

      if (!settingsResult.error && settingsResult.data) {
        const enabled =
          settingsResult.data.contact_message_notifications === true;

        setNotificationsEnabled(enabled);

        if (!enabled) {
          setNotifications([]);
        }
      }

      const messagesResult = await supabase
        .from("contact_messages")
        .select("id, name, email, subject, created_at")
        .eq("status", "unread")
        .order("created_at", {
          ascending: false,
        })
        .limit(10);

      if (!messagesResult.error) {
        setNotifications(messagesResult.data ?? []);
      }
    }

    async function loadSubscriberNotifications() {
      /*
       * Get the newest subscriber so we can determine
       * whether anything new has arrived since the admin
       * last viewed the subscriber notification.
       */
      const latestResult = await supabase
        .from("newsletter_subscribers")
        .select("id, created_at")
        .order("created_at", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

      if (latestResult.error) {
        console.error(
          "Error checking subscriber notifications:",
          latestResult.error
        );
        return;
      }

      if (!latestResult.data) {
        setNewSubscriberCount(0);
        return;
      }

      const latestCreatedAt = new Date(
        latestResult.data.created_at
      ).getTime();

      const storedLastSeen = window.localStorage.getItem(
        SUBSCRIBER_LAST_SEEN_KEY
      );

      /*
       * First time opening the dashboard:
       * treat all existing subscribers as already seen.
       */
      if (!storedLastSeen) {
        window.localStorage.setItem(
          SUBSCRIBER_LAST_SEEN_KEY,
          latestResult.data.created_at
        );

        setNewSubscriberCount(0);
        return;
      }

      const lastSeenTime = new Date(storedLastSeen).getTime();

      /*
       * If the newest subscriber is newer than the last
       * seen timestamp, count how many active records
       * arrived since then.
       */
      if (latestCreatedAt > lastSeenTime) {
        const newSubscribersResult = await supabase
          .from("newsletter_subscribers")
          .select("id, created_at", {
            count: "exact",
            head: true,
          })
          .gt("created_at", storedLastSeen);

        if (!newSubscribersResult.error) {
          setNewSubscriberCount(newSubscribersResult.count ?? 0);
        }

        return;
      }

      setNewSubscriberCount(0);
    }

    loadDashboardStats();
    loadNotifications();
    loadSubscriberNotifications();

    const interval = window.setInterval(() => {
      loadNotifications();
      loadSubscriberNotifications();
      loadDashboardStats();
    }, 15000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  function markSubscribersAsSeen() {
    const now = new Date().toISOString();

    window.localStorage.setItem(
      SUBSCRIBER_LAST_SEEN_KEY,
      now
    );

    setNewSubscriberCount(0);
  }

  async function handleSignOut() {
    const supabase = createClient();

    await supabase.auth.signOut();

    window.location.href = "/admin/login";
  }

  function formatNotificationTime(dateString: string) {
    const date = new Date(dateString);

    return date.toLocaleString("en-NG", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* =========================================================
          ADMIN SIDEBAR
          Same collapse/expand behavior on desktop and mobile.
      ========================================================== */}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col
          border-r border-border bg-white
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? "w-[270px]" : "w-[64px]"}
        `}
      >
        {/* LOGO / HEADER */}
        <div
          className={`
            flex h-[76px] shrink-0 items-center border-b border-border
            ${
              sidebarOpen
                ? "justify-start px-4"
                : "justify-center px-2"
            }
          `}
        >
          <Link
            href="/admin"
            className="flex min-w-0 items-center"
            aria-label="GLAW Naturale Admin"
          >
            {sidebarOpen ? (
              <Image
                src="/brand/glaw-naturale-logo.svg"
                alt="GLAW Naturale"
                width={150}
                height={50}
                className="h-auto w-[150px]"
              />
            ) : (
              <Image
                src="/icon.png"
                alt="GLAW Naturale"
                width={38}
                height={38}
                className="h-9 w-9 rounded-lg object-contain"
              />
            )}
          </Link>
        </div>

        {/* ADMIN LABEL */}
        <div
          className={`
            shrink-0 border-b border-border
            ${sidebarOpen ? "px-4 py-4" : "flex justify-center px-2 py-4"}
          `}
        >
          {sidebarOpen ? (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                GLAW Naturale
              </p>

              <p className="mt-1 font-[var(--font-montserrat)] text-sm font-bold text-navy">
                Admin
              </p>
            </div>
          ) : (
            <span className="text-xs font-bold text-navy">A</span>
          )}
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;

              /*
               * This dashboard file is /admin,
               * so Dashboard is the active item here.
               */
              const isActive = item.href === "/admin";

              const isMessageItem = item.label === "Messages";
              const isSubscriberItem = item.label === "Subscribers";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={!sidebarOpen ? item.label : undefined}
                  onClick={() => {
                    if (isSubscriberItem) {
                      markSubscribersAsSeen();
                    }
                  }}
                  className={`
                    group relative flex items-center rounded-xl
                    text-sm font-semibold transition-colors
                    ${
                      sidebarOpen
                        ? "gap-3 px-4 py-3"
                        : "justify-center px-2 py-3"
                    }
                    ${
                      isActive
                        ? "bg-navy text-white"
                        : "text-navy hover:bg-surface"
                    }
                  `}
                >
                  <Icon
                    size={19}
                    className={
                      isActive
                        ? "shrink-0 text-white"
                        : "shrink-0 text-muted group-hover:text-navy"
                    }
                  />

                  {sidebarOpen && <span>{item.label}</span>}

                  {/* MESSAGE NOTIFICATION */}
                  {sidebarOpen &&
                    isMessageItem &&
                    unreadNotificationCount > 0 && (
                      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red px-1.5 text-[10px] font-bold text-white">
                        {unreadNotificationCount > 9
                          ? "9+"
                          : unreadNotificationCount}
                      </span>
                    )}

                  {!sidebarOpen &&
                    isMessageItem &&
                    unreadNotificationCount > 0 && (
                      <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red px-1 text-[9px] font-bold text-white ring-2 ring-white">
                        {unreadNotificationCount > 9
                          ? "9+"
                          : unreadNotificationCount}
                      </span>
                    )}

                  {/* SUBSCRIBER NOTIFICATION */}
                  {sidebarOpen &&
                    isSubscriberItem &&
                    newSubscriberCount > 0 && (
                      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red px-1.5 text-[10px] font-bold text-white">
                        {newSubscriberCount > 9
                          ? "9+"
                          : newSubscriberCount}
                      </span>
                    )}

                  {!sidebarOpen &&
                    isSubscriberItem &&
                    newSubscriberCount > 0 && (
                      <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red px-1 text-[9px] font-bold text-white ring-2 ring-white">
                        {newSubscriberCount > 9
                          ? "9+"
                          : newSubscriberCount}
                      </span>
                    )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* BOTTOM ACTIONS */}
        <div className="shrink-0 border-t border-border p-3">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title={!sidebarOpen ? "View Website" : undefined}
            className={`
              mb-2 flex items-center rounded-xl bg-red
              text-sm font-semibold text-white
              transition-colors hover:bg-navy
              ${
                sidebarOpen
                  ? "gap-3 px-4 py-3"
                  : "justify-center px-2 py-3"
              }
            `}
          >
            <FiExternalLink size={18} className="shrink-0" />

            {sidebarOpen && <span>View Website</span>}
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            title={!sidebarOpen ? "Sign Out" : undefined}
            className={`
              flex w-full items-center rounded-xl
              text-sm font-semibold text-navy
              transition-colors hover:bg-surface
              ${
                sidebarOpen
                  ? "gap-3 px-4 py-3"
                  : "justify-center px-2 py-3"
              }
            `}
          >
            <FiLogOut size={18} className="shrink-0" />

            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>

        {/* COLLAPSE / EXPAND BUTTON */}
        <button
          type="button"
          onClick={() => setSidebarOpen((current) => !current)}
          className="
            absolute -right-3 top-[88px]
            flex h-7 w-7 items-center justify-center
            rounded-full border border-border bg-white
            text-navy shadow-sm transition-colors
            hover:bg-surface
          "
          aria-label={
            sidebarOpen
              ? "Collapse admin navigation"
              : "Expand admin navigation"
          }
        >
          {sidebarOpen ? (
            <FiChevronLeft size={15} />
          ) : (
            <FiChevronRight size={15} />
          )}
        </button>
      </aside>

      {/* =========================================================
          MAIN AREA
      ========================================================== */}

      <div
        className={`
          min-h-screen
          transition-[padding] duration-300 ease-in-out
          ${sidebarOpen ? "pl-[270px]" : "pl-[64px]"}
        `}
      >
        {/* =====================================================
            NOTIFICATION BUTTON
        ====================================================== */}

        <div className="fixed right-4 top-4 z-40 sm:right-8 lg:right-10">
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setNotificationOpen((current) => !current)
              }
              className="
                relative flex h-11 w-11 items-center
                justify-center rounded-full border border-border
                bg-white text-navy shadow-sm
                transition-colors hover:bg-surface
              "
              aria-label="Notifications"
              aria-expanded={notificationOpen}
            >
              <FiBell size={19} />

              {notificationsEnabled &&
                unreadNotificationCount > 0 && (
                  <span
                    className="
                      absolute -right-1 -top-1
                      flex h-5 min-w-5 items-center justify-center
                      rounded-full bg-red px-1.5
                      text-[10px] font-bold text-white
                      ring-2 ring-[#f8fafc]
                    "
                  >
                    {unreadNotificationCount > 9
                      ? "9+"
                      : unreadNotificationCount}
                  </span>
                )}
            </button>

            {notificationOpen && (
              <div
                className="
                  absolute right-0 top-14
                  w-[min(360px,calc(100vw-2rem))]
                  overflow-hidden rounded-2xl
                  border border-border bg-white shadow-xl
                "
              >
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                  <div>
                    <p className="font-[var(--font-montserrat)] text-sm font-bold text-navy">
                      Notifications
                    </p>

                    <p className="mt-1 text-xs text-muted">
                      {notificationsEnabled
                        ? unreadNotificationCount > 0
                          ? `${unreadNotificationCount} unread ${
                              unreadNotificationCount === 1
                                ? "message"
                                : "messages"
                            }`
                          : "You're all caught up."
                        : "Notifications are disabled."}
                    </p>
                  </div>

                  <FiBell size={17} className="text-muted" />
                </div>

                {!notificationsEnabled ? (
                  <div className="px-5 py-8 text-center">
                    <p className="text-sm font-medium text-navy">
                      Contact notifications are disabled.
                    </p>

                    <Link
                      href="/admin/settings"
                      onClick={() => setNotificationOpen(false)}
                      className="mt-3 inline-flex text-xs font-semibold text-red hover:text-navy"
                    >
                      Open Settings →
                    </Link>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="px-5 py-10 text-center">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-surface text-muted">
                      <FiBell size={18} />
                    </div>

                    <p className="mt-4 text-sm font-semibold text-navy">
                      No new notifications
                    </p>

                    <p className="mt-1 text-xs leading-5 text-muted">
                      New contact messages will appear here.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="max-h-[360px] overflow-y-auto">
                      {notifications.map((notification) => (
                        <Link
                          key={notification.id}
                          href="/admin/messages"
                          onClick={() =>
                            setNotificationOpen(false)
                          }
                          className="
                            block border-b border-border
                            px-5 py-4 transition-colors
                            hover:bg-surface
                          "
                        >
                          <div className="flex gap-3">
                            <div
                              className="
                                mt-1 flex h-8 w-8 shrink-0
                                items-center justify-center
                                rounded-full bg-red-50 text-red
                              "
                            >
                              <FiMail size={15} />
                            </div>

                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-navy">
                                New message from {notification.name}
                              </p>

                              <p className="mt-1 truncate text-xs text-muted">
                                {notification.subject ||
                                  "Contact message"}
                              </p>

                              <p className="mt-1 text-[11px] text-muted">
                                {formatNotificationTime(
                                  notification.created_at
                                )}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>

                    <div className="border-t border-border px-5 py-3">
                      <Link
                        href="/admin/messages"
                        onClick={() =>
                          setNotificationOpen(false)
                        }
                        className="text-xs font-semibold text-red transition-colors hover:text-navy"
                      >
                        View all messages →
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* =====================================================
            DASHBOARD CONTENT
        ====================================================== */}

        <main className="px-4 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
          <div className="mx-auto max-w-7xl">
            {/* HEADING */}
            <div className="mb-8 pr-14">
              <p className="text-sm font-semibold text-red">
                GLAW Naturale Admin
              </p>

              <h1 className="mt-1 font-[var(--font-montserrat)] text-3xl font-bold text-navy sm:text-4xl">
                Welcome back.
              </h1>

              <p className="mt-2 text-sm text-muted sm:text-base">
                Manage your website, products and content from here.
              </p>
            </div>

            {/* NOTIFICATION ALERT */}
            {notificationsEnabled &&
              unreadNotificationCount > 0 && (
                <Link
                  href="/admin/messages"
                  className="
                    mb-8 flex items-center gap-4 rounded-2xl
                    border border-red/20 bg-red/5 p-4
                    transition-colors hover:bg-red/10
                  "
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red text-white">
                    <FiBell size={18} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-navy">
                      You have {unreadNotificationCount} new{" "}
                      {unreadNotificationCount === 1
                        ? "contact message"
                        : "contact messages"}
                      .
                    </p>

                    <p className="mt-1 text-xs text-muted">
                      Click to open your Messages.
                    </p>
                  </div>

                  <FiChevronRight
                    size={18}
                    className="ml-auto shrink-0 text-red"
                  />
                </Link>
              )}

            {/* SUBSCRIBER ALERT */}
            {newSubscriberCount > 0 && (
              <Link
                href="/admin/subscribers"
                onClick={markSubscribersAsSeen}
                className="
                  mb-8 flex items-center gap-4 rounded-2xl
                  border border-red/20 bg-red/5 p-4
                  transition-colors hover:bg-red/10
                "
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red text-white">
                  <FiUsers size={18} />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-navy">
                    You have {newSubscriberCount} new{" "}
                    {newSubscriberCount === 1
                      ? "newsletter subscriber"
                      : "newsletter subscribers"}
                    .
                  </p>

                  <p className="mt-1 text-xs text-muted">
                    Click to open your Subscribers.
                  </p>
                </div>

                <FiChevronRight
                  size={18}
                  className="ml-auto shrink-0 text-red"
                />
              </Link>
            )}

            {/* WELCOME PANEL */}
            <section className="mb-8 overflow-hidden rounded-2xl bg-navy p-6 shadow-sm sm:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                    Admin Workspace
                  </p>

                  <h2 className="mt-2 font-[var(--font-montserrat)] text-2xl font-bold text-white sm:text-3xl">
                    Your website is taking shape.
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-white/70">
                    Manage the parts of GLAW Naturale that are already
                    connected to your admin system, and continue building
                    from one workspace.
                  </p>
                </div>

                <Link
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    inline-flex shrink-0 items-center
                    justify-center gap-2 rounded-full
                    bg-red px-6 py-3 text-sm font-semibold
                    text-white transition-colors
                    hover:bg-white hover:text-navy
                  "
                >
                  <FiExternalLink size={16} />
                  View Website
                </Link>
              </div>
            </section>

            {/* OVERVIEW */}
            <section>
              <div className="mb-5">
                <h2 className="font-[var(--font-montserrat)] text-xl font-bold text-navy">
                  Overview
                </h2>

                <p className="mt-1 text-sm text-muted">
                  A quick look at your current admin workspace.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
                {/* PRODUCTS */}
                <Link
                  href="/admin/products"
                  className="
                    group rounded-2xl border border-border
                    bg-white p-6 shadow-sm transition-colors
                    hover:border-red hover:bg-surface
                  "
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red">
                      <FiPackage size={21} />
                    </div>

                    <FiChevronRight
                      size={18}
                      className="
                        text-muted transition-transform
                        group-hover:translate-x-1 group-hover:text-red
                      "
                    />
                  </div>

                  <p className="mt-5 text-sm font-medium text-muted">
                    Products
                  </p>

                  <p className="mt-1 font-[var(--font-montserrat)] text-3xl font-bold text-navy">
                    {loadingStats ? "..." : productCount}
                  </p>

                  <p className="mt-2 text-sm text-muted">
                    Current product catalog
                  </p>
                </Link>

                {/* BLOG */}
                <Link
                  href="/admin/blog"
                  className="
                    group rounded-2xl border border-border
                    bg-white p-6 shadow-sm transition-colors
                    hover:border-red hover:bg-surface
                  "
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red">
                      <FiBookOpen size={21} />
                    </div>

                    <FiChevronRight
                      size={18}
                      className="
                        text-muted transition-transform
                        group-hover:translate-x-1 group-hover:text-red
                      "
                    />
                  </div>

                  <p className="mt-5 text-sm font-medium text-muted">
                    Blog Posts
                  </p>

                  <p className="mt-1 font-[var(--font-montserrat)] text-3xl font-bold text-navy">
                    {loadingStats ? "..." : blogPostCount}
                  </p>

                  <p className="mt-2 text-sm text-muted">
                    Articles and health content
                  </p>
                </Link>

                {/* MESSAGES */}
                <Link
                  href="/admin/messages"
                  className="
                    group rounded-2xl border border-border
                    bg-white p-6 shadow-sm transition-colors
                    hover:border-red hover:bg-surface
                  "
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red">
                      <FiMail size={21} />
                    </div>

                    {unreadNotificationCount > 0 && (
                      <span className="rounded-full bg-red px-2 py-1 text-[10px] font-bold text-white">
                        {unreadNotificationCount} new
                      </span>
                    )}
                  </div>

                  <p className="mt-5 text-sm font-medium text-muted">
                    Messages
                  </p>

                  <p className="mt-1 font-[var(--font-montserrat)] text-3xl font-bold text-navy">
                    {loadingStats ? "..." : messageCount}
                  </p>

                  <p className="mt-2 text-sm text-muted">
                    Contact messages
                  </p>
                </Link>

                {/* SUBSCRIBERS */}
                <Link
                  href="/admin/subscribers"
                  onClick={markSubscribersAsSeen}
                  className="
                    group rounded-2xl border border-border
                    bg-white p-6 shadow-sm transition-colors
                    hover:border-red hover:bg-surface
                  "
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red">
                      <FiUsers size={21} />
                    </div>

                    {newSubscriberCount > 0 ? (
                      <span className="rounded-full bg-red px-2 py-1 text-[10px] font-bold text-white">
                        {newSubscriberCount > 9
                          ? "9+ new"
                          : `${newSubscriberCount} new`}
                      </span>
                    ) : (
                      <FiChevronRight
                        size={18}
                        className="
                          text-muted transition-transform
                          group-hover:translate-x-1 group-hover:text-red
                        "
                      />
                    )}
                  </div>

                  <p className="mt-5 text-sm font-medium text-muted">
                    Subscribers
                  </p>

                  <p className="mt-1 font-[var(--font-montserrat)] text-3xl font-bold text-navy">
                    {loadingStats ? "..." : subscriberCount}
                  </p>

                  <p className="mt-2 text-sm text-muted">
                    Newsletter subscribers
                  </p>
                </Link>

                {/* SETTINGS */}
                <Link
                  href="/admin/settings"
                  className="
                    group rounded-2xl border border-border
                    bg-white p-6 shadow-sm transition-colors
                    hover:border-red hover:bg-surface
                  "
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red">
                      <FiSettings size={21} />
                    </div>

                    <FiChevronRight
                      size={18}
                      className="
                        text-muted transition-transform
                        group-hover:translate-x-1 group-hover:text-red
                      "
                    />
                  </div>

                  <p className="mt-5 text-sm font-medium text-muted">
                    Settings
                  </p>

                  <p className="mt-1 font-[var(--font-montserrat)] text-3xl font-bold text-navy">
                    —
                  </p>

                  <p className="mt-2 text-sm text-muted">
                    Website configuration
                  </p>
                </Link>
              </div>
            </section>

            {/* GET STARTED */}
            <section className="mt-10">
              <div className="mb-5">
                <h2 className="font-[var(--font-montserrat)] text-xl font-bold text-navy">
                  Get Started
                </h2>

                <p className="mt-1 text-sm text-muted">
                  Common actions from your admin workspace.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Link
                  href="/admin/products/new"
                  className="
                    group flex items-center justify-between
                    rounded-2xl border border-border bg-white
                    p-5 shadow-sm transition-colors
                    hover:border-red hover:bg-surface
                  "
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red">
                      <FiPackage size={20} />
                    </div>

                    <div>
                      <p className="font-semibold text-navy">
                        Add a Product
                      </p>

                      <p className="mt-1 text-sm text-muted">
                        Add a new GLAW Naturale drink.
                      </p>
                    </div>
                  </div>

                  <FiChevronRight
                    size={18}
                    className="
                      text-muted transition-transform
                      group-hover:translate-x-1 group-hover:text-red
                    "
                  />
                </Link>

                <Link
                  href="/admin/blog"
                  className="
                    group flex items-center justify-between
                    rounded-2xl border border-border bg-white
                    p-5 shadow-sm transition-colors
                    hover:border-red hover:bg-surface
                  "
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red">
                      <FiBookOpen size={20} />
                    </div>

                    <div>
                      <p className="font-semibold text-navy">
                        Manage Blog
                      </p>

                      <p className="mt-1 text-sm text-muted">
                        Create and manage health content.
                      </p>
                    </div>
                  </div>

                  <FiChevronRight
                    size={18}
                    className="
                      text-muted transition-transform
                      group-hover:translate-x-1 group-hover:text-red
                    "
                  />
                </Link>
              </div>
            </section>

            {/* CURRENT STAGE */}
            <section className="mt-10">
              <div className="rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-7">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">
                      Current Stage
                    </p>

                    <h2 className="mt-2 font-[var(--font-montserrat)] text-xl font-bold text-navy">
                      Admin foundation is ready.
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                      Products, blog management, contact messages and
                      newsletter subscribers are connected to the custom
                      admin system.
                    </p>
                  </div>

                  <div className="shrink-0 rounded-full bg-red-50 px-4 py-2 text-xs font-bold text-red">
                    Admin Ready
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}