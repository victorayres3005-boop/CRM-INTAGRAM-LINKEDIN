-- ================================================
-- SETUP COMPLETO — CRM Capital Finanças
-- Execute este arquivo inteiro no Supabase SQL Editor
-- ================================================

-- ── 1. TABELAS PRINCIPAIS ───────────────────────

-- Contas conectadas (Instagram / LinkedIn)
create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('instagram', 'linkedin')),
  username text not null,
  display_name text not null,
  profile_url text,
  avatar_url text,
  last_sync_at timestamptz,
  created_at timestamptz default now()
);

-- Campanhas / Temas de conteúdo
create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  start_date date not null,
  end_date date,
  goal text,
  created_at timestamptz default now()
);

-- Posts publicados
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references accounts(id) on delete cascade,
  external_id text unique,
  platform text not null check (platform in ('instagram', 'linkedin')),
  content_type text not null check (content_type in ('feed', 'reel', 'story', 'carrossel', 'video', 'artigo')),
  caption text,
  url text,
  thumbnail_url text,
  published_at timestamptz not null,
  campaign_id uuid references campaigns(id) on delete set null,
  created_at timestamptz default now()
);

-- Métricas diárias por post
create table if not exists post_metrics (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  date date not null,
  reach integer default 0,
  impressions integer default 0,
  likes integer default 0,
  comments integer default 0,
  shares integer default 0,
  saves integer default 0,
  video_views integer default 0,
  engagement_rate numeric(6,4) default 0,
  created_at timestamptz default now(),
  unique(post_id, date)
);

-- Métricas diárias da conta
create table if not exists account_metrics (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references accounts(id) on delete cascade,
  date date not null,
  followers integer default 0,
  follower_growth integer default 0,
  reach integer default 0,
  impressions integer default 0,
  profile_visits integer default 0,
  created_at timestamptz default now(),
  unique(account_id, date)
);

-- Leads captados
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete set null,
  account_id uuid references accounts(id) on delete set null,
  platform text check (platform in ('instagram', 'linkedin')),
  name text not null,
  email text,
  phone text,
  status text not null default 'novo' check (status in ('novo', 'qualificado', 'cliente', 'perdido')),
  notes text,
  captured_at timestamptz default now(),
  created_at timestamptz default now()
);

-- ── 2. TOKENS DO INSTAGRAM ──────────────────────

create table if not exists instagram_tokens (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references accounts(id) on delete cascade,
  instagram_user_id text not null,
  access_token text not null,
  expires_at timestamptz,
  last_refreshed_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(account_id)
);

-- Constraints para upsert eficiente no OAuth
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'accounts_platform_username_unique'
  ) then
    alter table accounts add constraint accounts_platform_username_unique unique (platform, username);
  end if;
end $$;

-- ── 3. DADOS DE EXEMPLO ─────────────────────────

insert into accounts (platform, username, display_name) values
  ('instagram', 'capitalfinancas', 'Capital Finanças'),
  ('linkedin', 'capital-financas', 'Capital Finanças')
on conflict (platform, username) do nothing;

insert into campaigns (name, description, start_date, goal) values
  ('Educação Financeira', 'Conteúdo educativo sobre finanças pessoais', '2026-01-01', 'Aumentar engajamento orgânico'),
  ('Captação Q1 2026', 'Geração de leads para consultoria', '2026-01-15', 'Captar 50 leads qualificados'),
  ('Lançamento Produto', 'Divulgação do novo produto de crédito', '2026-03-01', 'Awareness e conversão')
on conflict do nothing;

-- Posts
insert into posts (account_id, platform, content_type, caption, published_at, campaign_id)
select a.id, 'instagram', 'reel', '5 erros financeiros que você deve evitar em 2026 💸',
  now() - interval '6 days', c.id
from accounts a, campaigns c
where a.platform = 'instagram' and c.name = 'Educação Financeira'
on conflict (external_id) do nothing;

insert into posts (account_id, platform, content_type, caption, published_at, campaign_id)
select a.id, 'linkedin', 'artigo', 'Como a taxa Selic impacta seu crédito imobiliário',
  now() - interval '8 days', c.id
from accounts a, campaigns c
where a.platform = 'linkedin' and c.name = 'Captação Q1 2026'
on conflict (external_id) do nothing;

insert into posts (account_id, platform, content_type, caption, published_at, campaign_id)
select a.id, 'instagram', 'carrossel', 'Guia completo: como organizar suas finanças em 3 passos',
  now() - interval '11 days', c.id
