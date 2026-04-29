-- ================================================
-- CRM Capital Finanças — Schema do banco de dados
-- Execute este SQL no Supabase SQL Editor
-- ================================================

-- Contas conectadas (Instagram / LinkedIn)
create table accounts (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('instagram', 'linkedin')),
  username text not null,
  display_name text not null,
  profile_url text,
  avatar_url text,
  created_at timestamptz default now()
);

-- Campanhas / Temas de conteúdo
create table campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  start_date date not null,
  end_date date,
  goal text,
  created_at timestamptz default now()
);

-- Posts publicados
create table posts (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references accounts(id) on delete cascade,
  external_id text,
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
create table post_metrics (
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

-- Métricas diárias da conta (crescimento de seguidores etc.)
create table account_metrics (
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
create table leads (
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

-- ================================================
-- Dados de exemplo para visualização inicial
-- ================================================

insert into accounts (platform, username, display_name) values
  ('instagram', 'capitalfinancas', 'Capital Finanças'),
  ('linkedin', 'capital-financas', 'Capital Finanças');

insert into campaigns (name, description, start_date, goal) values
  ('Educação Financeira', 'Conteúdo educativo sobre finanças pessoais', '2026-01-01', 'Aumentar engajamento orgânico'),
  ('Captação Q1 2026', 'Geração de leads para consultoria', '2026-01-15', 'Captar 50 leads qualificados'),
  ('Lançamento Produto', 'Divulgação do novo produto de crédito', '2026-03-01', 'Awareness e conversão');
