import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { destinoSeguro } from "@/lib/site";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const fd = await request.formData().catch(() => null);
  return NextResponse.redirect(new URL(destinoSeguro(fd?.get("next"), "/"), request.url), { status: 303 });
}