from accounts a, campaigns c
where a.platform = 'instagram' and c.name = 'Educação Financeira'
on conflict (external_id) do nothing;

insert into posts (account_id, platform, content_type, caption, published_at, campaign_id)
select a.id, 'instagram', 'story', 'Enquete: você já tem reserva de emergência?',
  now() - interval '12 days', c.id
from accounts a, campaigns c
where a.platform = 'instagram' and c.name = 'Educação Financeira'
on conflict (external_id) do nothing;

insert into posts (account_id, platform, content_type, caption, published_at, campaign_id)
select a.id, 'linkedin', 'video', 'Conheça a solução de crédito da Capital Finanças',
  now() - interval '16 days', c.id
from accounts a, campaigns c
where a.platform = 'linkedin' and c.name = 'Lançamento Produto'
on conflict (external_id) do nothing;

insert into posts (account_id, platform, content_type, caption, published_at, campaign_id)
select a.id, 'instagram', 'feed', 'Capital Finanças: mais de 10 anos facilitando o crédito no Brasil',
  now() - interval '18 days', c.id
from accounts a, campaigns c
where a.platform = 'instagram' and c.name = 'Lançamento Produto'
on conflict (external_id) do nothing;

-- Métricas dos posts
insert into post_metrics (post_id, date, reach, impressions, likes, comments, shares, saves, video_views, engagement_rate)
select p.id, current_date - 1, 18400, 24100, 920, 87, 140, 340, 42000, 6.8
from posts p where p.caption like '5 erros financeiros%'
on conflict (post_id, date) do nothing;

insert into post_metrics (post_id, date, reach, impressions, likes, comments, shares, saves, video_views, engagement_rate)
select p.id, current_date - 3, 7200, 9800, 310, 54, 80, 0, 9300, 5.1
from posts p where p.caption like 'Como a taxa Selic%'
on conflict (post_id, date) do nothing;

insert into post_metrics (post_id, date, reach, impressions, likes, comments, shares, saves, video_views, engagement_rate)
select p.id, current_date - 6, 12700, 16500, 680, 45, 110, 510, 0, 5.8
from posts p where p.caption like 'Guia completo%'
on conflict (post_id, date) do nothing;

insert into post_metrics (post_id, date, reach, impressions, likes, comments, shares, saves, video_views, engagement_rate)
select p.id, current_date - 7, 5400, 5900, 0, 0, 0, 0, 0, 4.2
from posts p where p.caption like 'Enquete%'
on conflict (post_id, date) do nothing;

insert into post_metrics (post_id, date, reach, impressions, likes, comments, shares, saves, video_views, engagement_rate)
select p.id, current_date - 11, 9300, 13200, 420, 38, 65, 0, 11400, 4.9
from posts p where p.caption like 'Conheça a solução%'
on conflict (post_id, date) do nothing;

insert into post_metrics (post_id, date, reach, impressions, likes, comments, shares, saves, video_views, engagement_rate)
select p.id, current_date - 13, 6400, 8100, 280, 22, 40, 95, 0, 3.9
from posts p where p.caption like 'Capital Finanças: mais de%'
on conflict (post_id, date) do nothing;

-- Métricas da conta — Instagram (6 semanas)
insert into account_metrics (account_id, date, followers, follower_growth, reach, impressions, profile_visits)
select a.id, current_date - 35, 12400, 180, 28400, 41000, 820 from accounts a where a.platform = 'instagram'
on conflict (account_id, date) do nothing;

insert into account_metrics (account_id, date, followers, follower_growth, reach, impressions, profile_visits)
select a.id, current_date - 28, 12850, 450, 31200, 44500, 940 from accounts a where a.platform = 'instagram'
on conflict (account_id, date) do nothing;

insert into account_metrics (account_id, date, followers, follower_growth, reach, impressions, profile_visits)
select a.id, current_date - 21, 13100, 250, 29800, 43100, 880 from accounts a where a.platform = 'instagram'
on conflict (account_id, date) do nothing;

insert into account_metrics (account_id, date, followers, follower_growth, reach, impressions, profile_visits)
select a.id, current_date - 14, 13600, 500, 36500, 51200, 1100 from accounts a where a.platform = 'instagram'
on conflict (account_id, date) do nothing;

insert into account_metrics (account_id, date, followers, follower_growth, reach, impressions, profile_visits)
select a.id, current_date - 7, 14200, 600, 41200, 57800, 1280 from accounts a where a.platform = 'instagram'
on conflict (account_id, date) do nothing;

