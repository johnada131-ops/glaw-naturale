"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FiEdit2,
  FiPlus,
  FiRefreshCw,
  FiTrash2,
} from "react-icons/fi";
import { createClient } from "@/lib/supabase/client";

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number | null;
  currency: string;
  image_url: string | null;
  is_available: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
};

export default function AdminProductsPage() {
  const supabase = createClient();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadProducts() {
    setLoading(true);
    setError("");

    const { data, error: fetchError } = await supabase
      .from("products")
      .select(
        `
          id,
          name,
          slug,
          description,
          price,
          currency,
          image_url,
          is_available,
          is_featured,
          sort_order,
          created_at
        `
      )
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setProducts([]);
    } else {
      setProducts(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function handleDelete(product: Product) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`
    );

    if (!confirmed) return;

    setError("");

    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setProducts((current) =>
      current.filter((item) => item.id !== product.id)
    );
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] px-5 py-10 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-[var(--font-montserrat)] text-3xl font-bold text-navy">
              Products
            </h1>

            <p className="mt-2 text-sm text-muted">
              Manage GLAW Naturale products, images, availability and sizes.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadProducts}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-white px-5 py-3 text-sm font-semibold text-navy transition-colors hover:bg-surface"
            >
              <FiRefreshCw size={16} />
              Refresh
            </button>

            <Link
              href="/admin/products/new"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-red px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy"
            >
              <FiPlus size={17} />
              Add Product
            </Link>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="rounded-2xl border border-border bg-white p-10 text-center shadow-sm">
            <p className="text-sm text-muted">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          /* Empty State */
          <div className="rounded-2xl border border-border bg-white p-10 text-center shadow-sm">
            <h2 className="font-[var(--font-montserrat)] text-xl font-bold text-navy">
              No products yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
              Products you add from the admin dashboard will appear here.
            </p>

            <Link
              href="/admin/products/new"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-red px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy"
            >
              <FiPlus size={17} />
              Add Your First Product
            </Link>
          </div>
        ) : (
          /* Products */
          <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[850px]">
                <thead>
                  <tr className="border-b border-border bg-surface text-left">
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-muted">
                      Product
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-muted">
                      Price
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-muted">
                      Status
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-muted">
                      Featured
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-muted">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-border last:border-0"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-xs text-muted">
                                No image
                              </div>
                            )}
                          </div>

                          <div>
                            <p className="font-[var(--font-montserrat)] text-sm font-bold text-navy">
                              {product.name}
                            </p>

                            <p className="mt-1 text-xs text-muted">
                              /products/{product.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-sm font-medium text-navy">
                        {product.price !== null
                          ? `${product.currency} ${product.price.toLocaleString()}`
                          : "—"}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            product.is_available
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {product.is_available
                            ? "Available"
                            : "Unavailable"}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            product.is_featured
                              ? "bg-red-50 text-red-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {product.is_featured ? "Featured" : "No"}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-navy transition-colors hover:bg-surface hover:text-red"
                          >
                            <FiEdit2 size={15} />
                            Edit
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDelete(product)}
                            className="inline-flex items-center justify-center rounded-lg border border-red-200 px-3 py-2 text-red transition-colors hover:bg-red-50"
                            aria-label={`Delete ${product.name}`}
                          >
                            <FiTrash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="divide-y divide-border md:hidden">
              {products.map((product) => (
                <div key={product.id} className="p-5">
                  <div className="flex gap-4">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-muted">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h2 className="font-[var(--font-montserrat)] text-base font-bold text-navy">
                        {product.name}
                      </h2>

                      <p className="mt-1 truncate text-xs text-muted">
                        /products/{product.slug}
                      </p>

                      <p className="mt-2 text-sm font-semibold text-navy">
                        {product.price !== null
                          ? `${product.currency} ${product.price.toLocaleString()}`
                          : "No default price"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        product.is_available
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {product.is_available
                        ? "Available"
                        : "Unavailable"}
                    </span>

                    {product.is_featured && (
                      <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                        Featured
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-semibold text-navy transition-colors hover:bg-surface hover:text-red"
                    >
                      <FiEdit2 size={15} />
                      Edit
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDelete(product)}
                      className="inline-flex items-center justify-center rounded-xl border border-red-200 px-4 py-3 text-red transition-colors hover:bg-red-50"
                      aria-label={`Delete ${product.name}`}
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}