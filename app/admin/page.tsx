"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FiBookOpen,
  FiChevronLeft,
  FiChevronRight,
  FiExternalLink,
  FiHome,
  FiLogOut,
  FiMail,
  FiPackage,
  FiSettings,
  FiX,
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
    label: "Settings",
    href: "/admin/settings",
    icon: FiSettings,
  },
];

export default function AdminDashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [productCount, setProductCount] = useState(0);
  const [blogPostCount, setBlogPostCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    async function loadDashboardStats() {
      const supabase = createClient();

      const [productsResult, blogResult, messagesResult] =
        await Promise.all([
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

      setLoadingStats(false);
    }

    loadDashboardStats();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();

    await supabase.auth.signOut();

    window.location.href = "/admin/login";
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      {/* Mobile Navigation Rail */}
      <aside
        className="
          fixed inset-y-0 left-0 z-30 hidden w-[64px] flex-col
          border-r border-border bg-white lg:hidden
          min-[480px]:flex
        "
      >
        {/* Rail Logo */}
        <div className="flex h-[76px] items-center justify-center border-b border-border">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-surface"
            aria-label="Open admin navigation"
          >
            <Image
              src="/icon.png"
              alt="GLAW Naturale"
              width={38}
              height={38}
              className="h-9 w-9 rounded-lg object-contain"
            />
          </button>
        </div>

        {/* Rail Navigation */}
        <nav className="flex-1 px-2 py-5">
          <div className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = item.href === "/admin";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  className={`group flex h-11 w-full items-center justify-center rounded-xl transition-colors ${
                    isActive
                      ? "bg-navy text-white"
                      : "text-navy hover:bg-surface"
                  }`}
                >
                  <Icon
                    size={19}
                    className={
                      isActive
                        ? "text-white"
                        : "text-muted group-hover:text-navy"
                    }
                  />
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Rail Bottom */}
        <div className="border-t border-border p-2">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title="View Website"
            className="mb-2 flex h-11 w-full items-center justify-center rounded-xl bg-red text-white transition-colors hover:bg-navy"
          >
            <FiExternalLink size={18} />
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            title="Sign Out"
            className="flex h-11 w-full items-center justify-center rounded-xl text-navy transition-colors hover:bg-surface"
          >
            <FiLogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Expanded Mobile Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col
          border-r border-border bg-white
          transition-transform duration-300 ease-in-out
          lg:hidden
          ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Sidebar Header */}
        <div className="flex h-[76px] items-center border-b border-border px-4">
          <Link
            href="/admin"
            className="flex min-w-0 items-center"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <Image
              src="/brand/glaw-naturale-logo.svg"
              alt="GLAW Naturale"
              width={150}
              height={50}
              className="h-auto w-[150px]"
            />
          </Link>

          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className="ml-auto rounded-lg p-2 text-muted transition-colors hover:bg-surface hover:text-navy"
            aria-label="Close sidebar"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Admin Label */}
        <div className="border-b border-border px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
            GLAW Naturale
          </p>

          <p className="mt-1 font-[var(--font-montserrat)] text-sm font-bold text-navy">
            Admin
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = item.href === "/admin";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`
                    group flex items-center gap-3 rounded-xl
                    px-4 py-3 text-sm font-semibold transition-colors
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

                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Sidebar Bottom */}
        <div className="border-t border-border p-3">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileSidebarOpen(false)}
            className="
              mb-2 flex items-center gap-3 rounded-xl bg-red
              px-4 py-3 text-sm font-semibold text-white
              transition-colors hover:bg-navy
            "
          >
            <FiExternalLink size={18} className="shrink-0" />
            <span>View Website</span>
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            className="
              flex w-full items-center gap-3 rounded-xl
              px-4 py-3 text-sm font-semibold text-navy
              transition-colors hover:bg-surface
            "
          >
            <FiLogOut size={18} className="shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 hidden flex-col border-r border-border
          bg-white transition-all duration-300 ease-in-out lg:flex
          ${sidebarOpen ? "lg:w-[270px]" : "lg:w-[76px]"}
        `}
      >
        {/* Sidebar Header */}
        <div className="flex h-[76px] items-center border-b border-border px-4">
          <Link
            href="/admin"
            className={`flex min-w-0 items-center ${
              sidebarOpen ? "gap-3" : "justify-center"
            }`}
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

        {/* Admin Label */}
        <div
          className={`border-b border-border px-4 py-4 ${
            sidebarOpen ? "" : "flex justify-center px-2"
          }`}
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

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = item.href === "/admin";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={!sidebarOpen ? item.label : undefined}
                  className={`
                    group flex items-center rounded-xl text-sm font-semibold
                    transition-colors
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
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Sidebar Bottom */}
        <div className="border-t border-border p-3">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title={!sidebarOpen ? "View Website" : undefined}
            className={`
              mb-2 flex items-center rounded-xl bg-red text-sm font-semibold
              text-white transition-colors hover:bg-navy
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
              flex w-full items-center rounded-xl text-sm font-semibold
              text-navy transition-colors hover:bg-surface
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

        {/* Desktop Collapse Button */}
        <button
          type="button"
          onClick={() => setSidebarOpen((current) => !current)}
          className="absolute -right-3 top-[88px] hidden h-7 w-7 items-center justify-center rounded-full border border-border bg-white text-navy shadow-sm transition-colors hover:bg-surface lg:flex"
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {sidebarOpen ? (
            <FiChevronLeft size={15} />
          ) : (
            <FiChevronRight size={15} />
          )}
        </button>
      </aside>

      {/* Main Area */}
      <div
        className={`
          min-h-screen transition-[padding] duration-300
          lg:${sidebarOpen ? "pl-[270px]" : "pl-[76px]"}
          min-[480px]:pl-[64px]
        `}
      >
        {/* Mobile Navigation Button */}
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(true)}
          className="
            fixed left-3 top-3 z-40 hidden h-10 w-10
            items-center justify-center rounded-xl
            border border-border bg-white text-navy shadow-sm
            transition-colors hover:bg-surface
            min-[480px]:flex lg:hidden
          "
          aria-label="Open admin navigation"
        >
          <FiChevronRight size={19} />
        </button>

        {/* Dashboard Content */}
        <main className="px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
          <div className="mx-auto max-w-7xl">
            {/* Heading */}
            <div className="mb-8">
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

            {/* Welcome Panel */}
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
                    connected to your admin system, and continue building from
                    one workspace.
                  </p>
                </div>

                <Link
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-red px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-navy"
                >
                  <FiExternalLink size={16} />
                  View Website
                </Link>
              </div>
            </section>

            {/* Overview */}
            <section>
              <div className="mb-5">
                <h2 className="font-[var(--font-montserrat)] text-xl font-bold text-navy">
                  Overview
                </h2>

                <p className="mt-1 text-sm text-muted">
                  A quick look at your current admin workspace.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {/* Products */}
                <Link
                  href="/admin/products"
                  className="group rounded-2xl border border-border bg-white p-6 shadow-sm transition-colors hover:border-red hover:bg-surface"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red">
                      <FiPackage size={21} />
                    </div>

                    <FiChevronRight
                      size={18}
                      className="text-muted transition-transform group-hover:translate-x-1 group-hover:text-red"
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

                {/* Blog */}
                <Link
                  href="/admin/blog"
                  className="group rounded-2xl border border-border bg-white p-6 shadow-sm transition-colors hover:border-red hover:bg-surface"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red">
                      <FiBookOpen size={21} />
                    </div>

                    <FiChevronRight
                      size={18}
                      className="text-muted transition-transform group-hover:translate-x-1 group-hover:text-red"
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

                {/* Messages */}
                <Link
                  href="/admin/messages"
                  className="group rounded-2xl border border-border bg-white p-6 shadow-sm transition-colors hover:border-red hover:bg-surface"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red">
                      <FiMail size={21} />
                    </div>

                    <FiChevronRight
                      size={18}
                      className="text-muted transition-transform group-hover:translate-x-1 group-hover:text-red"
                    />
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

                {/* Settings */}
                <Link
                  href="/admin/settings"
                  className="group rounded-2xl border border-border bg-white p-6 shadow-sm transition-colors hover:border-red hover:bg-surface"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red">
                      <FiSettings size={21} />
                    </div>

                    <FiChevronRight
                      size={18}
                      className="text-muted transition-transform group-hover:translate-x-1 group-hover:text-red"
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

            {/* Get Started */}
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
                  className="group flex items-center justify-between rounded-2xl border border-border bg-white p-5 shadow-sm transition-colors hover:border-red hover:bg-surface"
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
                    className="text-muted transition-transform group-hover:translate-x-1 group-hover:text-red"
                  />
                </Link>

                <Link
                  href="/admin/blog"
                  className="group flex items-center justify-between rounded-2xl border border-border bg-white p-5 shadow-sm transition-colors hover:border-red hover:bg-surface"
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
                    className="text-muted transition-transform group-hover:translate-x-1 group-hover:text-red"
                  />
                </Link>
              </div>
            </section>

            {/* Current Stage */}
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
                      Products and blog management are connected to the custom
                      admin system. More management features can be added here
                      without changing the core workspace.
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