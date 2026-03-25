-- AI Knowledge OS v4 — PostgreSQL Schema (Supabase)

-- 1. nodes
create table if not exists nodes (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text unique not null,
  layer       text not null,       -- AI Infrastructure | Execution | Agents | Applications
  sub_layer   text,
  description text,
  capabilities text[],
  domains     text[],
  maturity    text,                -- foundation | mainstream | emerging | speculative
  certainty   text,                -- validated | experimental | speculative
  freshness   text,                -- new | trending | stable
  type        text,                -- research | paradigm | system | application
  cost        jsonb,
  created_at  timestamp default now(),
  updated_at  timestamp default now()
);

-- 2. edges
create table if not exists edges (
  id            uuid primary key default gen_random_uuid(),
  from_node     uuid references nodes(id) on delete cascade,
  to_node       uuid references nodes(id) on delete cascade,
  relation_type text not null,     -- depends_on | extends | replaces | uses | related_to
  weight        float default 1.0,
  created_at    timestamp default now()
);

-- 3. tags (Frontier tag system)
create table if not exists tags (
  id         uuid primary key default gen_random_uuid(),
  name       text unique not null,
  category   text,                 -- maturity | certainty | freshness | type
  created_at timestamp default now()
);

-- 4. node_tags
create table if not exists node_tags (
  node_id uuid references nodes(id) on delete cascade,
  tag_id  uuid references tags(id) on delete cascade,
  primary key (node_id, tag_id)
);

-- 5. content
create table if not exists content (
  id           uuid primary key default gen_random_uuid(),
  node_id      uuid references nodes(id) on delete cascade,
  content_type text,               -- concept | guide | playbook | case_study | failure
  title        text,
  body         text,
  source       text,               -- manual | ai_generated | scraped
  created_at   timestamp default now(),
  updated_at   timestamp default now()
);

-- 6. resources
create table if not exists resources (
  id          uuid primary key default gen_random_uuid(),
  name        text,
  type        text,                -- dataset | repo | tool | benchmark
  url         text,
  description text,
  created_at  timestamp default now()
);

-- Indexes
create index if not exists idx_nodes_layer    on nodes(layer);
create index if not exists idx_edges_from     on edges(from_node);
create index if not exists idx_edges_to       on edges(to_node);
create index if not exists idx_content_node   on content(node_id);
