-- ================================================
-- Seed de dados de exemplo — Capital Finanças
-- Execute DEPOIS do schema.sql
-- ================================================

-- Posts
insert into posts (account_id, platform, content_type, caption, published_at, campaign_id)
select
  a.id,
  'instagram',
  'reel',
  '5 erros financeiros que você deve evitar em 2026 💸',
  now() - interval '6 days',
  c.id
from accounts a, campaigns c
where a.platform = 'instagram' and c.name = 'Educação Financeira';

insert into posts (account_id, platform, content_type, caption, published_at, campaign_id)
select
  a.id,
  'linkedin',
  'artigo',
  'Como a taxa Selic impacta seu crédito imobiliário',
  now() - interval '8 days',
  c.id
from accounts a, campaigns c
where a.platform = 'linkedin' and c.name = 'Captação Q1 2026';

insert into posts (account_id, platform, content_type, caption, published_at, campaign_id)
select
  a.id,
  'instagram',
  'carrossel',
  'Guia completo: como organizar suas finanças em 3 passos',
  now() - interval '11 days',
  c.id
from accounts a, campaigns c
where a.platform = 'instagram' and c.name = 'Educação Financeira';

insert into posts (account_id, platform, content_type, caption, published_at, campaign_id)
select
  a.id,
  'instagram',
  'story',
  'Enquete: você já tem reserva de emergência?',
  now() - interval '12 days',
  c.id
from accounts a, campaigns c
where a.platform = 'instagram' and c.name = 'Educação Financeira';

insert into posts (account_id, platform, content_type, caption, published_at, campaign_id)
select
  a.id,
  'linkedin',
  'video',
  'Conheça a solução de crédito da Capital Finanças',
  now() - interval '16 days',
  c.id
from accounts a, campaigns c
where a.platform = 'linkedin' and c.name = 'Lançamento Produto';

insert into posts (account_id, platform, content_type, caption, published_at, campaign_id)
select
  a.id,
  'instagram',
  'feed',
  'Capital Finanças: mais de 10 anos facilitando o crédito no Brasil',
  now() - interval '18 days',
  c.id
from accounts a, campaigns c
where a.platform = 'instagram' and c.name = 'Lançamento Produto';

-- Métricas dos posts
insert into post_metrics (post_id, date, reach, impressions, likes, comments, shares, saves, video_views, engagement_rate)
select p.id, current_date - interval '1 day', 18400, 24100, 920, 87, 140, 340, 42000, 6.8
from posts p where p.caption like '5 erros financeiros%';

insert into post_metrics (post_id, date, reach, impressions, likes, comments, shares, saves, video_views, engagement_rate)
select p.id, current_date - interval '3 days', 7200, 9800, 310, 54, 80, 0, 9300, 5.1
from posts p where p.caption like 'Como a taxa Selic%';

insert into post_metrics (post_id, date, reach, impressions, likes, comments, shares, saves, video_views, engagement_rate)
select p.id, current_date - interval '6 days', 12700, 16500, 680, 45, 110, 510, 0, 5.8
from posts p where p.caption like 'Guia completo%';

insert into post_metrics (post_id, date, reach, impressions, likes, comments, shares, saves, video_views, engagement_rate)
select p.id, current_date - interval '7 days', 5400, 5900, 0, 0, 0, 0, 0, 4.2
from posts p where p.caption like 'Enquete%';

insert into post_metrics (post_id, date, reach, impressions, likes, comments, shares, saves, video_views, engagement_rate)
select p.id, current_date - interval '11 days', 9300, 13200, 420, 38, 65, 0, 11400, 4.9
from posts p where p.caption like 'Conheça a solução%';

insert into post_metrics (post_id, date, reach, impressions, likes, comments, shares, saves, video_views, engagement_rate)
select p.id, current_date - interval '13 days', 6400, 8100, 280, 22, 40, 95, 0, 3.9
from posts p where p.caption like 'Capital Finanças: mais de%';

-- Métricas da conta — Instagram (6 semanas)
insert into account_metrics (account_id, date, followers, follower_growth, reach, impressions, profile_visits)
select a.id, current_date - interval '35 days', 12400, 180, 28400, 41000, 820
from accounts a where a.platform = 'instagram';

insert into account_metrics (account_id, date, followers, follower_growth, reach, impressions, profile_visits)
select a.id, current_date - interval '28 days', 12850, 450, 31200, 44500, 940
from accounts a where a.platform = 'instagram';

insert into account_metrics (account_id, date, followers, follower_growth, reach, impressions, profile_visits)
select a.id, current_date - interval '21 days', 13100, 250, 29800, 43100, 880
from accounts a where a.platform = 'instagram';

