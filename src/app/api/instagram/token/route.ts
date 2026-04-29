import { NextRequest, NextResponse } from "next/server";
import { getUserProfile, getLongLivedToken } from "@/lib/instagram/api";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { token } = await req.json();

  if (!token?.trim()) {
    return NextResponse.json({ error: "Token inválido" }, { status: 400 });
  }

  try {
    // Tenta trocar por token de longa duração (caso seja curto)
    // Se já for longo, usa direto
    let finalToken = token.trim();
    let expiresAt: string | null = null;

    try {
      const long = await getLongLivedToken(finalToken);
      finalToken = long.access_token;
      expiresAt = new Date(Date.now() + long.expires_in * 1000).toISOString();
    } catch {
      // Token já é de longa duração — usa como está (60 dias padrão)
      expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();
    }

    // Valida o token buscando o perfil
    const profile = await getUserProfile(finalToken);

    const supabase = await createClient();

    // Upsert da conta
    const { data: account, error: accountError } = await supabase
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

    if (accountError || !account) {
      return NextResponse.json(
        { error: "Erro ao salvar conta" },
        { status: 500 }
      );
    }

    // Salva o token
    await supabase.from("instagram_tokens").upsert(
      {
        account_id: account.id,
        instagram_user_id: profile.id,
        access_token: finalToken,
        expires_at: expiresAt,
        last_refreshed_at: new Date().toISOString(),
      },
      { onConflict: "account_id" }
    );

    return NextResponse.json({
      success: true,
      username: profile.username,
      name: profile.name,
    });
  } catch {
    return NextResponse.json(
      { error: "Token inválido ou sem permissão. Verifique e tente novamente." },
      { status: 401 }
    );
  }
}

export async function DELETE() {
  const supabase = await createClient();
  await supabase.from("instagram_tokens").delete().neq("id", "");
  return NextResponse.json({ success: true });
}
