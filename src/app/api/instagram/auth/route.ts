import { getOAuthUrl } from "@/lib/instagram/api";
import { NextResponse } from "next/server";

export async function GET() {
  const url = getOAuthUrl();
  return NextResponse.redirect(url);
}
