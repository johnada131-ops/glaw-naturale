import { createClient } from "@/lib/supabase/server";
import Products from "./Products";

export default async function ProductsSection() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, description, image_url")
    .eq("is_available", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error loading homepage products:", error);
  }

  return <Products products={data ?? []} />;
}