"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import * as tus from "tus-js-client";

type Testimonial = {
  id: string;
  media_type: "image" | "video";
  media_url: string;
  status: string;
  created_at: string;
};

const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

export default function TestimonialsAdminPage() {
  const supabase = createClient();

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState("");

  async function loadTestimonials() {
    setLoading(true);

    const { data, error } = await supabase
      .from("testimonials")
      .select("id, media_type, media_url, status, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
    } else {
      setTestimonials(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadTestimonials();
  }, []);

  async function uploadVideo(file: File, filePath: string) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error("Your admin session has expired. Please log in again.");
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!supabaseUrl) {
      throw new Error("Supabase URL is not configured.");
    }

    const projectId = new URL(supabaseUrl).hostname.split(".")[0];

    const endpoint = `https://${projectId}.storage.supabase.co/storage/v1/upload/resumable`;

    return new Promise<string>((resolve, reject) => {
      const upload = new tus.Upload(file, {
        endpoint,

        retryDelays: [0, 3000, 5000, 10000, 20000],

        headers: {
          authorization: `Bearer ${session.access_token}`,
          "x-upsert": "false",
        },

        uploadDataDuringCreation: true,

        removeFingerprintOnSuccess: true,

        chunkSize: 6 * 1024 * 1024,

        metadata: {
          bucketName: "testimonial-images",
          objectName: filePath,
          contentType: file.type,
          cacheControl: "31536000",
        },

        onError(error) {
          console.error("TUS upload error:", error);
          reject(
            new Error(
              error.message || "Video upload failed."
            )
          );
        },

        onProgress(bytesUploaded, bytesTotal) {
          const percentage = Math.round(
            (bytesUploaded / bytesTotal) * 100
          );

          setUploadProgress(percentage);
        },

        onSuccess() {
          resolve(filePath);
        },
      });

      upload
        .findPreviousUploads()
        .then((previousUploads) => {
          if (previousUploads.length > 0) {
            upload.resumeFromPreviousUpload(previousUploads[0]);
          }

          upload.start();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setUploadProgress(0);

    if (mediaType === "image" && !imageFile) {
      setMessage("Please select an image.");
      return;
    }

    if (mediaType === "video" && !videoFile) {
      setMessage("Please select a video.");
      return;
    }

    if (mediaType === "video" && videoFile) {
      if (!videoFile.type.startsWith("video/")) {
        setMessage("Please select a valid video file.");
        return;
      }

      if (videoFile.size > MAX_VIDEO_SIZE) {
        setMessage("Video is too large. Maximum allowed size is 50 MB.");
        return;
      }
    }

    setUploading(true);

    try {
      let mediaUrl = "";

      /*
       * IMAGE UPLOAD
       */
      if (mediaType === "image" && imageFile) {
        const fileExt =
          imageFile.name.split(".").pop()?.toLowerCase() || "jpg";

        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `testimonials/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("testimonial-images")
          .upload(filePath, imageFile, {
            cacheControl: "31536000",
            upsert: false,
            contentType: imageFile.type,
          });

        if (uploadError) {
          throw new Error(uploadError.message);
        }

        const { data } = supabase.storage
          .from("testimonial-images")
          .getPublicUrl(filePath);

        mediaUrl = data.publicUrl;
      }

      /*
       * VIDEO UPLOAD
       */
      if (mediaType === "video" && videoFile) {
        const fileExt =
          videoFile.name.split(".").pop()?.toLowerCase() || "mp4";

        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `testimonials/videos/${fileName}`;

        await uploadVideo(videoFile, filePath);

        const { data } = supabase.storage
          .from("testimonial-images")
          .getPublicUrl(filePath);

        mediaUrl = data.publicUrl;
      }

      /*
       * SAVE DATABASE RECORD
       */
      const { error } = await supabase.from("testimonials").insert({
        media_type: mediaType,
        media_url: mediaUrl,
        status: "pending",
      });

      if (error) {
        throw new Error(error.message);
      }

      setImageFile(null);
      setVideoFile(null);
      setUploadProgress(0);
      setMessage("Testimonial submitted for approval.");

      const imageInput = document.getElementById(
        "testimonial-image"
      ) as HTMLInputElement | null;

      const videoInput = document.getElementById(
        "testimonial-video"
      ) as HTMLInputElement | null;

      if (imageInput) {
        imageInput.value = "";
      }

      if (videoInput) {
        videoInput.value = "";
      }

      await loadTestimonials();
    } catch (error) {
      console.error(error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setUploading(false);
    }
  }

  async function approveTestimonial(id: string) {
    const { error } = await supabase
      .from("testimonials")
      .update({
        status: "approved",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      setMessage(error.message);
      return;
    }

    await loadTestimonials();
  }

  async function deleteTestimonial(testimonial: Testimonial) {
    const confirmed = window.confirm(
      "Delete this testimonial permanently?"
    );

    if (!confirmed) return;

    try {
      const url = new URL(testimonial.media_url);

      const marker =
        "/storage/v1/object/public/testimonial-images/";

      const index = url.pathname.indexOf(marker);

      if (index !== -1) {
        const filePath = decodeURIComponent(
          url.pathname.slice(index + marker.length)
        );

        await supabase.storage
          .from("testimonial-images")
          .remove([filePath]);
      }
    } catch {
      // Continue deleting the database record.
    }

    const { error } = await supabase
      .from("testimonials")
      .delete()
      .eq("id", testimonial.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    await loadTestimonials();
  }

  const pending = testimonials.filter(
    (testimonial) => testimonial.status === "pending"
  );

  const approved = testimonials.filter(
    (testimonial) => testimonial.status === "approved"
  );

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#0d3b66]">
            Testimonials
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Add customer testimonial images or videos.
          </p>
        </div>

        {/* Add Testimonial */}
        <div className="mb-10 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-5 text-lg font-semibold text-slate-900">
            Add Testimonial
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setMediaType("image");
                  setVideoFile(null);
                  setMessage("");
                  setUploadProgress(0);
                }}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  mediaType === "image"
                    ? "bg-[#0d3b66] text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                Image
              </button>

              <button
                type="button"
                onClick={() => {
                  setMediaType("video");
                  setImageFile(null);
                  setMessage("");
                  setUploadProgress(0);
                }}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  mediaType === "video"
                    ? "bg-[#0d3b66] text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                Video
              </button>
            </div>

            {mediaType === "image" ? (
              <div>
                <label
                  htmlFor="testimonial-image"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Testimonial Image
                </label>

                <input
                  id="testimonial-image"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setImageFile(
                      e.target.files?.[0] || null
                    )
                  }
                  className="block w-full rounded-lg border border-slate-300 bg-white p-3 text-sm"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Upload screenshots or testimonial images.
                  The original aspect ratio will be preserved.
                </p>
              </div>
            ) : (
              <div>
                <label
                  htmlFor="testimonial-video"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Testimonial Video
                </label>

                <input
                  id="testimonial-video"
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,video/*"
                  onChange={(e) => {
                    const selectedFile =
                      e.target.files?.[0] || null;

                    if (!selectedFile) {
                      setVideoFile(null);
                      return;
                    }

                    if (!selectedFile.type.startsWith("video/")) {
                      setVideoFile(null);
                      setMessage(
                        "Please select a valid video file."
                      );
                      return;
                    }

                    if (selectedFile.size > MAX_VIDEO_SIZE) {
                      setVideoFile(null);
                      setMessage(
                        "Video is too large. Maximum allowed size is 50 MB."
                      );
                      return;
                    }

                    setMessage("");
                    setVideoFile(selectedFile);
                  }}
                  className="block w-full rounded-lg border border-slate-300 bg-white p-3 text-sm"
                />

                {videoFile && (
                  <div className="mt-4 max-w-md overflow-hidden rounded-xl border border-slate-200 bg-black">
                    <video
                      src={URL.createObjectURL(videoFile)}
                      controls
                      preload="metadata"
                      className="block h-auto w-full"
                    />
                  </div>
                )}

                <p className="mt-2 text-xs text-slate-500">
                  Maximum video size: 50 MB. MP4 is recommended.
                </p>

                {uploading && (
                  <div className="mt-4">
                    <div className="mb-1 flex justify-between text-xs text-slate-500">
                      <span>Uploading video...</span>
                      <span>{uploadProgress}%</span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full bg-[#0d3b66] transition-all duration-300"
                        style={{
                          width: `${uploadProgress}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {message && (
              <div className="rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-600">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={uploading}
              className="rounded-lg bg-[#d62828] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading
                ? mediaType === "video"
                  ? `Uploading ${uploadProgress}%`
                  : "Adding..."
                : "Add Testimonial"}
            </button>
          </form>
        </div>

        {/* Pending */}
        <section className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Pending
            </h2>

            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
              {pending.length}
            </span>
          </div>

          {loading ? (
            <p className="text-sm text-slate-500">
              Loading...
            </p>
          ) : pending.length === 0 ? (
            <div className="rounded-xl bg-white p-6 text-sm text-slate-500 ring-1 ring-slate-200">
              No pending testimonials.
            </div>
          ) : (
            <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
              {pending.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="mb-5 break-inside-avoid overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"
                >
                  {testimonial.media_type === "image" ? (
                    <img
                      src={testimonial.media_url}
                      alt="Pending testimonial"
                      className="block h-auto w-full"
                      loading="lazy"
                    />
                  ) : (
                    <video
                      src={testimonial.media_url}
                      controls
                      preload="metadata"
                      className="block h-auto w-full"
                    />
                  )}

                  <div className="flex gap-2 p-3">
                    <button
                      onClick={() =>
                        approveTestimonial(testimonial.id)
                      }
                      className="flex-1 rounded-lg bg-[#0d3b66] px-3 py-2 text-sm font-semibold text-white"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() =>
                        deleteTestimonial(testimonial)
                      }
                      className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Approved */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Approved
            </h2>

            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
              {approved.length}
            </span>
          </div>

          {approved.length === 0 ? (
            <div className="rounded-xl bg-white p-6 text-sm text-slate-500 ring-1 ring-slate-200">
              No approved testimonials yet.
            </div>
          ) : (
            <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
              {approved.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="mb-5 break-inside-avoid overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"
                >
                  {testimonial.media_type === "image" ? (
                    <img
                      src={testimonial.media_url}
                      alt="Approved testimonial"
                      className="block h-auto w-full"
                      loading="lazy"
                    />
                  ) : (
                    <video
                      src={testimonial.media_url}
                      controls
                      preload="none"
                      className="block h-auto w-full"
                    />
                  )}

                  <div className="p-3">
                    <button
                      onClick={() =>
                        deleteTestimonial(testimonial)
                      }
                      className="w-full rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}