insert into account_metrics (account_id, date, followers, follower_growth, reach, impressions, profile_visits)
select a.id, current_date - interval '14 days', 13600, 500, 36500, 51200, 1100
from accounts a where a.platform = 'instagram';

insert into account_metrics (account_id, date, followers, follower_growth, reach, impressions, profile_visits)
select a.id, current_date - interval '7 days', 14200, 600, 41200, 57800, 1280
from accounts a where a.platform = 'instagram';

insert into account_metrics (account_id, date, followers, follower_growth, reach, impressions, profile_visits)
select a.id, current_date, 14900, 700, 42300, 59100, 1340
from accounts a where a.platform = 'instagram';

-- Métricas da conta — LinkedIn (6 semanas)
insert into account_metrics (account_id, date, followers, follower_growth, reach, impressions, profile_visits)
select a.id, current_date - interval '35 days', 3200, 90, 11200, 15800, 340
from accounts a where a.platform = 'linkedin';

insert into account_metrics (account_id, date, followers, follower_growth, reach, impressions, profile_visits)
select a.id, current_date - interval '28 days', 3380, 180, 12800, 17400, 390
from accounts a where a.platform = 'linkedin';

insert into account_metrics (account_id, date, followers, follower_growth, reach, impressions, profile_visits)
select a.id, current_date - interval '21 days', 3510, 130, 13100, 18100, 410
from accounts a where a.platform = 'linkedin';

insert into account_metrics (account_id, date, followers, follower_growth, reach, impressions, profile_visits)
select a.id, current_date - interval '14 days', 3720, 210, 14900, 20300, 470
from accounts a where a.platform = 'linkedin';

insert into account_metrics (account_id, date, followers, follower_growth, reach, impressions, profile_visits)
select a.id, current_date - interval '7 days', 3940, 220, 16300, 22100, 510
from accounts a where a.platform = 'linkedin';

insert into account_metrics (account_id, date, followers, follower_growth, reach, impressions, profile_visits)
select a.id, current_date, 4100, 160, 17800, 23900, 540
from accounts a where a.platform = 'linkedin';

-- Leads
insert into leads (post_id, account_id, platform, name, email, phone, status, captured_at)
select
  p.id, a.id, 'instagram', 'Ana Carvalho', 'ana@email.com', '(11) 98765-4321', 'qualificado', now() - interval '6 days'
from posts p, accounts a
where p.caption like '5 erros financeiros%' and a.platform = 'instagram';

insert into leads (post_id, account_id, platform, name, email, phone, status, captured_at)
select
  p.id, a.id, 'linkedin', 'Rafael Moura', 'rafael@empresa.com', '(21) 91234-5678', 'cliente', now() - interval '8 days'
from posts p, accounts a
where p.caption like 'Como a taxa Selic%' and a.platform = 'linkedin';

insert into leads (post_id, account_id, platform, name, email, phone, status, captured_at)
select
  p.id, a.id, 'instagram', 'Juliana Pires', 'juliana@email.com', '(31) 99876-5432', 'novo', now() - interval '10 days'
from posts p, accounts a
where p.caption like 'Guia completo%' and a.platform = 'instagram';

insert into leads (post_id, account_id, platform, name, email, phone, status, captured_at)
select
  p.id, a.id, 'linkedin', 'Carlos Neto', 'carlos@empresa.com', '(41) 98888-1111', 'cliente', now() - interval '15 days'
from posts p, accounts a
where p.caption like 'Conheça a solução%' and a.platform = 'linkedin';

insert into leads (post_id, account_id, platform, name, email, phone, status, captured_at)
select
  p.id, a.id, 'instagram', 'Fernanda Lima', 'fernanda@email.com', '(51) 97777-2222', 'perdido', now() - interval '12 days'
from posts p, accounts a
where p.caption like '5 erros financeiros%' and a.platform = 'instagram';

insert into leads (post_id, account_id, platform, name, email, phone, status, captured_at)
select
  p.id, a.id, 'linkedin', 'Marcelo Santos', 'marcelo@corp.com', '(11) 96666-3333', 'qualificado', now() - interval '9 days'
from posts p, accounts a
where p.caption like 'Como a taxa Selic%' and a.platform = 'linkedin';

insert into leads (post_id, account_id, platform, name, email, phone, status, captured_at)
select
  p.id, a.id, 'instagram', 'Bruna Costa', 'bruna@email.com', '(21) 95555-4444', 'novo', now() - interval '3 days'
from posts p, accounts a
where p.caption like '5 erros financeiros%' and a.platform = 'instagram';
