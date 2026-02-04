-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  currency_preference text default 'INR',
  onboarding_completed boolean default false,
  annual_income numeric default 0,
  monthly_income numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using ( auth.uid() = id );

create policy "Users can update their own profile"
  on public.profiles for update
  using ( auth.uid() = id );

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check ( auth.uid() = id );

-- STATEMENTS (Bank Statement Uploads)
create table public.statements (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  filename text not null,
  file_url text, -- Optional if we store in storage bucket later
  upload_date timestamp with time zone default timezone('utc'::text, now()) not null,
  processed boolean default false,
  transaction_count integer default 0
);

alter table public.statements enable row level security;

create policy "Users can view their own statements"
  on public.statements for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own statements"
  on public.statements for insert
  with check ( auth.uid() = user_id );

-- TRANSACTIONS
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  statement_id uuid references public.statements on delete set null,
  amount numeric not null, -- Positive for income, negative for expense? Or use Type. Let's use Amount + Type.
  -- Actually, let's strictly follow: Amount is magnitude, Type determines sign for math.
  type text check (type in ('income', 'expense')) not null,
  category text not null,
  description text not null,
  date date not null,
  source text check (source in ('manual', 'statement_upload', 'recurring')) default 'manual',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.transactions enable row level security;

create policy "Users can view their own transactions"
  on public.transactions for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own transactions"
  on public.transactions for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own transactions"
  on public.transactions for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own transactions"
  on public.transactions for delete
  using ( auth.uid() = user_id );

-- PORTFOLIOS (Investments)
create table public.investments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  symbol text not null, -- e.g., 'RELIANCE', 'HDFCBANK'
  name text not null,
  type text check (type in ('stock', 'sip', 'mutual_fund', 'crypto')) not null,
  quantity numeric not null default 0,
  avg_buy_price numeric not null default 0,
  current_price numeric, -- To be updated via API/Edge function
  currency text default 'INR',
  last_updated timestamp with time zone default timezone('utc'::text, now())
);

alter table public.investments enable row level security;

create policy "Users can manage their own investments"
  on public.investments for all
  using ( auth.uid() = user_id );

-- STORAGE BUCKETS (If using Supabase Storage for PDFs)
-- insert into storage.buckets (id, name, public) values ('statements', 'statements', false);
-- policy for storage would go here

-- USER CREDIT CARDS
create table public.user_credit_cards (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  bank_name text not null,
  card_model text not null,
  credit_limit numeric default 0,
  features jsonb default '[]'::jsonb, -- Store list of features (e.g. Lounge Access)
  rewards jsonb default '{}'::jsonb, -- Store reward structure
  statement_date integer check (statement_date between 1 and 31),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.user_credit_cards enable row level security;

create policy "Users can manage their own credit cards"
  on public.user_credit_cards for all
  using ( auth.uid() = user_id );
