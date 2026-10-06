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
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [productCount, setProductCount] = useState(0);
  const [blogPostCount, setBlogPostCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [subscriberCount, setSubscriberCount] = useState(0);

  const [loadingStats, setLoadingStats] = useState(true);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notifications, setNotifications] = useState<NotificationMessage[]>(
    []
  );
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
    let mounted = true;

    const loadDashboard = async () => {
      try {
        setLoadingStats(true);

        const [
          productsResult,
          blogResult,
          messagesResult,
          subscribersResult,
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
        ]);

        if (!mounted) return;

        setProductCount(productsResult.count ?? 0);
        setBlogPostCount(blogResult.count ?? 0);
        setMessageCount(messagesResult.count ?? 0);
        setSubscriberCount(subscribersResult.count ?? 0);

        await loadNotifications();
        loadSubscriberNotifications();
      } catch (error) {
        console.error("Error loading admin dashboard:", error);
      } finally {
        if (mounted) {
          setLoadingStats(false);
        }
      }
    };

    const loadNotifications = async () => {
      try {
        const { data: settings } = await supabase
          .from("notification_settings")
          .select(
            "id, whatsapp_enabled, admin_whatsapp_number, contact_message_notifications"
          )
          .maybeSingle();

        if (!mounted) return;

        const enabled =
          settings?.contact_message_notifications !== false;

        setNotificationsEnabled(enabled);

        const { data, error } = await supabase
          .from("contact_messages")
          .select("id, name, email, message, created_at, is_read")
          .order("created_at", { ascending: false })
          .limit(8);

        if (error) {
          console.error("Error loading notifications:", error);
          return;
        }

        if (!mounted) return;

        if (!enabled) {
          setNotifications([]);
          return;
        }

        setNotifications((data as NotificationMessage[]) || []);
      } catch (error) {
        console.error("Error loading notifications:", error);
      }
    };

    const loadSubscriberNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from("subscribers")
          .select("created_at")
          .order("created_at", { ascending: false })
          .limit(100);

        if (error) {
          console.error("Error loading subscriber notifications:", error);
          return;
        }

        if (!mounted) return;

        const lastSeen = localStorage.getItem(SUBSCRIBER_LAST_SEEN_KEY);

        if (!lastSeen) {
          setNewSubscriberCount(0);
          return;
        }

        const lastSeenTime = new Date(lastSeen).getTime();

        const newCount =
          data?.filter((subscriber) => {
            if (!subscriber.created_at) return false;

            return (
              new Date(subscriber.created_at).getTime() > lastSeenTime
            );
          }).length ?? 0;

        setNewSubscriberCount(newCount);
      } catch (error) {
        console.error("Error loading subscriber notifications:", error);
      }
    };

    loadDashboard();

    const interval = window.setInterval(() => {
      loadNotifications();
      loadSubscriberNotifications();
    }, 15000);

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  const markSubscribersAsSeen = () => {
    const now = new Date().toISOString();

    localStorage.setItem(SUBSCRIBER_LAST_SEEN_KEY, now);
    setNewSubscriberCount(0);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  };

  const formatNotificationTime = (dateString: string) => {
    const date = new Date(dateString);

    return date.toLocaleString("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8fafc]">
      {/* =========================
          DESKTOP SIDEBAR
          ========================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden border-r border-slate-200 bg-white transition-all duration-300 lg:flex lg:flex-col ${
          sidebarOpen ? "w-[270px]" : "w-[72px]"
        }`}
      >
        {/* Logo */}
        <div
          className={`flex h-20 items-center border-b border-slate-200 ${
            sidebarOpen ? "justify-between px-5" : "justify-center px-3"
          }`}
        >
          {sidebarOpen ? (
            <Link href="/admin" className="flex items-center">
              <Image
                src="/images/glaw-naturale-logo.svg"
                alt="GLAW Naturale"
                width={145}
                height={48}
                className="h-auto w-[145px]"
                priority
              />
            </Link>
          ) : (
            <Link href="/admin" aria-label="GLAW Naturale Admin">
              <Image
                src="/images/glaw-naturale-logo.svg"
                alt="GLAW Naturale"
                width={42}
                height={42}
                className="h-10 w-10 object-contain"
                priority
              />
            </Link>
          )}

          {sidebarOpen && (
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              aria-label="Collapse sidebar"
            >
              <FiChevronLeft size={20} />
            </button>
          )}
        </div>

        {!sidebarOpen && (
          <div className="flex justify-center border-b border-slate-200 py-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              aria-label="Expand sidebar"
            >
              <FiChevronRight size={20} />
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-5">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === "/admin";

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center rounded-xl text-sm font-medium transition ${
                  sidebarOpen
                    ? "gap-3 px-3 py-3"
                    : "justify-center px-2 py-3"
                } ${
                  isActive
                    ? "bg-[#0d3b66] text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <Icon size={19} className="shrink-0" />

                {sidebarOpen && <span>{item.label}</span>}

                {item.label === "Subscribers" &&
                  newSubscriberCount > 0 &&
                  sidebarOpen && (
                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                      {newSubscriberCount > 99
                        ? "99+"
                        : newSubscriberCount}
                    </span>
                  )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Links */}
        <div className="border-t border-slate-200 p-3">
          <Link
            href="/"
            target="_blank"
            className={`mb-2 flex items-center rounded-xl text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 ${
              sidebarOpen
                ? "gap-3 px-3 py-3"
                : "justify-center px-2 py-3"
            }`}
            title={!sidebarOpen ? "View Website" : undefined}
          >
            <FiExternalLink size={19} className="shrink-0" />

            {sidebarOpen && <span>View Website</span>}
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            className={`flex w-full items-center rounded-xl text-sm font-medium text-red-600 transition hover:bg-red-50 ${
              sidebarOpen
                ? "gap-3 px-3 py-3"
                : "justify-center px-2 py-3"
            }`}
            title={!sidebarOpen ? "Sign Out" : undefined}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>

            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* =========================
          DESKTOP NOTIFICATION BUTTON
          ========================= */}
      <div className="fixed right-4 top-4 z-50 hidden lg:block">
        <button
          type="button"
          onClick={() => setNotificationOpen((prev) => !prev)}
          className="relative flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
          aria-label="Notifications"
        >
          <FiBell size={19} />

          {notifications.filter((item) => !item.is_read).length > 0 && (
            <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-red-500" />
          )}
        </button>

        {notificationOpen && (
          <div className="absolute right-0 top-14 w-[360px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Notifications
                </h3>

                <p className="mt-0.5 text-xs text-slate-500">
                  Recent contact messages
                </p>
              </div>

              <button
                type="button"
                onClick={() => setNotificationOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close notifications"
              >
                <FiX size={17} />
              </button>
            </div>

            <div className="max-h-[420px] overflow-y-auto">
              {!notificationsEnabled ? (
                <div className="px-5 py-8 text-center">
                  <p className="text-sm text-slate-500">
                    Contact message notifications are disabled.
                  </p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <FiBell className="mx-auto mb-3 text-slate-300" size={25} />

                  <p className="text-sm text-slate-500">
                    No notifications yet.
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <Link
                    key={notification.id}
                    href="/admin/messages"
                    onClick={() => setNotificationOpen(false)}
                    className="block border-b border-slate-100 px-5 py-4 transition hover:bg-slate-50"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#0d3b66]">
                        <FiMail size={15} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900">
                          {notification.name || "New message"}
                        </p>

                        {notification.email && (
                          <p className="mt-0.5 truncate text-xs text-slate-500">
                            {notification.email}
                          </p>
                        )}

                        {notification.message && (
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">
                            {notification.message}
                          </p>
                        )}

                        <p className="mt-2 text-[11px] text-slate-400">
                          {formatNotificationTime(
                            notification.created_at
                          )}
                        </p>
                      </div>

                      {!notification.is_read && (
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                      )}
                    </div>
                  </Link>
                ))
              )}
            </div>

            <div className="border-t border-slate-200 px-5 py-3">
              <Link
                href="/admin/messages"
                onClick={() => setNotificationOpen(false)}
                className="flex items-center justify-center gap-2 text-xs font-semibold text-[#0d3b66] hover:underline"
              >
                View all messages
                <FiChevronRight size={14} />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* =========================
          MAIN CONTENT
          ========================= */}
      <main
        className={`min-h-screen transition-all duration-300 ${
          sidebarOpen ? "lg:ml-[270px]" : "lg:ml-[72px]"
        }`}
      >
        <div className="px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-sm font-medium text-[#0d3b66]">
                Admin Dashboard
              </p>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Welcome back
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Manage your GLAW Naturale website, products, content and
                customer activity from one place.
              </p>
            </div>

            <Link
              href="/"
              target="_blank"
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <FiExternalLink size={16} />
              View Website
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {/* Products */}
            <Link
              href="/admin/products"
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#0d3b66]">
                  <FiPackage size={21} />
                </div>

                <FiChevronRight
                  size={18}
                  className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-500"
                />
              </div>

              <p className="mt-5 text-sm font-medium text-slate-500">
                Products
              </p>

              <p className="mt-1 text-3xl font-bold text-slate-900">
                {loadingStats ? "—" : productCount}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Manage products displayed on the website.
              </p>
            </Link>

            {/* Blog */}
            <Link
              href="/admin/blog"
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#0d3b66]">
                  <FiBookOpen size={21} />
                </div>

                <FiChevronRight
                  size={18}
                  className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-500"
                />
              </div>

              <p className="mt-5 text-sm font-medium text-slate-500">
                Blog Posts
              </p>

              <p className="mt-1 text-3xl font-bold text-slate-900">
                {loadingStats ? "—" : blogPostCount}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Create and manage website articles.
              </p>
            </Link>

            {/* Messages */}
            <Link
              href="/admin/messages"
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#0d3b66]">
                  <FiMail size={21} />
                </div>

                <FiChevronRight
                  size={18}
                  className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-500"
                />
              </div>

              <p className="mt-5 text-sm font-medium text-slate-500">
                Messages
              </p>

              <p className="mt-1 text-3xl font-bold text-slate-900">
                {loadingStats ? "—" : messageCount}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                View messages received from customers.
              </p>
            </Link>

            {/* Subscribers */}
            <Link
              href="/admin/subscribers"
              onClick={markSubscribersAsSeen}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#0d3b66]">
                  <FiUsers size={21} />

                  {newSubscriberCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                      {newSubscriberCount > 99
                        ? "99+"
                        : newSubscriberCount}
                    </span>
                  )}
                </div>

                <FiChevronRight
                  size={18}
                  className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-500"
                />
              </div>

              <p className="mt-5 text-sm font-medium text-slate-500">
                Subscribers
              </p>

              <p className="mt-1 text-3xl font-bold text-slate-900">
                {loadingStats ? "—" : subscriberCount}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Manage people subscribed to updates.
              </p>
            </Link>
          </div>

          {/* Quick Actions */}
          <section className="mt-8">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                Quick actions
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Go directly to the areas you manage most often.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <Link
                href="/admin/products"
                className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-[#0d3b66]">
                    <FiPackage size={19} />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      Manage Products
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Add, edit or remove products.
                    </p>
                  </div>
                </div>

                <FiChevronRight
                  size={18}
                  className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-500"
                />
              </Link>

              <Link
                href="/admin/blog"
                className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-[#0d3b66]">
                    <FiBookOpen size={19} />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      Manage Blog
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Publish and manage articles.
                    </p>
                  </div>
                </div>

                <FiChevronRight
                  size={18}
                  className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-500"
                />
              </Link>

              <Link
                href="/admin/settings"
                className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-[#0d3b66]">
                    <FiSettings size={19} />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      Settings
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Manage website and notification settings.
                    </p>
                  </div>
                </div>

                <FiChevronRight
                  size={18}
                  className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-500"
                />
              </Link>
            </div>
          </section>

          {/* Current Stage */}
          <section className="mt-8">
            <div className="rounded-2xl bg-[#0d3b66] p-6 text-white shadow-sm sm:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">
                    GLAW Naturale
                  </p>

                  <h2 className="mt-2 text-xl font-bold sm:text-2xl">
                    Your website is ready to manage.
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-blue-100">
                    Products, blog posts, messages, subscribers and
                    website settings can all be managed from the admin
                    area.
                  </p>
                </div>

                <Link
                  href="/admin/products"
                  className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#0d3b66] transition hover:bg-blue-50"
                >
                  Manage Products
                  <FiChevronRight size={16} />
                </Link>
              </div>
            </div>
          </section>

          {/* Footer */}
          <div className="mt-10 border-t border-slate-200 pt-6">
            <div className="flex flex-col gap-3 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
              <p>GLAW Naturale Admin</p>

              <p>
                Manage your website from one place.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}