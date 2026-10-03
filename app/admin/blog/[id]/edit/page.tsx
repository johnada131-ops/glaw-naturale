"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import {
  FiArrowLeft,
  FiImage,
  FiSave,
  FiTrash2,
} from "react-icons/fi";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  image_url: string | null;
  is_published: boolean;
  published_at: string | null;
  sort_order: number;
};

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function getStoragePath(imageUrl: string | null) {
  if (!imageUrl) return null;

  const marker = "/storage/v1/object/public/blog-images/";

  const index = imageUrl.indexOf(marker);

  if (index === -1) return null;

  return decodeURIComponent(
    imageUrl.substring(index + marker.length)
  );
}

export default function EditBlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const postId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isPublished, setIsPublished] = useState(false);

  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(
    null
  );

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPost() {
      setLoading(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from("blog_posts")
        .select(
          "id, title, slug, excerpt, content, image_url, is_published, published_at, sort_order"
        )
        .eq("id", postId)
        .single();

      if (fetchError || !data) {
        console.error(fetchError);
        setError("Unable to load this article.");
        setLoading(false);
        return;
      }

      const post = data as BlogPost;

      setTitle(post.title);
      setSlug(post.slug);
      setExcerpt(post.excerpt || "");
      setContent(post.content);
      setIsPublished(post.is_published);
      setSortOrder(String(post.sort_order ?? 0));
      setExistingImageUrl(post.image_url);

      setLoading(false);
    }

    if (postId) {
      loadPost();
    }
  }, [postId]);

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
    setRemoveExistingImage(false);

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);

    if (existingImageUrl) {
      setRemoveExistingImage(true);
    }
  }

  function cancelImageRemoval() {
    setRemoveExistingImage(false);
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

    let newImagePath: string | null = null;
    let newImageUrl: string | null = null;

    try {
      /*
       * Upload replacement image first, if one was selected.
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

        newImagePath = filePath;

        const { data: publicUrlData } = supabase.storage
          .from("blog-images")
          .getPublicUrl(filePath);

        newImageUrl = publicUrlData.publicUrl;
      }

      const oldImageUrl = existingImageUrl;

      let finalImageUrl = oldImageUrl;

      if (newImageUrl) {
        finalImageUrl = newImageUrl;
      } else if (removeExistingImage) {
        finalImageUrl = null;
      }

      const publishedAt = isPublished
        ? new Date().toISOString()
        : null;

      const { error: updateError } = await supabase
        .from("blog_posts")
        .update({
          title: title.trim(),
          slug: slug.trim(),
          excerpt: excerpt.trim() || null,
          content: content.trim(),
          image_url: finalImageUrl,
          is_published: isPublished,
          published_at: publishedAt,
          sort_order: Number(sortOrder) || 0,
          updated_at: new Date().toISOString(),
        })
        .eq("id", postId);

      if (updateError) {
        /*
         * Roll back newly uploaded image if the database update fails.
         */
        if (newImagePath) {
          await supabase.storage
            .from("blog-images")
            .remove([newImagePath]);
        }

        console.error(updateError);

        if (updateError.code === "23505") {
          setError(
            "This slug already exists. Please choose a different slug."
          );
        } else {
          setError(updateError.message);
        }

        setSaving(false);
        return;
      }

      /*
       * Delete the old image only after the database update succeeds.
       */
      if (
        oldImageUrl &&
        (newImageUrl || removeExistingImage)
      ) {
        const oldImagePath = getStoragePath(oldImageUrl);

        if (oldImagePath) {
          await supabase.storage
            .from("blog-images")
            .remove([oldImagePath]);
        }
      }

      router.push("/admin/blog");
      router.refresh();
    } catch (err) {
      console.error(err);

      if (newImagePath) {
        await supabase.storage
          .from("blog-images")
          .remove([newImagePath]);
      }

      setError("Something went wrong while saving the article.");
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f8fa] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <p className="text-sm text-gray-500">
              Loading article...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error && !title) {
    return (
      <main className="min-h-screen bg-[#f7f8fa] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/admin/blog"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#061B3A]"
          >
            <FiArrowLeft size={16} />
            Back to Blog
          </Link>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {error}
          </div>
        </div>
      </main>
    );
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
            Edit Article
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Update your GLAW Naturale blog article.
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
            <h2 className="text-lg font-bold text-[#061B3A]">
              Featured Image
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Choose an image from the computer to use as the article
              thumbnail.
            </p>

            <div className="mt-6">
              {imagePreview ? (
                <div className="overflow-hidden rounded-2xl border border-gray-200">
                  <div className="relative aspect-[16/9] w-full bg-gray-100">
                    <Image
                      src={imagePreview}
                      alt="New article image preview"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>

                  <div className="flex flex-col gap-3 border-t border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        New image selected
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {imageFile
                          ? `${imageFile.name} · ${(
                              imageFile.size /
                              1024 /
                              1024
                            ).toFixed(2)} MB`
                          : ""}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <label
                        htmlFor="replace-image"
                        className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                      >
                        Change
                      </label>

                      <input
                        id="replace-image"
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
              ) : existingImageUrl && !removeExistingImage ? (
                <div className="overflow-hidden rounded-2xl border border-gray-200">
                  <div className="relative aspect-[16/9] w-full bg-gray-100">
                    <Image
                      src={existingImageUrl}
                      alt={title || "Article featured image"}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex flex-col gap-3 border-t border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        Current featured image
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        This image is currently attached to the article.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <label
                        htmlFor="change-image"
                        className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                      >
                        Change
                      </label>

                      <input
                        id="change-image"
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
              ) : (
                <label
                  htmlFor="article-image"
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
                    id="article-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}

              {removeExistingImage && !imagePreview && (
                <div className="mt-4 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <p className="text-sm text-amber-800">
                    The current image will be removed when you save.
                  </p>

                  <button
                    type="button"
                    onClick={cancelImageRemoval}
                    className="text-sm font-semibold text-amber-900 underline"
                  >
                    Keep image
                  </button>
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
              Edit the full article below.
            </p>

            <div className="mt-5">
              <textarea
                id="content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                rows={22}
                className="w-full resize-y rounded-xl border border-gray-300 px-4 py-4 text-sm leading-7 outline-none transition focus:border-[#061B3A] focus:ring-2 focus:ring-[#061B3A]/10"
              />
            </div>
          </section>

          {/* Publishing */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#061B3A]">
              Publishing
            </h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
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
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}