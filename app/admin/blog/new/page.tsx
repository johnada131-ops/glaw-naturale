"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import {
  FiArrowLeft,
  FiImage,
  FiSave,
  FiTrash2,
} from "react-icons/fi";

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function NewBlogPostPage() {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isPublished, setIsPublished] = useState(false);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleTitleChange(value: string) {
    setTitle(value);

    if (!slug || slug === createSlug(title)) {
      setSlug(createSlug(value));
    }
  }

  function handleImageChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    setError("");

    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be 5MB or smaller.");
      return;
    }

    setImageFile(file);

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!title.trim()) {
      setError("Please enter an article title.");
      return;
    }

    if (!slug.trim()) {
      setError("Please enter a slug.");
      return;
    }

    if (!content.trim()) {
      setError("Please enter the article content.");
      return;
    }

    setSaving(true);

    let uploadedImagePath: string | null = null;
    let uploadedImageUrl: string | null = null;

    try {
      /*
       * Upload image first if one was selected.
       */
      if (imageFile) {
        const fileExtension =
          imageFile.name.split(".").pop()?.toLowerCase() || "jpg";

        const safeSlug = createSlug(slug) || "article";

        const fileName = `${safeSlug}-${Date.now()}.${fileExtension}`;

        const filePath = `articles/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("blog-images")
          .upload(filePath, imageFile, {
            cacheControl: "3600",
            upsert: false,
            contentType: imageFile.type,
          });

        if (uploadError) {
          console.error(uploadError);
          setError(
            `Image upload failed: ${uploadError.message}`
          );
          setSaving(false);
          return;
        }

        uploadedImagePath = filePath;

        const { data: publicUrlData } = supabase.storage
          .from("blog-images")
          .getPublicUrl(filePath);

        uploadedImageUrl = publicUrlData.publicUrl;
      }

      /*
       * Create the blog post.
       */
      const publishedAt = isPublished
        ? new Date().toISOString()
        : null;

      const { error: insertError } = await supabase
        .from("blog_posts")
        .insert({
          title: title.trim(),
          slug: slug.trim(),
          excerpt: excerpt.trim() || null,
          content: content.trim(),
          image_url: uploadedImageUrl,
          is_published: isPublished,
          published_at: publishedAt,
          sort_order: Number(sortOrder) || 0,
        });

      /*
       * If database insertion fails after image upload,
       * remove the uploaded image so we don't leave unused files.
       */
      if (insertError) {
        if (uploadedImagePath) {
          await supabase.storage
            .from("blog-images")
            .remove([uploadedImagePath]);
        }

        console.error(insertError);

        if (insertError.code === "23505") {
          setError(
            "This slug already exists. Please choose a different slug."
          );
        } else {
          setError(insertError.message);
        }

        setSaving(false);
        return;
      }

      router.push("/admin/blog");
      router.refresh();
    } catch (err) {
      console.error(err);

      if (uploadedImagePath) {
        await supabase.storage
          .from("blog-images")
          .remove([uploadedImagePath]);
      }

      setError("Something went wrong while saving the article.");
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/blog"
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-[#061B3A]"
          >
            <FiArrowLeft size={16} />
            Back to Blog
          </Link>

          <h1 className="text-3xl font-bold text-[#061B3A]">
            New Article
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Create a new article for the GLAW Naturale blog.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Article Information */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#061B3A]">
              Article Information
            </h2>

            <div className="mt-6 space-y-5">
              {/* Title */}
              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Title
                </label>

                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(event) =>
                    handleTitleChange(event.target.value)
                  }
                  placeholder="Enter article title"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#061B3A] focus:ring-2 focus:ring-[#061B3A]/10"
                />
              </div>

              {/* Slug */}
              <div>
                <label
                  htmlFor="slug"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Slug
                </label>

                <input
                  id="slug"
                  type="text"
                  value={slug}
                  onChange={(event) =>
                    setSlug(createSlug(event.target.value))
                  }
                  placeholder="article-url-slug"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#061B3A] focus:ring-2 focus:ring-[#061B3A]/10"
                />

                <p className="mt-2 text-xs text-gray-500">
                  This becomes part of the article URL.
                </p>
              </div>

              {/* Excerpt */}
              <div>
                <label
                  htmlFor="excerpt"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Excerpt
                </label>

                <textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(event) => setExcerpt(event.target.value)}
                  placeholder="A short summary of the article..."
                  rows={4}
                  className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#061B3A] focus:ring-2 focus:ring-[#061B3A]/10"
                />

                <p className="mt-2 text-xs text-gray-500">
                  This appears on the main Blog page as the article
                  summary.
                </p>
              </div>
            </div>
          </section>

          {/* Featured Image */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-[#061B3A]">
                Featured Image
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Choose an image from the computer to use as the article
                thumbnail.
              </p>
            </div>

            <div className="mt-6">
              {!imagePreview ? (
                <label
                  htmlFor="blog-image"
                  className="flex min-h-[240px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center transition hover:border-[#061B3A] hover:bg-gray-100"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#061B3A]/10 text-[#061B3A]">
                    <FiImage size={26} />
                  </div>

                  <p className="mt-4 text-sm font-semibold text-[#061B3A]">
                    Choose an image
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    JPG, PNG, WEBP or other image formats
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Maximum size: 5MB
                  </p>

                  <input
                    id="blog-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-gray-200">
                  <div className="relative aspect-[16/9] w-full bg-gray-100">
                    <Image
                      src={imagePreview}
                      alt="Selected article image preview"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>

                  <div className="flex flex-col gap-3 border-t border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-800">
                        {imageFile?.name}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {imageFile
                          ? `${(imageFile.size / 1024 / 1024).toFixed(2)} MB`
                          : ""}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <label
                        htmlFor="blog-image-replace"
                        className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                      >
                        Change
                      </label>

                      <input
                        id="blog-image-replace"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />

                      <button
                        type="button"
                        onClick={removeImage}
                        className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        <FiTrash2 size={15} />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Content */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#061B3A]">
              Article Content
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Write the full article below.
            </p>

            <div className="mt-5">
              <textarea
                id="content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Write your article here..."
                rows={22}
                className="w-full resize-y rounded-xl border border-gray-300 px-4 py-4 text-sm leading-7 outline-none transition focus:border-[#061B3A] focus:ring-2 focus:ring-[#061B3A]/10"
              />
            </div>

            <p className="mt-2 text-xs text-gray-500">
              Rich formatting can be added to the article editor later.
            </p>
          </section>

          {/* Publishing */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#061B3A]">
              Publishing
            </h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {/* Status */}
              <div>
                <label
                  htmlFor="status"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Status
                </label>

                <select
                  id="status"
                  value={isPublished ? "published" : "draft"}
                  onChange={(event) =>
                    setIsPublished(
                      event.target.value === "published"
                    )
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#061B3A] focus:ring-2 focus:ring-[#061B3A]/10"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              {/* Sort order */}
              <div>
                <label
                  htmlFor="sortOrder"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Sort Order
                </label>

                <input
                  id="sortOrder"
                  type="number"
                  value={sortOrder}
                  onChange={(event) =>
                    setSortOrder(event.target.value)
                  }
                  min="0"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#061B3A] focus:ring-2 focus:ring-[#061B3A]/10"
                />

                <p className="mt-2 text-xs text-gray-500">
                  Lower numbers appear first when sorting by order.
                </p>
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 pb-10 sm:flex-row sm:justify-end">
            <Link
              href="/admin/blog"
              className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#061B3A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0a2854] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiSave size={16} />
              {saving ? "Saving..." : "Save Article"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}