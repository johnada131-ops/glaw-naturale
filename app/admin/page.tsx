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
  FiStar,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { createClient } from "@/lib/supabase/client";

type NotificationMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  status: string;
  created_at: string;
};

type DashboardStats = {
  products: number;
  blogPosts: number;
  messages: number;
  subscribers: number;
  testimonials: number;
  pendingTestimonials: number;
};

const SUBSCRIBERS_LAST_SEEN_KEY = "glaw_admin_subscribers_last_seen";

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [productCount, setProductCount] = useState(0);
  const [blogPostCount, setBlogPostCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [testimonialCount, setTestimonialCount] = useState(0);
  const [pendingTestimonialCount, setPendingTestimonialCount] = useState(0);

  const [loadingStats, setLoadingStats] = useState(true);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notifications, setNotifications] = useState<NotificationMessage[]>(
    []
  );
  const [notificationOpen, setNotificationOpen] = useState(false);

  const [newSubscriberCount, setNewSubscriberCount] = useState(0);

  const supabase = createClient();

  const navItems = [
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
      label: "Testimonials",
      href: "/admin/testimonials",
      icon: FiStar,
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

  async function loadDashboardData() {
    try {
      setLoadingStats(true);

      const [
        productsResult,
        blogPostsResult,
        messagesResult,
        subscribersResult,
        testimonialsResult,
        pendingTestimonialsResult,
        notificationSettingsResult,
        unreadMessagesResult,
      ] = await Promise.all([
        supabase
          .from("products")
          .select("id", { count: "exact", head: true }),

        supabase
          .from("blog_posts")
          .select("id", { count: "exact", head: true }),

        supabase
          .from("contact_messages")
          .select("id", { count: "exact", head: true }),

        supabase
          .from("newsletter_subscribers")
          .select("id", { count: "exact", head: true })
          .eq("status", "active"),

        supabase
          .from("testimonials")
          .select("id", { count: "exact", head: true }),

        supabase
          .from("testimonials")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),

        supabase
          .from("notification_settings")
          .select("contact_message_notifications")
          .limit(1)
          .maybeSingle(),

        supabase
          .from("contact_messages")
          .select("id,name,email,message,status,created_at")
          .neq("status", "read")
          .order("created_at", { ascending: false })
          .limit(8),
      ]);

      if (productsResult.error) {
        console.error("Products count error:", productsResult.error);
      }

      if (blogPostsResult.error) {
        console.error("Blog posts count error:", blogPostsResult.error);
      }

      if (messagesResult.error) {
        console.error("Messages count error:", messagesResult.error);
      }

      if (subscribersResult.error) {
        console.error("Subscribers count error:", subscribersResult.error);
      }

      if (testimonialsResult.error) {
        console.error("Testimonials count error:", testimonialsResult.error);
      }

      if (pendingTestimonialsResult.error) {
        console.error(
          "Pending testimonials count error:",
          pendingTestimonialsResult.error
        );
      }

      if (notificationSettingsResult.error) {
        console.error(
          "Notification settings error:",
          notificationSettingsResult.error
        );
      }

      if (unreadMessagesResult.error) {
        console.error(
          "Unread messages error:",
          unreadMessagesResult.error
        );
      }

      setProductCount(productsResult.count ?? 0);
      setBlogPostCount(blogPostsResult.count ?? 0);
      setMessageCount(messagesResult.count ?? 0);
      setSubscriberCount(subscribersResult.count ?? 0);
      setTestimonialCount(testimonialsResult.count ?? 0);
      setPendingTestimonialCount(pendingTestimonialsResult.count ?? 0);

      setNotificationsEnabled(
        notificationSettingsResult.data?.contact_message_notifications ??
          true
      );

      setNotifications(unreadMessagesResult.data ?? []);

      /*
       * Track new newsletter subscribers locally.
       *
       * This prevents the dashboard from treating every existing
       * subscriber as a new notification.
       */
      const currentSubscriberCount = subscribersResult.count ?? 0;

      const storedLastSeen = localStorage.getItem(
        SUBSCRIBERS_LAST_SEEN_KEY
      );

      if (storedLastSeen === null) {
        localStorage.setItem(
          SUBSCRIBERS_LAST_SEEN_KEY,
          String(currentSubscriberCount)
        );
        setNewSubscriberCount(0);
      } else {
        const lastSeenCount = Number(storedLastSeen);

        if (currentSubscriberCount > lastSeenCount) {
          setNewSubscriberCount(
            currentSubscriberCount - lastSeenCount
          );
        } else {
          setNewSubscriberCount(0);
        }
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoadingStats(false);
    }
  }

  useEffect(() => {
    loadDashboardData();

    const interval = setInterval(() => {
      loadDashboardData();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const unreadMessageCount = notifications.length;

  const notificationCount =
    (notificationsEnabled ? unreadMessageCount : 0) +
    newSubscriberCount +
    pendingTestimonialCount;

  function markSubscribersAsSeen() {
    localStorage.setItem(
      SUBSCRIBERS_LAST_SEEN_KEY,
      String(subscriberCount)
    );

    setNewSubscriberCount(0);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  const stats = [
    {
      label: "Products",
      value: productCount,
      icon: FiPackage,
      href: "/admin/products",
    },
    {
      label: "Blog Posts",
      value: blogPostCount,
      icon: FiBookOpen,
      href: "/admin/blog",
    },
    {
      label: "Messages",
      value: messageCount,
      icon: FiMail,
      href: "/admin/messages",
    },
    {
      label: "Subscribers",
      value: subscriberCount,
      icon: FiUsers,
      href: "/admin/subscribers",
    },
    {
      label: "Testimonials",
      value: testimonialCount,
      icon: FiStar,
      href: "/admin/testimonials",
      badge:
        pendingTestimonialCount > 0
          ? `${pendingTestimonialCount} pending`
          : undefined,
    },
  ];

  const quickActions = [
    {
      label: "Manage Products",
      description: "Add, edit and organize products",
      href: "/admin/products",
      icon: FiPackage,
    },
    {
      label: "Manage Blog",
      description: "Create and manage blog posts",
      href: "/admin/blog",
      icon: FiBookOpen,
    },
    {
      label: "Testimonials",
      description: "Review customer testimonials",
      href: "/admin/testimonials",
      icon: FiStar,
    },
    {
      label: "Messages",
      description: "View customer enquiries",
      href: "/admin/messages",
      icon: FiMail,
    },
    {
      label: "Subscribers",
      description: "Manage newsletter subscribers",
      href: "/admin/subscribers",
      icon: FiUsers,
    },
    {
      label: "Settings",
      description: "Manage website settings",
      href: "/admin/settings",
      icon: FiSettings,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Desktop Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-slate-200 bg-white transition-all duration-300 lg:flex ${
          sidebarOpen ? "w-[270px]" : "w-[76px]"
        }`}
      >
        <div className="flex h-20 items-center border-b border-slate-200 px-4">
          <Link
            href="/admin"
            className={`flex items-center ${
              sidebarOpen ? "gap-3" : "justify-center"
            }`}
          >
            <Image
              src="/images/glaw-naturale-logo.svg"
              alt="GLAW Naturale"
              width={42}
              height={42}
              className="h-10 w-10 object-contain"
            />

            {sidebarOpen && (
              <div>
                <p className="text-sm font-bold tracking-wide text-[#0d3b66]">
                  GLAW NATURALE
                </p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                  Admin
                </p>
              </div>
            )}
          </Link>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.href === "/admin";

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center rounded-xl px-3 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-[#0d3b66] text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-[#0d3b66]"
                } ${sidebarOpen ? "gap-3" : "justify-center"}`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <Icon size={19} />

                {sidebarOpen && <span>{item.label}</span>}

                {sidebarOpen &&
                  item.label === "Testimonials" &&
                  pendingTestimonialCount > 0 && (
                    <span className="ml-auto rounded-full bg-[#d62828] px-2 py-0.5 text-[10px] font-bold text-white">
                      {pendingTestimonialCount}
                    </span>
                  )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex w-full items-center justify-center rounded-xl border border-slate-200 py-2.5 text-slate-500 transition hover:bg-slate-50 hover:text-[#0d3b66]"
            aria-label={
              sidebarOpen ? "Collapse sidebar" : "Expand sidebar"
            }
          >
            {sidebarOpen ? (
              <FiChevronLeft size={19} />
            ) : (
              <FiChevronRight size={19} />
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`min-h-screen transition-all duration-300 ${
          sidebarOpen ? "lg:ml-[270px]" : "lg:ml-[76px]"
        }`}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Admin Dashboard
              </p>
              <h1 className="mt-1 text-xl font-bold text-[#0d3b66] sm:text-2xl">
                Welcome back
              </h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Notifications */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setNotificationOpen(!notificationOpen);
                    markSubscribersAsSeen();
                  }}
                  className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-[#0d3b66]"
                  aria-label="Notifications"
                >
                  <FiBell size={19} />

                  {notificationCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#d62828] px-1 text-[10px] font-bold text-white">
                      {notificationCount > 9 ? "9+" : notificationCount}
                    </span>
                  )}
                </button>

                {notificationOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setNotificationOpen(false)}
                    />

                    <div className="absolute right-0 z-50 mt-3 w-[320px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl sm:w-[380px]">
                      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
                        <div>
                          <h3 className="font-semibold text-slate-900">
                            Notifications
                          </h3>
                          <p className="mt-0.5 text-xs text-slate-400">
                            Recent activity
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setNotificationOpen(false)}
                          className="text-slate-400 hover:text-slate-700"
                        >
                          <FiX size={18} />
                        </button>
                      </div>

                      <div className="max-h-[360px] overflow-y-auto">
                        {pendingTestimonialCount > 0 && (
                          <Link
                            href="/admin/testimonials"
                            onClick={() => setNotificationOpen(false)}
                            className="block border-b border-slate-100 px-4 py-4 transition hover:bg-slate-50"
                          >
                            <div className="flex gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-[#d62828]">
                                <FiStar size={17} />
                              </div>

                              <div>
                                <p className="text-sm font-semibold text-slate-800">
                                  Pending testimonials
                                </p>
                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                  {pendingTestimonialCount} testimonial
                                  {pendingTestimonialCount === 1
                                    ? ""
                                    : "s"} waiting for review.
                                </p>
                              </div>
                            </div>
                          </Link>
                        )}

                        {newSubscriberCount > 0 && (
                          <Link
                            href="/admin/subscribers"
                            onClick={() => setNewSubscriberCount(0)}
                            className="block border-b border-slate-100 px-4 py-4 transition hover:bg-slate-50"
                          >
                            <div className="flex gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#0d3b66]">
                                <FiUsers size={17} />
                              </div>

                              <div>
                                <p className="text-sm font-semibold text-slate-800">
                                  New subscribers
                                </p>
                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                  {newSubscriberCount} new newsletter
                                  subscriber
                                  {newSubscriberCount === 1 ? "" : "s"}.
                                </p>
                              </div>
                            </div>
                          </Link>
                        )}

                        {notificationsEnabled &&
                          notifications.length > 0 &&
                          notifications.map((notification) => (
                            <Link
                              key={notification.id}
                              href="/admin/messages"
                              onClick={() => setNotificationOpen(false)}
                              className="block border-b border-slate-100 px-4 py-4 transition hover:bg-slate-50"
                            >
                              <div className="flex gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#0d3b66]">
                                  <FiMail size={17} />
                                </div>

                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-slate-800">
                                    New message
                                  </p>
                                  <p className="mt-1 truncate text-xs text-slate-500">
                                    {notification.name} —{" "}
                                    {notification.email}
                                  </p>
                                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">
                                    {notification.message}
                                  </p>
                                </div>
                              </div>
                            </Link>
                          ))}

                        {notificationCount === 0 && (
                          <div className="px-4 py-10 text-center">
                            <FiBell
                              className="mx-auto text-slate-300"
                              size={28}
                            />
                            <p className="mt-3 text-sm font-medium text-slate-500">
                              No new notifications
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              You&apos;re all caught up.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* View Website */}
              <Link
                href="/"
                target="_blank"
                className="hidden items-center gap-2 rounded-xl bg-[#0d3b66] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#092d50] sm:flex"
              >
                <FiExternalLink size={16} />
                View Website
              </Link>

              {/* Mobile menu */}
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <FiX size={19} /> : <FiHome size={19} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {sidebarOpen && (
            <div className="border-t border-slate-100 bg-white px-4 py-3 lg:hidden">
              <nav className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {navItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-3 text-sm font-medium text-slate-600 transition hover:border-[#0d3b66] hover:text-[#0d3b66]"
                    >
                      <Icon size={17} />
                      <span>{item.label}</span>

                      {item.label === "Testimonials" &&
                        pendingTestimonialCount > 0 && (
                          <span className="ml-auto rounded-full bg-[#d62828] px-1.5 py-0.5 text-[9px] font-bold text-white">
                            {pendingTestimonialCount}
                          </span>
                        )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}
        </header>

        {/* Dashboard Body */}
        <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {/* Stats */}
          <section>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Overview
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Live statistics from your GLAW Naturale database.
                </p>
              </div>

              <button
                type="button"
                onClick={loadDashboardData}
                className="text-xs font-semibold text-[#0d3b66] hover:underline"
              >
                Refresh
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <Link
                    key={stat.label}
                    href={stat.href}
                    className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#0d3b66]/30 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-[#0d3b66] transition group-hover:bg-[#0d3b66] group-hover:text-white">
                        <Icon size={20} />
                      </div>

                      {stat.badge && (
                        <span className="rounded-full bg-red-50 px-2 py-1 text-[10px] font-bold text-[#d62828]">
                          {stat.badge}
                        </span>
                      )}
                    </div>

                    <div className="mt-5">
                      <p className="text-2xl font-bold text-slate-900">
                        {loadingStats ? "—" : stat.value}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {stat.label}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Quick Actions */}
          <section className="mt-8">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-900">
                Quick Actions
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Jump directly to the areas you manage most.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#0d3b66]/30 hover:shadow-md"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[#0d3b66] transition group-hover:bg-[#0d3b66] group-hover:text-white">
                        <Icon size={20} />
                      </div>

                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {action.label}
                        </h3>
                        <p className="mt-1 text-sm leading-5 text-slate-500">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Current Stage */}
          <section className="mt-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d62828]">
                    Current Stage
                  </p>

                  <h2 className="mt-2 text-xl font-bold text-[#0d3b66]">
                    Manage your GLAW Naturale content
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    Keep your products, blog posts, customer testimonials,
                    messages and newsletter subscribers organized from one
                    dashboard.
                  </p>
                </div>

                <Link
                  href="/admin/products"
                  className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#d62828] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#b91f1f]"
                >
                  Manage Products
                </Link>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} GLAW Naturale. Admin Dashboard.
            </p>

            <button
              type="button"
              onClick={handleLogout}
              className="w-fit font-semibold text-[#d62828] hover:underline"
            >
              Sign out
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}