insert into account_metrics (account_id, date, followers, follower_growth, reach, impressions, profile_visits)
select a.id, current_date, 14900, 700, 42300, 59100, 1340 from accounts a where a.platform = 'instagram'
on conflict (account_id, date) do nothing;

-- Métricas da conta — LinkedIn (6 semanas)
insert into account_metrics (account_id, date, followers, follower_growth, reach, impressions, profile_visits)
select a.id, current_date - 35, 3200, 90, 11200, 15800, 340 from accounts a where a.platform = 'linkedin'
on conflict (account_id, date) do nothing;

insert into account_metrics (account_id, date, followers, follower_growth, reach, impressions, profile_visits)
select a.id, current_date - 28, 3380, 180, 12800, 17400, 390 from accounts a where a.platform = 'linkedin'
on conflict (account_id, date) do nothing;

insert into account_metrics (account_id, date, followers, follower_growth, reach, impressions, profile_visits)
select a.id, current_date - 21, 3510, 130, 13100, 18100, 410 from accounts a where a.platform = 'linkedin'
on conflict (account_id, date) do nothing;

insert into account_metrics (account_id, date, followers, follower_growth, reach, impressions, profile_visits)
select a.id, current_date - 14, 3720, 210, 14900, 20300, 470 from accounts a where a.platform = 'linkedin'
on conflict (account_id, date) do nothing;

insert into account_metrics (account_id, date, followers, follower_growth, reach, impressions, profile_visits)
select a.id, current_date - 7, 3940, 220, 16300, 22100, 510 from accounts a where a.platform = 'linkedin'
on conflict (account_id, date) do nothing;

insert into account_metrics (account_id, date, followers, follower_growth, reach, impressions, profile_visits)
select a.id, current_date, 4100, 160, 17800, 23900, 540 from accounts a where a.platform = 'linkedin'
on conflict (account_id, date) do nothing;

-- Leads
insert into leads (post_id, account_id, platform, name, email, phone, status, captured_at)
select p.id, a.id, 'instagram', 'Ana Carvalho', 'ana@email.com', '(11) 98765-4321', 'qualificado', now() - interval '6 days'
from posts p, accounts a where p.caption like '5 erros financeiros%' and a.platform = 'instagram';

insert into leads (post_id, account_id, platform, name, email, phone, status, captured_at)
select p.id, a.id, 'linkedin', 'Rafael Moura', 'rafael@empresa.com', '(21) 91234-5678', 'cliente', now() - interval '8 days'
from posts p, accounts a where p.caption like 'Como a taxa Selic%' and a.platform = 'linkedin';

insert into leads (post_id, account_id, platform, name, email, phone, status, captured_at)
select p.id, a.id, 'instagram', 'Juliana Pires', 'juliana@email.com', '(31) 99876-5432', 'novo', now() - interval '10 days'
from posts p, accounts a where p.caption like 'Guia completo%' and a.platform = 'instagram';

insert into leads (post_id, account_id, platform, name, email, phone, status, captured_at)
select p.id, a.id, 'linkedin', 'Carlos Neto', 'carlos@empresa.com', '(41) 98888-1111', 'cliente', now() - interval '15 days'
from posts p, accounts a where p.caption like 'Conheça a solução%' and a.platform = 'linkedin';

insert into leads (post_id, account_id, platform, name, email, phone, status, captured_at)
select p.id, a.id, 'instagram', 'Fernanda Lima', 'fernanda@email.com', '(51) 97777-2222', 'perdido', now() - interval '12 days'
from posts p, accounts a where p.caption like '5 erros financeiros%' and a.platform = 'instagram';

insert into leads (post_id, account_id, platform, name, email, phone, status, captured_at)
select p.id, a.id, 'linkedin', 'Marcelo Santos', 'marcelo@corp.com', '(11) 96666-3333', 'qualificado', now() - interval '9 days'
from posts p, accounts a where p.caption like 'Como a taxa Selic%' and a.platform = 'linkedin';

insert into leads (post_id, account_id, platform, name, email, phone, status, captured_at)
select p.id, a.id, 'instagram', 'Bruna Costa', 'bruna@email.com', '(21) 95555-4444', 'novo', now() - interval '3 days'
from posts p, accounts a where p.caption like '5 erros financeiros%' and a.platform = 'instagram';

-- ── FIM DO SETUP ────────────────────────────────
