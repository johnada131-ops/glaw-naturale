import { createClient } from "@/lib/supabase/server";

export type SiteSettings = {
  id: string;
  email: string | null;
  business_phone: string | null;
  business_address: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  linkedin_url: string | null;
  tiktok_url: string | null;
  order_whatsapp_number: string | null;
  maintenance_mode: boolean;
};

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("site_settings")
    .select(
      `
        id,
        email,
        business_phone,
        business_address,
        instagram_url,
        facebook_url,
        linkedin_url,
        tiktok_url,
        order_whatsapp_number,
        maintenance_mode
      `
    )
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error loading site settings:", error);
    return null;
  }

  return data;
}