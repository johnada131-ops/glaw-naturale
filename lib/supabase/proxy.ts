import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          supabaseResponse = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data } = await supabase.auth.getClaims();

  const pathname = request.nextUrl.pathname;

  const isAdminRoute =
    pathname.startsWith("/admin") &&
    !pathname.startsWith("/admin/login");

  /*
   * Check maintenance mode.
   *
   * The setting is intentionally public-read so the public website
   * can determine whether maintenance mode is active.
   */
  const { data: siteSettings, error: siteSettingsError } = await supabase
    .from("site_settings")
    .select("maintenance_mode")
    .limit(1)
    .maybeSingle();

  if (siteSettingsError) {
    console.error("Error checking maintenance mode:", siteSettingsError);
  }

  const maintenanceMode = siteSettings?.maintenance_mode === true;

  const isMaintenancePage = pathname === "/maintenance";

  /*
   * Admin users and the admin login page must remain accessible
   * while the public website is in maintenance mode.
   */
  if (
    maintenanceMode &&
    !isAdminRoute &&
    !isMaintenancePage
  ) {
    const maintenanceUrl = request.nextUrl.clone();
    maintenanceUrl.pathname = "/maintenance";
    maintenanceUrl.search = "";

    return NextResponse.redirect(maintenanceUrl);
  }

  /*
   * Protect authenticated admin pages.
   */
  if (isAdminRoute && !data?.claims) {
    const loginUrl = request.nextUrl.clone();

    loginUrl.pathname = "/admin/login";
    loginUrl.searchParams.set(
      "redirectedFrom",
      pathname
    );

    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}