import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { syncInstagramAccount } from "@/lib/instagram/sync";
import { refreshLongLivedToken } from "@/lib/instagram/api";

export async function POST() {
  const supabase = createServerClient();

  const { data: tokens, error } = await supabase
    .from("instagram_tokens")
    .select("account_id, access_token, expires_at");

  if (error || !tokens?.length) {
    return NextResponse.json(
      { error: "Nenhuma conta do Instagram conectada" },
      { status: 400 }
    );
  }

  const results = [];

  for (const record of tokens) {
    try {
      let token = record.access_token;

      // Renovar token se expira em menos de 7 dias
      if (record.expires_at) {
        const expiresAt = new Date(record.expires_at).getTime();
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        if (expiresAt - Date.now() < sevenDays) {
          const refreshed = await refreshLongLivedToken(token);
          token = refreshed.access_token;
          await supabase
            .from("instagram_tokens")
            .update({
              access_token: token,
              expires_at: new Date(
                Date.now() + refreshed.expires_in * 1000
              ).toISOString(),
              last_refreshed_at: new Date().toISOString(),
            })
            .eq("account_id", record.account_id);
        }
      }

      const result = await syncInstagramAccount(record.account_id, token);
      results.push({ account_id: record.account_id, ...result });
    } catch (err) {
      results.push({
        account_id: record.account_id,
        success: false,
        error: String(err),
      });
    }
  }

  return NextResponse.json({ results, synced_at: new Date().toISOString() });
}
