"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type MessageStatus = "unread" | "read" | "archived";

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: MessageStatus;
  created_at: string;
  updated_at: string;
};

type Filter = "all" | "unread" | "read" | "archived";

export default function MessagesPage() {
  const supabase = createClient();

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selectedMessage, setSelectedMessage] =
    useState<ContactMessage | null>(null);

  const [filter, setFilter] = useState<Filter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const loadMessages = async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setErrorMessage("");

    const { data, error } = await supabase
      .from("contact_messages")
      .select(
        "id, name, email, phone, subject, message, status, created_at, updated_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading contact messages:", error);
      setErrorMessage("We couldn't load messages right now.");
    } else {
      setMessages(data ?? []);
    }

    setIsLoading(false);
    setIsRefreshing(false);
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const unreadCount = useMemo(
    () => messages.filter((message) => message.status === "unread").length,
    [messages]
  );

  const filteredMessages = useMemo(() => {
    if (filter === "all") {
      return messages;
    }

    return messages.filter((message) => message.status === filter);
  }, [messages, filter]);

  const updateStatus = async (
    message: ContactMessage,
    status: MessageStatus
  ) => {
    setActionId(message.id);
    setErrorMessage("");

    const { error } = await supabase
      .from("contact_messages")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", message.id);

    if (error) {
      console.error("Error updating message:", error);
      setErrorMessage("We couldn't update this message.");
      setActionId(null);
      return;
    }

    setMessages((current) =>
      current.map((item) =>
        item.id === message.id
          ? {
              ...item,
              status,
              updated_at: new Date().toISOString(),
            }
          : item
      )
    );

    setSelectedMessage((current) =>
      current && current.id === message.id
        ? {
            ...current,
            status,
            updated_at: new Date().toISOString(),
          }
        : current
    );

    setActionId(null);
  };

  const deleteMessage = async (message: ContactMessage) => {
    const confirmed = window.confirm(
      `Delete the message from ${message.name}? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setActionId(message.id);
    setErrorMessage("");

    const { error } = await supabase
      .from("contact_messages")
      .delete()
      .eq("id", message.id);

    if (error) {
      console.error("Error deleting message:", error);
      setErrorMessage("We couldn't delete this message.");
      setActionId(null);
      return;
    }

    setMessages((current) =>
      current.filter((item) => item.id !== message.id)
    );

    setSelectedMessage((current) =>
      current?.id === message.id ? null : current
    );

    setActionId(null);
  };

  const openMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
  };

  const closeMessage = () => {
    setSelectedMessage(null);
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date));
  };

  const getStatusLabel = (status: MessageStatus) => {
    if (status === "unread") return "Unread";
    if (status === "read") return "Read";
    return "Archived";
  };

  const getStatusClasses = (status: MessageStatus) => {
    if (status === "unread") {
      return "bg-red/10 text-red";
    }

    if (status === "read") {
      return "bg-blue/10 text-blue";
    }

    return "bg-gray-100 text-gray-500";
  };

  return (
    <main className="min-h-full bg-[#f7f8fa] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red">
              Communication
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-navy sm:text-4xl">
                Messages
              </h1>

              {unreadCount > 0 && (
                <span className="rounded-full bg-red px-3 py-1 text-xs font-semibold text-white">
                  {unreadCount} unread
                </span>
              )}
            </div>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
              Messages submitted through the public GLAW Naturale contact
              form.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadMessages(true)}
            disabled={isRefreshing}
            className="inline-flex h-11 items-center justify-center rounded-full border border-gray-200 bg-white px-5 text-sm font-semibold text-navy transition-all hover:border-navy hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRefreshing ? "Refreshing..." : "↻ Refresh"}
          </button>
        </div>

        {/* ERROR */}
        {errorMessage && (
          <div className="mt-6 rounded-2xl border border-red/20 bg-red/5 px-5 py-4 text-sm text-red">
            {errorMessage}
          </div>
        )}

        {/* FILTERS */}
        <div className="mt-8 flex gap-2 overflow-x-auto pb-1">
          {[
            { key: "all", label: "All" },
            { key: "unread", label: "Unread" },
            { key: "read", label: "Read" },
            { key: "archived", label: "Archived" },
          ].map((item) => {
            const active = filter === item.key;

            const count =
              item.key === "all"
                ? messages.length
                : messages.filter(
                    (message) => message.status === item.key
                  ).length;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setFilter(item.key as Filter)}
                className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all ${
                  active
                    ? "bg-navy text-white"
                    : "border border-gray-200 bg-white text-gray-600 hover:border-navy hover:text-navy"
                }`}
              >
                {item.label}

                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] ${
                    active
                      ? "bg-white/15 text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* MESSAGES */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          {isLoading ? (
            <div className="px-6 py-16 text-center">
              <p className="text-sm text-gray-500">Loading messages...</p>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-xl text-gray-400">
                ✉
              </div>

              <h2 className="mt-5 text-lg font-bold text-navy">
                No messages here
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                {filter === "all"
                  ? "Messages submitted through the contact form will appear here."
                  : `There are currently no ${filter} messages.`}
              </p>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[760px]">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/70 text-left">
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
                        Sender
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
                        Subject
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
                        Status
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
                        Received
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredMessages.map((message) => (
                      <tr
                        key={message.id}
                        className={`border-b border-gray-100 last:border-0 ${
                          message.status === "unread"
                            ? "bg-red/[0.025]"
                            : "bg-white"
                        }`}
                      >
                        <td className="px-6 py-5">
                          <button
                            type="button"
                            onClick={() => openMessage(message)}
                            className="text-left"
                          >
                            <p
                              className={`text-sm ${
                                message.status === "unread"
                                  ? "font-bold text-navy"
                                  : "font-semibold text-navy"
                              }`}
                            >
                              {message.name}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              {message.email}
                            </p>
                          </button>
                        </td>

                        <td className="max-w-[280px] px-6 py-5">
                          <button
                            type="button"
                            onClick={() => openMessage(message)}
                            className="text-left"
                          >
                            <p className="truncate text-sm font-medium text-navy">
                              {message.subject || "No subject"}
                            </p>

                            <p className="mt-1 truncate text-xs text-gray-400">
                              {message.message}
                            </p>
                          </button>
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                              message.status
                            )}`}
                          >
                            {getStatusLabel(message.status)}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-6 py-5 text-xs text-gray-500">
                          {formatDate(message.created_at)}
                        </td>

                        <td className="px-6 py-5 text-right">
                          <button
                            type="button"
                            onClick={() => openMessage(message)}
                            className="rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-navy transition-colors hover:border-navy"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS */}
              <div className="divide-y divide-gray-100 md:hidden">
                {filteredMessages.map((message) => (
                  <button
                    key={message.id}
                    type="button"
                    onClick={() => openMessage(message)}
                    className={`block w-full p-5 text-left transition-colors hover:bg-gray-50 ${
                      message.status === "unread" ? "bg-red/[0.025]" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p
                          className={`truncate text-sm ${
                            message.status === "unread"
                              ? "font-bold text-navy"
                              : "font-semibold text-navy"
                          }`}
                        >
                          {message.name}
                        </p>

                        <p className="mt-1 truncate text-xs text-gray-500">
                          {message.email}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${getStatusClasses(
                          message.status
                        )}`}
                      >
                        {getStatusLabel(message.status)}
                      </span>
                    </div>

                    <p className="mt-4 truncate text-sm font-medium text-navy">
                      {message.subject || "No subject"}
                    </p>

                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">
                      {message.message}
                    </p>

                    <p className="mt-3 text-[11px] text-gray-400">
                      {formatDate(message.created_at)}
                    </p>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* MESSAGE DETAIL MODAL */}
      {selectedMessage && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeMessage();
            }
          }}
        >
          <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-[2rem] bg-white shadow-2xl sm:max-w-2xl sm:rounded-[2rem]">
            <div className="sticky top-0 border-b border-gray-100 bg-white px-6 py-5 sm:px-8">
              <div className="flex items-start justify-between gap-5">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-red">
                    Message
                  </p>

                  <h2 className="mt-2 text-xl font-bold text-navy sm:text-2xl">
                    {selectedMessage.subject || "No subject"}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={closeMessage}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 hover:text-navy"
                  aria-label="Close message"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="space-y-7 px-6 py-6 sm:px-8 sm:py-8">
              {/* SENDER */}
              <div className="rounded-2xl bg-gray-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400">
                  From
                </p>

                <p className="mt-2 text-base font-bold text-navy">
                  {selectedMessage.name}
                </p>

                <a
                  href={`mailto:${selectedMessage.email}`}
                  className="mt-1 block text-sm text-blue hover:underline"
                >
                  {selectedMessage.email}
                </a>

                {selectedMessage.phone && (
                  <a
                    href={`tel:${selectedMessage.phone}`}
                    className="mt-1 block text-sm text-gray-500 hover:text-navy"
                  >
                    {selectedMessage.phone}
                  </a>
                )}

                <p className="mt-3 text-xs text-gray-400">
                  Received {formatDate(selectedMessage.created_at)}
                </p>
              </div>

              {/* MESSAGE BODY */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400">
                  Message
                </p>

                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-gray-700">
                  {selectedMessage.message}
                </p>
              </div>

              {/* STATUS */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400">
                  Status
                </p>

                <div className="mt-3">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                      selectedMessage.status
                    )}`}
                  >
                    {getStatusLabel(selectedMessage.status)}
                  </span>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="border-t border-gray-100 pt-6">
                <div className="grid gap-3 sm:grid-cols-2">
                  {selectedMessage.status === "unread" && (
                    <button
                      type="button"
                      onClick={() =>
                        updateStatus(selectedMessage, "read")
                      }
                      disabled={actionId === selectedMessage.id}
                      className="rounded-xl bg-navy px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Mark as Read
                    </button>
                  )}

                  {selectedMessage.status === "read" && (
                    <button
                      type="button"
                      onClick={() =>
                        updateStatus(selectedMessage, "unread")
                      }
                      disabled={actionId === selectedMessage.id}
                      className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-navy transition-colors hover:border-navy disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Mark as Unread
                    </button>
                  )}

                  {selectedMessage.status !== "archived" && (
                    <button
                      type="button"
                      onClick={() =>
                        updateStatus(selectedMessage, "archived")
                      }
                      disabled={actionId === selectedMessage.id}
                      className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 transition-colors hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Archive
                    </button>
                  )}

                  {selectedMessage.status === "archived" && (
                    <button
                      type="button"
                      onClick={() =>
                        updateStatus(selectedMessage, "read")
                      }
                      disabled={actionId === selectedMessage.id}
                      className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-navy transition-colors hover:border-navy disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Restore to Read
                    </button>
                  )}

                  <a
                    href={`mailto:${selectedMessage.email}?subject=${encodeURIComponent(
                      `Re: ${selectedMessage.subject || "Your message to GLAW Naturale"}`
                    )}`}
                    className="rounded-xl bg-red px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-navy"
                  >
                    Reply by Email
                  </a>

                  <button
                    type="button"
                    onClick={() => deleteMessage(selectedMessage)}
                    disabled={actionId === selectedMessage.id}
                    className="rounded-xl border border-red/20 px-4 py-3 text-sm font-semibold text-red transition-colors hover:bg-red hover:text-white disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
                  >
                    Delete Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}