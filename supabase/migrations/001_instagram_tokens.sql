-- ================================================
-- Migration 001: Tabela de tokens do Instagram
-- Execute este SQL no Supabase SQL Editor
-- ================================================

-- Tokens de acesso do Instagram por conta
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

-- Unique constraint em posts.external_id para upsert eficiente
alter table posts
  add constraint posts_external_id_unique unique (external_id);

-- Unique constraint em accounts para upsert no OAuth callback
alter table accounts
  add constraint accounts_platform_username_unique unique (platform, username);

-- Coluna last_sync_at na tabela accounts
alter table accounts
  add column if not exists last_sync_at timestamptz;
