"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { FiEdit2, FiPlus, FiRefreshCw, FiTrash2 } from "react-icons/fi";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function loadPosts() {
    setLoading(true);
    setMessage("");

    const supabase = createClient();

    const { data, error } = await supabase
      .from("blog_posts")
      .select(
        "id, title, slug, excerpt, is_published, published_at, created_at, updated_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setMessage("Unable to load blog posts.");
      setPosts([]);
    } else {
      setPosts(data ?? []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadPosts();
  }, []);

  async function deletePost(post: BlogPost) {
    const confirmed = window.confirm(
      `Delete "${post.title}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(post.id);
    setMessage("");

    const supabase = createClient();

    const { error } = await supabase
      .from("blog_posts")
      .delete()
      .eq("id", post.id);

    if (error) {
      console.error(error);
      setMessage("Unable to delete the article.");
      setDeletingId(null);
      return;
    }

    setPosts((current) => current.filter((item) => item.id !== post.id));
    setDeletingId(null);
  }

  function formatDate(date: string | null) {
    if (!date) return "Not published";

    return new Date(date).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
              Blog
            </h1>

            <p className="mt-1 text-sm text-gray-600">
              Create and manage GLAW Naturale articles.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadPosts}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-[#0b2a4a] hover:text-[#0b2a4a] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiRefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <Link
              href="/admin/blog/new"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0b2a4a]"
            >
              <FiPlus size={17} />
              New Article
            </Link>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {message}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
            Loading articles...
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white px-6 py-14 text-center">
            <h2 className="text-lg font-semibold text-gray-900">
              No articles yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              Create your first GLAW Naturale article to start building the
              blog.
            </p>

            <Link
              href="/admin/blog/new"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0b2a4a]"
            >
              <FiPlus size={17} />
              Create Article
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white md:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-left">
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Article
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Status
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Date
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {posts.map((post) => (
                      <tr
                        key={post.id}
                        className="border-b border-gray-100 last:border-0"
                      >
                        <td className="px-6 py-5">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {post.title}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              /blog/{post.slug}
                            </p>

                            {post.excerpt && (
                              <p className="mt-2 max-w-xl text-sm text-gray-500">
                                {post.excerpt}
                              </p>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          {post.is_published ? (
                            <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                              Published
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                              Draft
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-5 text-sm text-gray-600">
                          {formatDate(
                            post.is_published
                              ? post.published_at
                              : post.created_at
                          )}
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/blog/${post.id}/edit`}
                              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:border-[#0b2a4a] hover:text-[#0b2a4a]"
                            >
                              <FiEdit2 size={15} />
                              Edit
                            </Link>

                            <button
                              type="button"
                              onClick={() => deletePost(post)}
                              disabled={deletingId === post.id}
                              className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <FiTrash2 size={15} />
                              {deletingId === post.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile cards */}
            <div className="space-y-4 md:hidden">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-xl border border-gray-200 bg-white p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="font-semibold text-gray-900">
                        {post.title}
                      </h2>

                      <p className="mt-1 break-all text-xs text-gray-500">
                        /blog/{post.slug}
                      </p>
                    </div>

                    {post.is_published ? (
                      <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                        Published
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                        Draft
                      </span>
                    )}
                  </div>

                  {post.excerpt && (
                    <p className="mt-3 text-sm leading-6 text-gray-600">
                      {post.excerpt}
                    </p>
                  )}

                  <p className="mt-3 text-xs text-gray-500">
                    {formatDate(
                      post.is_published
                        ? post.published_at
                        : post.created_at
                    )}
                  </p>

                  <div className="mt-5 flex gap-2">
                    <Link
                      href={`/admin/blog/${post.id}/edit`}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-semibold text-gray-700"
                    >
                      <FiEdit2 size={15} />
                      Edit
                    </Link>

                    <button
                      type="button"
                      onClick={() => deletePost(post)}
                      disabled={deletingId === post.id}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2.5 text-sm font-semibold text-red-600 disabled:opacity-50"
                    >
                      <FiTrash2 size={15} />
                      {deletingId === post.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}