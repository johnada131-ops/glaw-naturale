"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FiArrowLeft,
  FiImage,
  FiPlus,
  FiSave,
  FiTrash2,
} from "react-icons/fi";
import { createClient } from "@/lib/supabase/client";

type ProductVariant = {
  id: string;
  size: string;
  price: string;
  isAvailable: boolean;
};

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const productId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [benefits, setBenefits] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("NGN");
  const [imageUrl, setImageUrl] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [sortOrder, setSortOrder] = useState("0");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const [variants, setVariants] = useState<ProductVariant[]>([]);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  async function loadProduct() {
    setLoading(true);
    setError("");

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      setError(productError?.message || "Product not found.");
      setLoading(false);
      return;
    }

    const { data: variantData, error: variantError } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", productId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (variantError) {
      setError(variantError.message);
      setLoading(false);
      return;
    }

    setName(product.name || "");
    setSlug(product.slug || "");
    setDescription(product.description || "");
    setIngredients(product.ingredients || "");
    setBenefits(product.benefits || "");
    setPrice(product.price?.toString() || "");
    setCurrency(product.currency || "NGN");
    setImageUrl(product.image_url || "");
    setImagePreview(product.image_url || "");
    setIsAvailable(product.is_available ?? true);
    setIsFeatured(product.is_featured ?? false);
    setSortOrder(product.sort_order?.toString() || "0");

    setVariants(
      (variantData || []).map((variant) => ({
        id: variant.id,
        size: variant.size || "",
        price: variant.price?.toString() || "",
        isAvailable: variant.is_available ?? true,
      }))
    );

    setLoading(false);
  }

  function handleImageChange(file: File | null) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be 5MB or smaller.");
      return;
    }

    setError("");
    setImageFile(file);

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  }

  function addVariant() {
    setVariants((current) => [
      ...current,
      {
        id: `new-${Date.now()}-${Math.random()}`,
        size: "",
        price: "",
        isAvailable: true,
      },
    ]);
  }

  function updateVariant(
    index: number,
    field: keyof ProductVariant,
    value: string | boolean
  ) {
    setVariants((current) =>
      current.map((variant, variantIndex) =>
        variantIndex === index
          ? {
              ...variant,
              [field]: value,
            }
          : variant
      )
    );
  }

  function removeVariant(index: number) {
    setVariants((current) =>
      current.filter((_, variantIndex) => variantIndex !== index)
    );
  }

  async function uploadNewImage() {
    if (!imageFile) return imageUrl || null;

    const fileExtension =
      imageFile.name.split(".").pop()?.toLowerCase() || "jpg";

    const fileName = `${productId}-${Date.now()}.${fileExtension}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(fileName, imageFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  async function handleSave() {
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (!slug.trim()) {
      setError("Product slug is required.");
      return;
    }

    const cleanedVariants = variants.filter(
      (variant) => variant.size.trim() !== ""
    );

    const normalizedSizes = cleanedVariants.map((variant) =>
      variant.size.trim().toLowerCase()
    );

    const hasDuplicateSizes =
      new Set(normalizedSizes).size !== normalizedSizes.length;

    if (hasDuplicateSizes) {
      setError("Each product size can only be added once.");
      return;
    }

    setSaving(true);

    let uploadedImageUrl: string | null = null;

    try {
      if (imageFile) {
        uploadedImageUrl = await uploadNewImage();
      }

      const finalImageUrl = uploadedImageUrl || imageUrl || null;

      const { error: productError } = await supabase
        .from("products")
        .update({
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim() || null,
          ingredients: ingredients.trim() || null,
          benefits: benefits.trim() || null,
          price: price ? Number(price) : null,
          currency: currency.trim() || "NGN",
          image_url: finalImageUrl,
          is_available: isAvailable,
          is_featured: isFeatured,
          sort_order: Number(sortOrder) || 0,
          updated_at: new Date().toISOString(),
        })
        .eq("id", productId);

      if (productError) {
        throw new Error(productError.message);
      }

      const { data: existingVariants, error: existingError } =
        await supabase
          .from("product_variants")
          .select("id")
          .eq("product_id", productId);

      if (existingError) {
        throw new Error(existingError.message);
      }

      const existingIds = new Set(
        (existingVariants || []).map((variant) => variant.id)
      );

      const submittedExistingIds = new Set(
        cleanedVariants
          .filter((variant) => !variant.id.startsWith("new-"))
          .map((variant) => variant.id)
      );

      const variantsToDelete = Array.from(existingIds).filter(
        (id) => !submittedExistingIds.has(id)
      );

      if (variantsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from("product_variants")
          .delete()
          .in("id", variantsToDelete);

        if (deleteError) {
          throw new Error(deleteError.message);
        }
      }

      for (let index = 0; index < cleanedVariants.length; index++) {
        const variant = cleanedVariants[index];

        if (variant.id.startsWith("new-")) {
          const { error: insertError } = await supabase
            .from("product_variants")
            .insert({
              product_id: productId,
              size: variant.size.trim(),
              price: variant.price ? Number(variant.price) : null,
              currency: currency.trim() || "NGN",
              is_available: variant.isAvailable,
              sort_order: index,
            });

          if (insertError) {
            throw new Error(insertError.message);
          }
        } else {
          const { error: updateError } = await supabase
            .from("product_variants")
            .update({
              size: variant.size.trim(),
              price: variant.price ? Number(variant.price) : null,
              currency: currency.trim() || "NGN",
              is_available: variant.isAvailable,
              sort_order: index,
              updated_at: new Date().toISOString(),
            })
            .eq("id", variant.id);

          if (updateError) {
            throw new Error(updateError.message);
          }
        }
      }

      setSuccess("Product updated successfully.");

      setTimeout(() => {
        router.push("/admin/products");
      }, 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f8fafc] px-5 py-10 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm text-muted">Loading product...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] px-5 py-10 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/admin/products"
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-navy"
            >
              <FiArrowLeft size={16} />
              Back to Products
            </Link>

            <h1 className="font-[var(--font-montserrat)] text-3xl font-bold text-navy">
              Edit Product
            </h1>

            <p className="mt-2 text-sm text-muted">
              Update product information, image, availability and sizes.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-red px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiSave size={17} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <div className="space-y-6">
          {/* Basic Information */}
          <section className="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-7">
            <h2 className="font-[var(--font-montserrat)] text-xl font-bold text-navy">
              Basic Information
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-navy">
                  Product Name
                </label>

                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-border px-4 py-3 text-sm outline-none transition focus:border-navy"
                  placeholder="e.g. Revitalize"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-navy">
                  Slug
                </label>

                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full rounded-xl border border-border px-4 py-3 text-sm outline-none transition focus:border-navy"
                  placeholder="e.g. revitalize"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-navy">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  className="w-full resize-none rounded-xl border border-border px-4 py-3 text-sm outline-none transition focus:border-navy"
                  placeholder="Describe the product..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-navy">
                  Ingredients
                </label>

                <textarea
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  rows={4}
                  className="w-full resize-none rounded-xl border border-border px-4 py-3 text-sm outline-none transition focus:border-navy"
                  placeholder="List ingredients..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-navy">
                  Benefits
                </label>

                <textarea
                  value={benefits}
                  onChange={(e) => setBenefits(e.target.value)}
                  rows={4}
                  className="w-full resize-none rounded-xl border border-border px-4 py-3 text-sm outline-none transition focus:border-navy"
                  placeholder="List product benefits..."
                />
              </div>
            </div>
          </section>

          {/* Product Image */}
          <section className="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-7">
            <h2 className="font-[var(--font-montserrat)] text-xl font-bold text-navy">
              Product Image
            </h2>

            <div className="mt-6 grid gap-6 md:grid-cols-[240px_1fr]">
              <div className="overflow-hidden rounded-xl border border-border bg-surface">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt={name || "Product preview"}
                    className="aspect-square h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-square items-center justify-center text-muted">
                    <FiImage size={40} />
                  </div>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-navy">
                  Replace Image
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleImageChange(e.target.files?.[0] || null)
                  }
                  className="block w-full rounded-xl border border-border bg-white px-4 py-3 text-sm"
                />

                <p className="mt-2 text-xs text-muted">
                  Maximum file size: 5MB.
                </p>

                {imageUrl && !imageFile && (
                  <p className="mt-3 break-all text-xs text-muted">
                    Current image is being used.
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Sizes */}
          <section className="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-[var(--font-montserrat)] text-xl font-bold text-navy">
                  Available Sizes
                </h2>

                <p className="mt-1 text-sm text-muted">
                  Add each size only once. Each size can have its own price.
                </p>
              </div>

              <button
                type="button"
                onClick={addVariant}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-red px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy"
              >
                <FiPlus size={16} />
                Add Size
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {variants.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-surface px-5 py-8 text-center">
                  <p className="text-sm text-muted">
                    No sizes added yet.
                  </p>

                  <button
                    type="button"
                    onClick={addVariant}
                    className="mt-3 text-sm font-semibold text-red hover:text-navy"
                  >
                    Add the first size
                  </button>
                </div>
              ) : (
                variants.map((variant, index) => (
                  <div
                    key={variant.id}
                    className="rounded-xl border border-border p-4"
                  >
                    <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto_auto] md:items-end">
                      <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted">
                          Size
                        </label>

                        <input
                          value={variant.size}
                          onChange={(e) =>
                            updateVariant(index, "size", e.target.value)
                          }
                          className="w-full rounded-xl border border-border px-4 py-3 text-sm outline-none transition focus:border-navy"
                          placeholder="e.g. 500ml"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted">
                          Price
                        </label>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={variant.price}
                          onChange={(e) =>
                            updateVariant(index, "price", e.target.value)
                          }
                          className="w-full rounded-xl border border-border px-4 py-3 text-sm outline-none transition focus:border-navy"
                          placeholder="e.g. 2500"
                        />
                      </div>

                      <label className="flex items-center gap-2 pb-3 text-sm font-medium text-navy">
                        <input
                          type="checkbox"
                          checked={variant.isAvailable}
                          onChange={(e) =>
                            updateVariant(
                              index,
                              "isAvailable",
                              e.target.checked
                            )
                          }
                          className="h-4 w-4"
                        />
                        Available
                      </label>

                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="mb-1 inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red transition-colors hover:bg-red-50"
                      >
                        <FiTrash2 size={16} />
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Pricing and Status */}
          <section className="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-7">
            <h2 className="font-[var(--font-montserrat)] text-xl font-bold text-navy">
              Pricing & Status
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-semibold text-navy">
                  Default Price
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full rounded-xl border border-border px-4 py-3 text-sm outline-none transition focus:border-navy"
                  placeholder="Optional"
                />

                <p className="mt-2 text-xs text-muted">
                  Temporary fallback price for the product.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-navy">
                  Currency
                </label>

                <input
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full rounded-xl border border-border px-4 py-3 text-sm outline-none transition focus:border-navy"
                  placeholder="NGN"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-navy">
                  Sort Order
                </label>

                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full rounded-xl border border-border px-4 py-3 text-sm outline-none transition focus:border-navy"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              <label className="flex items-center gap-3 text-sm font-medium text-navy">
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="h-4 w-4"
                />
                Product is available
              </label>

              <label className="flex items-center gap-3 text-sm font-medium text-navy">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="h-4 w-4"
                />
                Featured product
              </label>
            </div>
          </section>

          {/* Bottom Actions */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/admin/products"
              className="inline-flex items-center justify-center rounded-full border border-border bg-white px-6 py-3 text-sm font-semibold text-navy transition-colors hover:bg-surface"
            >
              Cancel
            </Link>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-red px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiSave size={17} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}