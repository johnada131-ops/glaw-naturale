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
  FiMail,
  FiPackage,
  FiSettings,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

type NotificationMessage = {
  id: string;
  name: string | null;
  email: string | null;
  message: string | null;
  created_at: string;
  is_read: boolean;
};

const SUBSCRIBER_LAST_SEEN_KEY = "glaw_admin_subscribers_last_seen";

export default function AdminDashboard() {
  /*
   * Desktop sidebar:
   * true  = expanded
   * false = collapsed
   *
   * Mobile:
   * sidebar is completely hidden.
   */
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [productCount, setProductCount] = useState(0);
  const [blogPostCount, setBlogPostCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [subscriberCount, setSubscriberCount] = useState(0);

  const [loadingStats, setLoadingStats] = useState(true);

  const [notificationsEnabled, setNotificationsEnabled] =
    useState(true);

  const [notifications, setNotifications] = useState<
    NotificationMessage[]
  >([]);

  const [notificationOpen, setNotificationOpen] = useState(false);

  const [newSubscriberCount, setNewSubscriberCount] = useState(0);

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

  useEffect(() => {
    loadDashboardData();

    const interval = setInterval(() => {
      loadDashboardData();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  async function loadDashboardData() {
    try {
      const [
        productsResult,
        blogResult,
        messagesResult,
        subscribersResult,
        settingsResult,
        notificationsResult,
      ] = await Promise.all([
        supabase
          .from("products")
          .select("*", { count: "exact", head: true }),

        supabase
          .from("blog_posts")
          .select("*", { count: "exact", head: true }),

        supabase
          .from("contact_messages")
          .select("*", { count: "exact", head: true }),

        supabase
          .from("subscribers")
          .select("*", { count: "exact", head: true }),

        supabase
          .from("admin_settings")
          .select("notifications_enabled")
          .maybeSingle(),

        supabase
          .from("contact_messages")
          .select(
            "id, name, email, message, created_at, is_read"
          )
          .order("created_at", {
            ascending: false,
          })
          .limit(8),
      ]);

      setProductCount(productsResult.count ?? 0);
      setBlogPostCount(blogResult.count ?? 0);
      setMessageCount(messagesResult.count ?? 0);
      setSubscriberCount(subscribersResult.count ?? 0);

      if (!settingsResult.error && settingsResult.data) {
        setNotificationsEnabled(
          settingsResult.data.notifications_enabled ?? true
        );
      }

      if (!notificationsResult.error) {
        setNotifications(notificationsResult.data ?? []);
      }

      /*
       * Subscriber notification tracking.
       * We remember the subscriber count the last time
       * the admin viewed the dashboard.
       */
      if (typeof window !== "undefined") {
        const storedLastSeen = localStorage.getItem(
          SUBSCRIBER_LAST_SEEN_KEY
        );

        if (storedLastSeen) {
          const lastSeenCount = Number(storedLastSeen);

          if (!Number.isNaN(lastSeenCount)) {
            setNewSubscriberCount(
              Math.max(0, (subscribersResult.count ?? 0) - lastSeenCount)
            );
          }
        } else {
          setNewSubscriberCount(0);
        }
      }
    } catch (error) {
      console.error("Failed to load admin dashboard data:", error);
    } finally {
      setLoadingStats(false);
    }
  }

  function markSubscribersAsSeen() {
    if (typeof window === "undefined") return;

    localStorage.setItem(
      SUBSCRIBER_LAST_SEEN_KEY,
      String(subscriberCount)
    );

    setNewSubscriberCount(0);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
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

  const unreadMessages = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  const notificationCount =
    unreadMessages + newSubscriberCount;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      {/* =========================================================
          DESKTOP ADMIN SIDEBAR
          Hidden completely on mobile.
         ========================================================= */}

      <aside
        className={`
          fixed inset-y-0 left-0 z-40 hidden
          flex-col border-r border-slate-200 bg-white
          shadow-sm transition-all duration-300 lg:flex
          ${sidebarOpen ? "w-[270px]" : "w-[76px]"}
        `}
      >
        {/* Sidebar collapse / expand control */}
        <button
          type="button"
          onClick={() => setSidebarOpen((current) => !current)}
          title={
            sidebarOpen
              ? "Collapse sidebar"
              : "Expand sidebar"
          }
          aria-label={
            sidebarOpen
              ? "Collapse sidebar"
              : "Expand sidebar"
          }
          className="
            absolute -right-3 top-7 z-50
            flex h-8 w-8 items-center justify-center
            rounded-full
            bg-[#0d3b66]
            text-white
            shadow-md
            ring-4 ring-[#f8fafc]
            transition
            hover:bg-[#092f52]
            focus:outline-none
            focus:ring-2
            focus:ring-[#d62828]
            focus:ring-offset-2
          "
        >
          {sidebarOpen ? (
            <FiChevronLeft size={17} />
          ) : (
            <FiChevronRight size={17} />
          )}
        </button>

        {/* Sidebar header */}
        <div
          className={`
            flex h-[82px] shrink-0 items-center
            border-b border-slate-100
            ${
              sidebarOpen
                ? "justify-start px-6"
                : "justify-center px-2"
            }
          `}
        >
          <Link
            href="/admin"
            className="flex items-center"
            title="GLAW Naturale Admin"
          >
            {sidebarOpen ? (
              <Image
                src="/images/glaw-naturale-logo.svg"
                alt="GLAW Naturale"
                width={145}
                height={48}
                className="h-auto w-[145px]"
                priority
              />
            ) : (
              <Image
                src="/images/glaw-naturale-logo.svg"
                alt="GLAW Naturale"
                width={42}
                height={42}
                className="h-[42px] w-[42px] object-contain"
                priority
              />
            )}
          </Link>
        </div>

        {/* Sidebar navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-6">
          <div className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = item.href === "/admin";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={!sidebarOpen ? item.label : undefined}
                  className={`
                    flex items-center rounded-xl
                    text-sm font-semibold
                    transition
                    ${
                      sidebarOpen
                        ? "gap-3 px-4 py-3"
                        : "justify-center px-2 py-3"
                    }
                    ${
                      isActive
                        ? "bg-[#0d3b66] text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-[#0d3b66]"
                    }
                  `}
                >
                  <Icon size={19} className="shrink-0" />

                  {sidebarOpen && (
                    <span>{item.label}</span>
                  )}

                  {item.label === "Subscribers" &&
                    newSubscriberCount > 0 &&
                    sidebarOpen && (
                      <span
                        className="
                          ml-auto flex h-5 min-w-5
                          items-center justify-center
                          rounded-full
                          bg-[#d62828]
                          px-1.5
                          text-[10px]
                          font-bold
                          text-white
                        "
                      >
                        {newSubscriberCount > 99
                          ? "99+"
                          : newSubscriberCount}
                      </span>
                    )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Sidebar bottom */}
        <div className="border-t border-slate-100 p-3">
          <button
            type="button"
            onClick={handleSignOut}
            title={!sidebarOpen ? "Sign out" : undefined}
            className={`
              flex w-full items-center
              rounded-xl
              bg-[#d62828]
              text-sm font-semibold
              text-white
              transition
              hover:bg-[#b91f1f]
              focus:outline-none
              focus:ring-2
              focus:ring-[#d62828]
              focus:ring-offset-2
              ${
                sidebarOpen
                  ? "gap-3 px-4 py-3"
                  : "justify-center px-2 py-3"
              }
            `}
          >
            <FiX size={18} />

            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* =========================================================
          MAIN CONTENT
         ========================================================= */}

      <main
        className={`
          min-h-screen
          transition-all duration-300
          ${
            sidebarOpen
              ? "lg:ml-[270px]"
              : "lg:ml-[76px]"
          }
        `}
      >
        {/* =======================================================
            HEADER
           ======================================================= */}

        <header
          className="
            sticky top-0 z-30
            border-b border-slate-200
            bg-white/95
            backdrop-blur
          "
        >
          <div
            className="
              flex min-h-[76px]
              items-center justify-between
              gap-4
              px-4 py-4
              sm:px-6
              lg:px-8
          "
          >
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d62828]">
                GLAW Naturale
              </p>

              <h1 className="mt-1 truncate text-xl font-bold text-[#0d3b66] sm:text-2xl">
                Admin Dashboard
              </h1>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {/* Notifications */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setNotificationOpen(
                      (current) => !current
                    )
                  }
                  aria-label="Open notifications"
                  title="Notifications"
                  className="
                    relative flex h-11 w-11
                    items-center justify-center
                    rounded-xl
                    bg-[#0d3b66]
                    text-white
                    shadow-sm
                    transition
                    hover:bg-[#092f52]
                    focus:outline-none
                    focus:ring-2
                    focus:ring-[#0d3b66]
                    focus:ring-offset-2
                  "
                >
                  <FiBell size={19} />

                  {notificationsEnabled &&
                    notificationCount > 0 && (
                      <span
                        className="
                          absolute -right-1 -top-1
                          flex h-5 min-w-5
                          items-center justify-center
                          rounded-full
                          bg-[#d62828]
                          px-1
                          text-[10px]
                          font-bold
                          text-white
                          ring-2
                          ring-white
                        "
                      >
                        {notificationCount > 99
                          ? "99+"
                          : notificationCount}
                      </span>
                    )}
                </button>

                {/* Notification dropdown */}
                {notificationOpen && (
                  <>
                    <button
                      type="button"
                      aria-label="Close notifications"
                      className="fixed inset-0 z-40 cursor-default"
                      onClick={() =>
                        setNotificationOpen(false)
                      }
                    />

                    <div
                      className="
                        absolute right-0 top-14 z-50
                        w-[min(360px,calc(100vw-32px))]
                        overflow-hidden
                        rounded-2xl
                        border border-slate-200
                        bg-white
                        shadow-xl
                      "
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
                        <div>
                          <h2 className="text-sm font-bold text-[#0d3b66]">
                            Notifications
                          </h2>

                          <p className="mt-1 text-xs text-slate-500">
                            Recent admin activity
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setNotificationOpen(false)
                          }
                          aria-label="Close notifications"
                          className="
                            flex h-8 w-8
                            items-center justify-center
                            rounded-lg
                            text-slate-500
                            transition
                            hover:bg-slate-100
                            hover:text-slate-800
                          "
                        >
                          <FiX size={17} />
                        </button>
                      </div>

                      <div className="max-h-[380px] overflow-y-auto">
                        {newSubscriberCount > 0 && (
                          <Link
                            href="/admin/subscribers"
                            onClick={markSubscribersAsSeen}
                            className="
                              block border-b
                              border-slate-100
                              px-4 py-4
                              transition
                              hover:bg-slate-50
                            "
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className="
                                  flex h-9 w-9 shrink-0
                                  items-center justify-center
                                  rounded-full
                                  bg-[#d62828]
                                  text-white
                                "
                              >
                                <FiUsers size={17} />
                              </div>

                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-800">
                                  New subscribers
                                </p>

                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                  {newSubscriberCount} new{" "}
                                  {newSubscriberCount === 1
                                    ? "subscriber"
                                    : "subscribers"}{" "}
                                  since your last visit.
                                </p>
                              </div>
                            </div>
                          </Link>
                        )}

                        {notifications.length > 0 ? (
                          notifications.map(
                            (notification) => (
                              <Link
                                key={notification.id}
                                href="/admin/messages"
                                onClick={() =>
                                  setNotificationOpen(false)
                                }
                                className="
                                  block border-b
                                  border-slate-100
                                  px-4 py-4
                                  transition
                                  hover:bg-slate-50
                                "
                              >
                                <div className="flex items-start gap-3">
                                  <div
                                    className={`
                                      flex h-9 w-9 shrink-0
                                      items-center justify-center
                                      rounded-full
                                      ${
                                        notification.is_read
                                          ? "bg-slate-100 text-slate-500"
                                          : "bg-[#0d3b66] text-white"
                                      }
                                    `}
                                  >
                                    <FiMail size={16} />
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-2">
                                      <p className="truncate text-sm font-semibold text-slate-800">
                                        {notification.name ||
                                          "New message"}
                                      </p>

                                      {!notification.is_read && (
                                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#d62828]" />
                                      )}
                                    </div>

                                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                                      {notification.message ||
                                        "New contact message received."}
                                    </p>

                                    <p className="mt-2 text-[11px] font-medium text-slate-400">
                                      {formatNotificationTime(
                                        notification.created_at
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </Link>
                            )
                          )
                        ) : (
                          <div className="px-5 py-10 text-center">
                            <FiBell
                              size={24}
                              className="mx-auto text-slate-300"
                            />

                            <p className="mt-3 text-sm font-semibold text-slate-600">
                              No notifications
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              You&apos;re all caught up.
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-slate-100 p-3">
                        <Link
                          href="/admin/messages"
                          onClick={() =>
                            setNotificationOpen(false)
                          }
                          className="
                            inline-flex w-full
                            items-center justify-center
                            gap-2
                            rounded-lg
                            bg-[#d62828]
                            px-3 py-2.5
                            text-xs font-semibold
                            text-white
                            transition
                            hover:bg-[#b91f1f]
                          "
                        >
                          View All Messages
                          <FiExternalLink size={13} />
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* View website */}
              <Link
                href="/"
                target="_blank"
                className="
                  hidden
                  items-center gap-2
                  rounded-xl
                  bg-[#0d3b66]
                  px-4 py-2.5
                  text-sm font-semibold
                  text-white
                  shadow-sm
                  transition
                  hover:bg-[#092f52]
                  focus:outline-none
                  focus:ring-2
                  focus:ring-[#0d3b66]
                  focus:ring-offset-2
                  sm:inline-flex
                "
              >
                View Website
                <FiExternalLink size={15} />
              </Link>
            </div>
          </div>
        </header>

        {/* =======================================================
            DASHBOARD BODY
           ======================================================= */}

        <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {/* Welcome */}
          <section className="mb-7">
            <p className="text-sm font-medium text-slate-500">
              Welcome back.
            </p>

            <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#0d3b66] sm:text-3xl">
              Manage your GLAW Naturale website.
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Keep products, content, messages, and subscribers
              organized from one place.
            </p>
          </section>

          {/* =====================================================
              STAT CARDS
             ===================================================== */}

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {/* Products */}
            <Link
              href="/admin/products"
              className="
                rounded-2xl
                border border-slate-200
                bg-white
                p-5
                shadow-sm
                transition
                hover:-translate-y-0.5
                hover:shadow-md
              "
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Products
                  </p>

                  <p className="mt-2 text-3xl font-bold text-[#0d3b66]">
                    {loadingStats ? "—" : productCount}
                  </p>
                </div>

                <div
                  className="
                    flex h-11 w-11
                    items-center justify-center
                    rounded-xl
                    bg-blue-50
                    text-[#0d3b66]
                  "
                >
                  <FiPackage size={20} />
                </div>
              </div>

              <p className="mt-4 text-xs font-semibold text-[#d62828]">
                Manage products →
              </p>
            </Link>

            {/* Blog */}
            <Link
              href="/admin/blog"
              className="
                rounded-2xl
                border border-slate-200
                bg-white
                p-5
                shadow-sm
                transition
                hover:-translate-y-0.5
                hover:shadow-md
              "
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Blog Posts
                  </p>

                  <p className="mt-2 text-3xl font-bold text-[#0d3b66]">
                    {loadingStats ? "—" : blogPostCount}
                  </p>
                </div>

                <div
                  className="
                    flex h-11 w-11
                    items-center justify-center
                    rounded-xl
                    bg-blue-50
                    text-[#0d3b66]
                  "
                >
                  <FiBookOpen size={20} />
                </div>
              </div>

              <p className="mt-4 text-xs font-semibold text-[#d62828]">
                Manage blog →
              </p>
            </Link>

            {/* Messages */}
            <Link
              href="/admin/messages"
              className="
                rounded-2xl
                border border-slate-200
                bg-white
                p-5
                shadow-sm
                transition
                hover:-translate-y-0.5
                hover:shadow-md
              "
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Messages
                  </p>

                  <p className="mt-2 text-3xl font-bold text-[#0d3b66]">
                    {loadingStats ? "—" : messageCount}
                  </p>
                </div>

                <div
                  className="
                    flex h-11 w-11
                    items-center justify-center
                    rounded-xl
                    bg-red-50
                    text-[#d62828]
                  "
                >
                  <FiMail size={20} />
                </div>
              </div>

              <p className="mt-4 text-xs font-semibold text-[#d62828]">
                View messages →
              </p>
            </Link>

            {/* Subscribers */}
            <Link
              href="/admin/subscribers"
              onClick={markSubscribersAsSeen}
              className="
                rounded-2xl
                border border-slate-200
                bg-white
                p-5
                shadow-sm
                transition
                hover:-translate-y-0.5
                hover:shadow-md
              "
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Subscribers
                  </p>

                  <p className="mt-2 text-3xl font-bold text-[#0d3b66]">
                    {loadingStats
                      ? "—"
                      : subscriberCount}
                  </p>
                </div>

                <div
                  className="
                    relative flex h-11 w-11
                    items-center justify-center
                    rounded-xl
                    bg-blue-50
                    text-[#0d3b66]
                  "
                >
                  <FiUsers size={20} />

                  {newSubscriberCount > 0 && (
                    <span
                      className="
                        absolute -right-1 -top-1
                        h-3 w-3
                        rounded-full
                        bg-[#d62828]
                        ring-2
                        ring-white
                      "
                    />
                  )}
                </div>
              </div>

              <p className="mt-4 text-xs font-semibold text-[#d62828]">
                View subscribers →
              </p>
            </Link>
          </section>

          {/* =====================================================
              QUICK ACTIONS
             ===================================================== */}

          <section className="mt-8">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-[#0d3b66]">
                Quick Actions
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Jump directly to the areas you use most.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Link
                href="/admin/products"
                className="
                  group rounded-2xl
                  border border-slate-200
                  bg-white
                  p-5
                  shadow-sm
                  transition
                  hover:-translate-y-0.5
                  hover:shadow-md
                "
              >
                <div className="flex items-center gap-4">
                  <div
                    className="
                      flex h-12 w-12 shrink-0
                      items-center justify-center
                      rounded-xl
                      bg-[#d62828]
                      text-white
                    "
                  >
                    <FiPackage size={21} />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-800">
                      Manage Products
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Add, edit, or remove products.
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                href="/admin/blog"
                className="
                  group rounded-2xl
                  border border-slate-200
                  bg-white
                  p-5
                  shadow-sm
                  transition
                  hover:-translate-y-0.5
                  hover:shadow-md
                "
              >
                <div className="flex items-center gap-4">
                  <div
                    className="
                      flex h-12 w-12 shrink-0
                      items-center justify-center
                      rounded-xl
                      bg-[#0d3b66]
                      text-white
                    "
                  >
                    <FiBookOpen size={21} />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-800">
                      Manage Blog
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Create and manage blog posts.
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                href="/admin/messages"
                className="
                  group rounded-2xl
                  border border-slate-200
                  bg-white
                  p-5
                  shadow-sm
                  transition
                  hover:-translate-y-0.5
                  hover:shadow-md
                "
              >
                <div className="flex items-center gap-4">
                  <div
                    className="
                      flex h-12 w-12 shrink-0
                      items-center justify-center
                      rounded-xl
                      bg-[#d62828]
                      text-white
                    "
                  >
                    <FiMail size={21} />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-800">
                      View Messages
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Review customer enquiries.
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                href="/admin/subscribers"
                onClick={markSubscribersAsSeen}
                className="
                  group rounded-2xl
                  border border-slate-200
                  bg-white
                  p-5
                  shadow-sm
                  transition
                  hover:-translate-y-0.5
                  hover:shadow-md
                "
              >
                <div className="flex items-center gap-4">
                  <div
                    className="
                      flex h-12 w-12 shrink-0
                      items-center justify-center
                      rounded-xl
                      bg-[#0d3b66]
                      text-white
                    "
                  >
                    <FiUsers size={21} />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-800">
                      Subscribers
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      View collected email subscribers.
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                href="/admin/settings"
                className="
                  group rounded-2xl
                  border border-slate-200
                  bg-white
                  p-5
                  shadow-sm
                  transition
                  hover:-translate-y-0.5
                  hover:shadow-md
                "
              >
                <div className="flex items-center gap-4">
                  <div
                    className="
                      flex h-12 w-12 shrink-0
                      items-center justify-center
                      rounded-xl
                      bg-[#0d3b66]
                      text-white
                    "
                  >
                    <FiSettings size={21} />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-800">
                      Settings
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Manage admin preferences.
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                href="/"
                target="_blank"
                className="
                  group rounded-2xl
                  border border-slate-200
                  bg-white
                  p-5
                  shadow-sm
                  transition
                  hover:-translate-y-0.5
                  hover:shadow-md
                "
              >
                <div className="flex items-center gap-4">
                  <div
                    className="
                      flex h-12 w-12 shrink-0
                      items-center justify-center
                      rounded-xl
                      bg-[#d62828]
                      text-white
                    "
                  >
                    <FiExternalLink size={21} />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-800">
                      View Website
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Open the public GLAW Naturale site.
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </section>

          {/* =====================================================
              CURRENT STAGE
             ===================================================== */}

          <section className="mt-8">
            <div
              className="
                overflow-hidden
                rounded-2xl
                bg-[#0d3b66]
                p-6
                text-white
                shadow-sm
                sm:p-7
              "
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-200">
                    Current Stage
                  </p>

                  <h2 className="mt-2 text-xl font-bold sm:text-2xl">
                    Keep your product catalogue up to date.
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-blue-100">
                    Your products are one of the main parts of the
                    public website. Make sure names, descriptions,
                    prices, and images are accurate.
                  </p>
                </div>

                <Link
                  href="/admin/products"
                  className="
                    inline-flex shrink-0
                    items-center justify-center
                    gap-2
                    rounded-xl
                    bg-[#d62828]
                    px-5 py-3
                    text-sm font-bold
                    text-white
                    shadow-sm
                    transition
                    hover:bg-[#b91f1f]
                    focus:outline-none
                    focus:ring-2
                    focus:ring-white
                    focus:ring-offset-2
                    focus:ring-offset-[#0d3b66]
                  "
                >
                  Manage Products
                  <FiPackage size={16} />
                </Link>
              </div>
            </div>
          </section>

          {/* =====================================================
              FOOTER
             ===================================================== */}

          <footer className="pb-4 pt-10">
            <div
              className="
                flex flex-col
                gap-2
                border-t border-slate-200
                pt-5
                text-xs
                text-slate-400
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <p>
                © {new Date().getFullYear()} GLAW Naturale.
                Admin Dashboard.
              </p>

              <Link
                href="/"
                target="_blank"
                className="
                  font-semibold
                  text-[#0d3b66]
                  transition
                  hover:text-[#d62828]
                "
              >
                View public website
              </Link>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}