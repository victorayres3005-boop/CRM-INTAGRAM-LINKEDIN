import { NextRequest, NextResponse } from "next/server";
import {
  exchangeCodeForToken,
  getLongLivedToken,
  getUserProfile,
} from "@/lib/instagram/api";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (error || !code) {
    return NextResponse.redirect(
      `${base}/dashboard/configuracoes?error=auth_denied`
    );
  }

  try {
    const { access_token: shortToken, user_id } =
      await exchangeCodeForToken(code);
    const { access_token: longToken, expires_in } =
      await getLongLivedToken(shortToken);
    const profile = await getUserProfile(longToken);

    const supabase = createServerClient();

    // Upsert conta do Instagram
    const { data: account } = await supabase
      .from("accounts")
      .upsert(
        {
          platform: "instagram",
          username: profile.username,
          display_name: profile.name,
          avatar_url: profile.profile_picture_url ?? null,
        },
        { onConflict: "platform,username" }
      )
      .select("id")
      .single();

    if (!account) throw new Error("Falha ao salvar conta");

    const expiresAt = new Date(
      Date.now() + expires_in * 1000
    ).toISOString();

    await supabase.from("instagram_tokens").upsert(
      {
        account_id: account.id,
        instagram_user_id: user_id,
        access_token: longToken,
        expires_at: expiresAt,
        last_refreshed_at: new Date().toISOString(),
      },
      { onConflict: "account_id" }
    );

    return NextResponse.redirect(
      `${base}/dashboard/configuracoes?success=connected`
    );
  } catch (err) {
    console.error("Instagram OAuth erro:", err);
    return NextResponse.redirect(
      `${base}/dashboard/configuracoes?error=auth_failed`
    );
  }
}
