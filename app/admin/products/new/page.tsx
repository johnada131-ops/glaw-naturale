"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiArrowLeft,
  FiImage,
  FiPlus,
  FiSave,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { createClient } from "@/lib/supabase/client";

type ProductVariant = {
  id: string;
  size: string;
  price: string;
  isAvailable: boolean;
};

export default function NewProductPage() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [benefits, setBenefits] = useState("");

  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("NGN");

  const [isAvailable, setIsAvailable] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [sortOrder, setSortOrder] = useState("0");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const [variants, setVariants] = useState<ProductVariant[]>([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function generateSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  function handleNameChange(value: string) {
    setName(value);

    if (!slug) {
      setSlug(generateSlug(value));
    }
  }

  function handleImageChange(file: File | undefined) {
    if (!file) return;

    setError("");

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be 5MB or smaller.");
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(file);

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  }

  function removeImage() {
    setImageFile(null);

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImagePreview("");
  }

  function addVariant() {
    setVariants((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        size: "",
        price: "",
        isAvailable: true,
      },
    ]);
  }

  function updateVariant(
    id: string,
    field: keyof Omit<ProductVariant, "id">,
    value: string | boolean
  ) {
    setVariants((current) =>
      current.map((variant) =>
        variant.id === id
          ? {
              ...variant,
              [field]: value,
            }
          : variant
      )
    );
  }

  function removeVariant(id: string) {
    setVariants((current) =>
      current.filter((variant) => variant.id !== id)
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (!slug.trim()) {
      setError("Product slug is required.");
      return;
    }

    const incompleteVariant = variants.find(
      (variant) => !variant.size.trim()
    );

    if (incompleteVariant) {
      setError("Please enter a size for every size option you added.");
      return;
    }

    const duplicateSizes = new Set<string>();

    for (const variant of variants) {
      const normalizedSize = variant.size.trim().toLowerCase();

      if (duplicateSizes.has(normalizedSize)) {
        setError("Each product size can only be added once.");
        return;
      }

      duplicateSizes.add(normalizedSize);
    }

    setSaving(true);

    try {
      let imageUrl: string | null = null;
      let uploadedFilePath: string | null = null;

      /*
       * Upload image first, if selected.
       */
      if (imageFile) {
        const fileExtension =
          imageFile.name.split(".").pop()?.toLowerCase() || "jpg";

        const safeName = generateSlug(name);

        const filePath = `${safeName}-${Date.now()}.${fileExtension}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filePath, imageFile, {
            cacheControl: "3600",
            upsert: false,
            contentType: imageFile.type,
          });

        if (uploadError) {
          throw new Error(`Image upload failed: ${uploadError.message}`);
        }

        uploadedFilePath = filePath;

        const { data: publicUrlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);

        imageUrl = publicUrlData.publicUrl;
      }

      /*
       * Create product.
       */
      const { data: product, error: insertError } = await supabase
        .from("products")
        .insert({
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim() || null,
          ingredients: ingredients.trim() || null,
          benefits: benefits.trim() || null,
          price: price ? Number(price) : null,
          currency: currency.trim() || "NGN",
          image_url: imageUrl,
          is_available: isAvailable,
          is_featured: isFeatured,
          sort_order: Number(sortOrder) || 0,
        })
        .select("id")
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      /*
       * Create product sizes.
       */
      if (variants.length > 0) {
        const variantRows = variants.map((variant, index) => ({
          product_id: product.id,
          size: variant.size.trim(),
          price: variant.price ? Number(variant.price) : null,
          currency: currency.trim() || "NGN",
          is_available: variant.isAvailable,
          sort_order: index,
        }));

        const { error: variantsError } = await supabase
          .from("product_variants")
          .insert(variantRows);

        if (variantsError) {
          /*
           * Roll back the product if variants fail.
           */
          await supabase
            .from("products")
            .delete()
            .eq("id", product.id);

          if (uploadedFilePath) {
            await supabase.storage
              .from("product-images")
              .remove([uploadedFilePath]);
          }

          throw new Error(variantsError.message);
        }
      }

      router.push("/admin/products");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong while saving the product."
      );

      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] px-5 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/products"
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[#667085] transition-colors hover:text-[#0b1f3a]"
          >
            <FiArrowLeft size={16} />
            Back to Products
          </Link>

          <h1 className="font-[var(--font-montserrat)] text-3xl font-bold text-[#0b1f3a] sm:text-4xl">
            Add Product
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#667085] sm:text-base">
            Add a new product to the GLAW Naturale product catalog.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Product Image */}
            <section className="rounded-2xl border border-[#e4e7ec] bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6">
                <h2 className="font-[var(--font-montserrat)] text-xl font-bold text-[#0b1f3a]">
                  Product Image
                </h2>

                <p className="mt-1 text-sm text-[#667085]">
                  Upload the main image customers will see for this product.
                </p>
              </div>

              {imagePreview ? (
                <div className="relative max-w-md overflow-hidden rounded-2xl border border-[#e4e7ec] bg-[#f8fafc]">
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="aspect-square w-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#0b1f3a] shadow-md transition-colors hover:bg-[#c62828] hover:text-white"
                    aria-label="Remove image"
                  >
                    <FiX size={18} />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="product-image"
                  className="flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#d0d5dd] bg-[#f8fafc] px-6 text-center transition-colors hover:border-[#0b1f3a] hover:bg-white"
                >
                  <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#0b1f3a] text-white">
                    <FiImage size={24} />
                  </span>

                  <span className="text-sm font-semibold text-[#0b1f3a]">
                    Choose product image
                  </span>

                  <span className="mt-2 text-xs text-[#667085]">
                    JPG, PNG, WEBP — maximum 5MB
                  </span>

                  <input
                    id="product-image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) =>
                      handleImageChange(event.target.files?.[0])
                    }
                    className="hidden"
                  />
                </label>
              )}

              {imagePreview && (
                <label
                  htmlFor="product-image-change"
                  className="mt-4 inline-flex cursor-pointer items-center justify-center rounded-xl border border-[#e4e7ec] bg-white px-5 py-3 text-sm font-semibold text-[#0b1f3a] transition-colors hover:bg-[#f2f4f7]"
                >
                  Change Image

                  <input
                    id="product-image-change"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) =>
                      handleImageChange(event.target.files?.[0])
                    }
                    className="hidden"
                  />
                </label>
              )}
            </section>

            {/* Basic Information */}
            <section className="rounded-2xl border border-[#e4e7ec] bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6">
                <h2 className="font-[var(--font-montserrat)] text-xl font-bold text-[#0b1f3a]">
                  Basic Information
                </h2>

                <p className="mt-1 text-sm text-[#667085]">
                  Enter the main details of the product.
                </p>
              </div>

              <div className="grid gap-5">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-[#0b1f3a]"
                  >
                    Product Name
                  </label>

                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(event) => handleNameChange(event.target.value)}
                    placeholder="e.g. Revitalize"
                    className="w-full rounded-xl border border-[#e4e7ec] bg-white px-4 py-3 text-sm text-[#101828] outline-none transition focus:border-[#0b1f3a] focus:ring-2 focus:ring-[#0b1f3a]/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="slug"
                    className="mb-2 block text-sm font-semibold text-[#0b1f3a]"
                  >
                    Slug
                  </label>

                  <input
                    id="slug"
                    type="text"
                    value={slug}
                    onChange={(event) =>
                      setSlug(generateSlug(event.target.value))
                    }
                    placeholder="revitalize"
                    className="w-full rounded-xl border border-[#e4e7ec] bg-white px-4 py-3 text-sm text-[#101828] outline-none transition focus:border-[#0b1f3a] focus:ring-2 focus:ring-[#0b1f3a]/10"
                  />

                  <p className="mt-2 text-xs text-[#667085]">
                    Used in the product page URL.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="mb-2 block text-sm font-semibold text-[#0b1f3a]"
                  >
                    Description
                  </label>

                  <textarea
                    id="description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Describe the product..."
                    rows={5}
                    className="w-full resize-y rounded-xl border border-[#e4e7ec] bg-white px-4 py-3 text-sm leading-6 text-[#101828] outline-none transition focus:border-[#0b1f3a] focus:ring-2 focus:ring-[#0b1f3a]/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="ingredients"
                    className="mb-2 block text-sm font-semibold text-[#0b1f3a]"
                  >
                    Ingredients
                  </label>

                  <textarea
                    id="ingredients"
                    value={ingredients}
                    onChange={(event) => setIngredients(event.target.value)}
                    placeholder="List the ingredients..."
                    rows={4}
                    className="w-full resize-y rounded-xl border border-[#e4e7ec] bg-white px-4 py-3 text-sm leading-6 text-[#101828] outline-none transition focus:border-[#0b1f3a] focus:ring-2 focus:ring-[#0b1f3a]/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="benefits"
                    className="mb-2 block text-sm font-semibold text-[#0b1f3a]"
                  >
                    Benefits
                  </label>

                  <textarea
                    id="benefits"
                    value={benefits}
                    onChange={(event) => setBenefits(event.target.value)}
                    placeholder="Describe the product benefits..."
                    rows={4}
                    className="w-full resize-y rounded-xl border border-[#e4e7ec] bg-white px-4 py-3 text-sm leading-6 text-[#101828] outline-none transition focus:border-[#0b1f3a] focus:ring-2 focus:ring-[#0b1f3a]/10"
                  />
                </div>
              </div>
            </section>

            {/* Product Sizes */}
            <section className="rounded-2xl border border-[#e4e7ec] bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="font-[var(--font-montserrat)] text-xl font-bold text-[#0b1f3a]">
                    Available Sizes
                  </h2>

                  <p className="mt-1 max-w-2xl text-sm leading-6 text-[#667085]">
                    Add the sizes this product is actually available in. You
                    can leave this section empty if the sizes have not been
                    confirmed yet.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addVariant}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0b1f3a] px-5 py-3 text-sm font-semibold !text-white transition-colors hover:bg-[#c62828]"
                >
                  <FiPlus size={16} />
                  Add Size
                </button>
              </div>

              {variants.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#d0d5dd] bg-[#f8fafc] px-5 py-8 text-center">
                  <p className="text-sm font-medium text-[#0b1f3a]">
                    No sizes added yet.
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#667085]">
                    Add sizes when you have confirmed the available options.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {variants.map((variant, index) => (
                    <div
                      key={variant.id}
                      className="rounded-xl border border-[#e4e7ec] bg-[#f8fafc] p-4"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm font-semibold text-[#0b1f3a]">
                          Size {index + 1}
                        </p>

                        <button
                          type="button"
                          onClick={() => removeVariant(variant.id)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#c62828] transition-colors hover:text-[#0b1f3a]"
                        >
                          <FiTrash2 size={14} />
                          Remove
                        </button>
                      </div>

                      <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
                        <div>
                          <label
                            htmlFor={`size-${variant.id}`}
                            className="mb-2 block text-xs font-semibold text-[#0b1f3a]"
                          >
                            Size
                          </label>

                          <input
                            id={`size-${variant.id}`}
                            type="text"
                            value={variant.size}
                            onChange={(event) =>
                              updateVariant(
                                variant.id,
                                "size",
                                event.target.value
                              )
                            }
                            placeholder="e.g. 500ml"
                            className="w-full rounded-xl border border-[#e4e7ec] bg-white px-4 py-3 text-sm text-[#101828] outline-none transition focus:border-[#0b1f3a] focus:ring-2 focus:ring-[#0b1f3a]/10"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor={`variant-price-${variant.id}`}
                            className="mb-2 block text-xs font-semibold text-[#0b1f3a]"
                          >
                            Price
                          </label>

                          <input
                            id={`variant-price-${variant.id}`}
                            type="number"
                            min="0"
                            step="0.01"
                            value={variant.price}
                            onChange={(event) =>
                              updateVariant(
                                variant.id,
                                "price",
                                event.target.value
                              )
                            }
                            placeholder="4000"
                            className="w-full rounded-xl border border-[#e4e7ec] bg-white px-4 py-3 text-sm text-[#101828] outline-none transition focus:border-[#0b1f3a] focus:ring-2 focus:ring-[#0b1f3a]/10"
                          />
                        </div>

                        <label className="flex cursor-pointer items-center gap-2 pb-3">
                          <input
                            type="checkbox"
                            checked={variant.isAvailable}
                            onChange={(event) =>
                              updateVariant(
                                variant.id,
                                "isAvailable",
                                event.target.checked
                              )
                            }
                            className="h-4 w-4 accent-[#c62828]"
                          />

                          <span className="text-xs font-semibold text-[#0b1f3a]">
                            Available
                          </span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Pricing */}
            <section className="rounded-2xl border border-[#e4e7ec] bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6">
                <h2 className="font-[var(--font-montserrat)] text-xl font-bold text-[#0b1f3a]">
                  Default Pricing
                </h2>

                <p className="mt-1 text-sm leading-6 text-[#667085]">
                  This is kept as a product-level fallback. Once sizes are
                  confirmed, individual size prices can be used instead.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="price"
                    className="mb-2 block text-sm font-semibold text-[#0b1f3a]"
                  >
                    Default Price
                  </label>

                  <input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                    placeholder="4000"
                    className="w-full rounded-xl border border-[#e4e7ec] bg-white px-4 py-3 text-sm text-[#101828] outline-none transition focus:border-[#0b1f3a] focus:ring-2 focus:ring-[#0b1f3a]/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="currency"
                    className="mb-2 block text-sm font-semibold text-[#0b1f3a]"
                  >
                    Currency
                  </label>

                  <select
                    id="currency"
                    value={currency}
                    onChange={(event) => setCurrency(event.target.value)}
                    className="w-full rounded-xl border border-[#e4e7ec] bg-white px-4 py-3 text-sm text-[#101828] outline-none transition focus:border-[#0b1f3a] focus:ring-2 focus:ring-[#0b1f3a]/10"
                  >
                    <option value="NGN">NGN — Nigerian Naira</option>
                    <option value="USD">USD — US Dollar</option>
                    <option value="GBP">GBP — British Pound</option>
                    <option value="EUR">EUR — Euro</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Visibility */}
            <section className="rounded-2xl border border-[#e4e7ec] bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6">
                <h2 className="font-[var(--font-montserrat)] text-xl font-bold text-[#0b1f3a]">
                  Visibility & Display
                </h2>

                <p className="mt-1 text-sm text-[#667085]">
                  Control how this product appears on the website.
                </p>
              </div>

              <div className="space-y-5">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={(event) => setIsAvailable(event.target.checked)}
                    className="mt-1 h-4 w-4 accent-[#c62828]"
                  />

                  <span>
                    <span className="block text-sm font-semibold text-[#0b1f3a]">
                      Available
                    </span>

                    <span className="mt-1 block text-xs leading-5 text-[#667085]">
                      Customers can see this product as available for ordering.
                    </span>
                  </span>
                </label>

                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(event) => setIsFeatured(event.target.checked)}
                    className="mt-1 h-4 w-4 accent-[#c62828]"
                  />

                  <span>
                    <span className="block text-sm font-semibold text-[#0b1f3a]">
                      Featured Product
                    </span>

                    <span className="mt-1 block text-xs leading-5 text-[#667085]">
                      Mark this product as featured for future homepage/catalog
                      use.
                    </span>
                  </span>
                </label>

                <div className="max-w-xs">
                  <label
                    htmlFor="sortOrder"
                    className="mb-2 block text-sm font-semibold text-[#0b1f3a]"
                  >
                    Display Order
                  </label>

                  <input
                    id="sortOrder"
                    type="number"
                    min="0"
                    value={sortOrder}
                    onChange={(event) => setSortOrder(event.target.value)}
                    className="w-full rounded-xl border border-[#e4e7ec] bg-white px-4 py-3 text-sm text-[#101828] outline-none transition focus:border-[#0b1f3a] focus:ring-2 focus:ring-[#0b1f3a]/10"
                  />

                  <p className="mt-2 text-xs text-[#667085]">
                    Lower numbers appear first.
                  </p>
                </div>
              </div>
            </section>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Link
                href="/admin/products"
                className="inline-flex items-center justify-center rounded-xl border border-[#e4e7ec] bg-white px-6 py-3 text-sm font-semibold text-[#0b1f3a] transition-colors hover:bg-[#f2f4f7]"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#c62828] px-6 py-3 text-sm font-semibold !text-white transition-colors hover:bg-[#0b1f3a] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiSave size={16} />
                {saving ? "Saving..." : "Save Product"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}