"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiDownload,
  FiMail,
  FiSearch,
  FiTrash2,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { createClient } from "@/lib/supabase/client";

type Subscriber = {
  id: string;
  email: string;
  status: "active" | "unsubscribed";
  created_at: string;
};

export default function SubscribersPage() {
  const supabase = createClient();

  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "unsubscribed"
  >("all");

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function loadSubscribers() {
    setIsLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .select("id, email, status, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading subscribers:", error);
      setErrorMessage("We couldn't load the subscribers.");
      setSubscribers([]);
      setIsLoading(false);
      return;
    }

    setSubscribers((data ?? []) as Subscriber[]);
    setIsLoading(false);
  }

  useEffect(() => {
    loadSubscribers();
  }, []);

  const filteredSubscribers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return subscribers.filter((subscriber) => {
      const matchesSearch =
        !query || subscriber.email.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" || subscriber.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [subscribers, search, statusFilter]);

  const activeCount = subscribers.filter(
    (subscriber) => subscriber.status === "active"
  ).length;

  const unsubscribedCount = subscribers.filter(
    (subscriber) => subscriber.status === "unsubscribed"
  ).length;

  async function updateStatus(
    subscriberId: string,
    status: "active" | "unsubscribed"
  ) {
    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase
      .from("newsletter_subscribers")
      .update({ status })
      .eq("id", subscriberId);

    if (error) {
      console.error("Error updating subscriber:", error);
      setErrorMessage("We couldn't update this subscriber.");
      return;
    }

    setSubscribers((current) =>
      current.map((subscriber) =>
        subscriber.id === subscriberId
          ? { ...subscriber, status }
          : subscriber
      )
    );

    setSuccessMessage(
      status === "active"
        ? "Subscriber marked as active."
        : "Subscriber marked as unsubscribed."
    );

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  }

  async function deleteSubscriber(subscriberId: string) {
    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase
      .from("newsletter_subscribers")
      .delete()
      .eq("id", subscriberId);

    if (error) {
      console.error("Error deleting subscriber:", error);
      setErrorMessage("We couldn't delete this subscriber.");
      setDeleteId(null);
      return;
    }

    setSubscribers((current) =>
      current.filter((subscriber) => subscriber.id !== subscriberId)
    );

    setDeleteId(null);
    setSuccessMessage("Subscriber deleted.");

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  }

  function csvEscape(value: string) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  function exportActiveSubscribers() {
    setErrorMessage("");
    setSuccessMessage("");

    const activeSubscribers = subscribers.filter(
      (subscriber) => subscriber.status === "active"
    );

    if (activeSubscribers.length === 0) {
      setErrorMessage("There are no active subscribers to export.");
      return;
    }

    setIsExporting(true);

    try {
      const header = ["Email", "Status", "Date Subscribed"];

      const rows = activeSubscribers.map((subscriber) => [
        subscriber.email,
        subscriber.status,
        subscriber.created_at,
      ]);

      const csvContent = [
        header.map(csvEscape).join(","),
        ...rows.map((row) => row.map(csvEscape).join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      const date = new Date().toISOString().split("T")[0];

      link.href = url;
      link.download = `glaw-naturale-subscribers-${date}.csv`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      setSuccessMessage(
        `${activeSubscribers.length} active ${
          activeSubscribers.length === 1 ? "subscriber" : "subscribers"
        } exported successfully.`
      );

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error("Error exporting subscribers:", error);
      setErrorMessage("We couldn't export the subscribers.");
    } finally {
      setIsExporting(false);
    }
  }

  function formatDate(date: string) {
    return new Intl.DateTimeFormat("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-blue">
            GLAW Naturale Admin
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-3xl">
                Subscribers
              </h1>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
                Manage people who have signed up for GLAW Naturale updates.
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FiUsers size={16} />
              <span>
                {subscribers.length}{" "}
                {subscribers.length === 1 ? "subscriber" : "subscribers"}
              </span>
            </div>
          </div>
        </div>

        {/* Messages */}
        {errorMessage && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <FiAlertCircle className="mt-0.5 shrink-0" size={17} />

            <span>{errorMessage}</span>

            <button
              type="button"
              onClick={() => setErrorMessage("")}
              className="ml-auto shrink-0 text-red-500 hover:text-red-700"
              aria-label="Close error"
            >
              <FiX size={17} />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <FiCheckCircle className="mt-0.5 shrink-0" size={17} />

            <span>{successMessage}</span>

            <button
              type="button"
              onClick={() => setSuccessMessage("")}
              className="ml-auto shrink-0 text-green-600 hover:text-green-800"
              aria-label="Close success message"
            >
              <FiX size={17} />
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue/10 text-blue">
              <FiUsers size={20} />
            </div>

            <p className="text-sm text-gray-500">Total subscribers</p>

            <p className="mt-1 text-2xl font-bold text-navy">
              {subscribers.length}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <FiCheckCircle size={20} />
            </div>

            <p className="text-sm text-gray-500">Active</p>

            <p className="mt-1 text-2xl font-bold text-navy">{activeCount}</p>
          </div>

          <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
              <FiMail size={20} />
            </div>

            <p className="text-sm text-gray-500">Unsubscribed</p>

            <p className="mt-1 text-2xl font-bold text-navy">
              {unsubscribedCount}
            </p>
          </div>
        </div>

        {/* Subscriber list */}
        <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          {/* Toolbar */}
          <div className="border-b border-border p-4 sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-md">
                <FiSearch
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by email..."
                  className="h-11 w-full rounded-xl border border-border bg-white pl-10 pr-4 text-sm text-navy outline-none transition focus:border-blue focus:ring-2 focus:ring-blue/10"
                />
              </div>

              <div className="flex w-full flex-wrap gap-2 lg:w-auto lg:justify-end">
                <button
                  type="button"
                  onClick={exportActiveSubscribers}
                  disabled={isExporting || activeCount === 0}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-navy px-4 py-2.5 text-sm font-medium text-white transition hover:bg-navy/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FiDownload size={16} />

                  {isExporting ? "Exporting..." : "Export Active CSV"}
                </button>

                {(["all", "active", "unsubscribed"] as const).map(
                  (filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setStatusFilter(filter)}
                      className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                        statusFilter === filter
                          ? "bg-navy text-white"
                          : "border border-border bg-white text-gray-600 hover:bg-surface"
                      }`}
                    >
                      {filter === "all"
                        ? "All"
                        : filter === "active"
                          ? "Active"
                          : "Unsubscribed"}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Loading */}
          {isLoading ? (
            <div className="px-5 py-16 text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue" />

              <p className="text-sm text-gray-500">
                Loading subscribers...
              </p>
            </div>
          ) : filteredSubscribers.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface text-gray-400">
                <FiMail size={22} />
              </div>

              <h2 className="text-base font-semibold text-navy">
                {subscribers.length === 0
                  ? "No subscribers yet"
                  : "No subscribers found"}
              </h2>

              <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-gray-500">
                {subscribers.length === 0
                  ? "When someone signs up for GLAW Naturale updates, their email address will appear here."
                  : "Try changing your search or status filter."}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-border bg-surface/60 text-left">
                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Email
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Status
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Joined
                      </th>

                      <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredSubscribers.map((subscriber) => (
                      <tr
                        key={subscriber.id}
                        className="border-b border-border last:border-0"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue/10 text-blue">
                              <FiMail size={16} />
                            </div>

                            <span className="text-sm font-medium text-navy">
                              {subscriber.email}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                              subscriber.status === "active"
                                ? "bg-green-50 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {subscriber.status === "active"
                              ? "Active"
                              : "Unsubscribed"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-500">
                          {formatDate(subscriber.created_at)}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                updateStatus(
                                  subscriber.id,
                                  subscriber.status === "active"
                                    ? "unsubscribed"
                                    : "active"
                                )
                              }
                              className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-gray-600 transition hover:bg-surface"
                            >
                              {subscriber.status === "active"
                                ? "Unsubscribe"
                                : "Reactivate"}
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeleteId(subscriber.id)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 text-red-500 transition hover:bg-red-50"
                              aria-label={`Delete ${subscriber.email}`}
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="divide-y divide-border md:hidden">
                {filteredSubscribers.map((subscriber) => (
                  <div key={subscriber.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue/10 text-blue">
                        <FiMail size={17} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="break-all text-sm font-medium text-navy">
                          {subscriber.email}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                              subscriber.status === "active"
                                ? "bg-green-50 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {subscriber.status === "active"
                              ? "Active"
                              : "Unsubscribed"}
                          </span>

                          <span className="text-xs text-gray-500">
                            {formatDate(subscriber.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateStatus(
                            subscriber.id,
                            subscriber.status === "active"
                              ? "unsubscribed"
                              : "active"
                          )
                        }
                        className="flex-1 rounded-xl border border-border px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-surface"
                      >
                        {subscriber.status === "active"
                          ? "Unsubscribe"
                          : "Reactivate"}
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteId(subscriber.id)}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-100 text-red-500 transition hover:bg-red-50"
                        aria-label={`Delete ${subscriber.email}`}
                      >
                        <FiTrash2 size={17} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-500">
              <FiTrash2 size={20} />
            </div>

            <h2 className="text-lg font-bold text-navy">
              Delete subscriber?
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              This will permanently remove the subscriber from the list. This
              action cannot be undone.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-surface"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => deleteSubscriber(deleteId)}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
              >
                Delete subscriber
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}