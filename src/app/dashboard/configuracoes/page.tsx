import { createClient } from "@/lib/supabase/server";
import { ConfiguracoesClient } from "./client";

export default async function ConfiguracoesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return <ConfiguracoesClient email={user?.email ?? null} userId={user?.id ?? null} />;
}
