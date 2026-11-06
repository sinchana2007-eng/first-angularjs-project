-- Bookwise schema. Apply this in the Supabase SQL Editor.
-- WARNING: these anon policies make the library API publicly writable.
-- Use Supabase Auth and replace the anon policies with authenticated/admin policies before production use.

create extension if not exists pgcrypto;

create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(btrim(title)) between 1 and 200),
  author text not null check (char_length(btrim(author)) between 1 and 160),
  isbn text,
  category text,
  publisher text,
  total_copies integer not null default 1 check (total_copies between 1 and 100000),
  available_copies integer not null default 1 check (available_copies >= 0 and available_copies <= total_copies),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists books_isbn_unique
  on public.books (isbn) where isbn is not null and btrim(isbn) <> '';

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 160),
  email text not null,
  phone text,
  created_at timestamptz not null default now(),
  constraint members_email_not_empty check (char_length(btrim(email)) between 3 and 254)
);

create unique index if not exists members_email_unique
  on public.members (lower(email));

create table if not exists public.loans (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete restrict,
  member_id uuid not null references public.members(id) on delete restrict,
  loan_date date not null default current_date,
  due_date date not null,
  returned_at timestamptz,
  created_at timestamptz not null default now(),
  check (due_date >= loan_date)
);

create index if not exists loans_active_due_date_idx
  on public.loans (due_date) where returned_at is null;
create index if not exists loans_book_id_idx on public.loans (book_id);
create index if not exists loans_member_id_idx on public.loans (member_id);

alter table public.books enable row level security;
alter table public.members enable row level security;
alter table public.loans enable row level security;

drop policy if exists "Public can manage books" on public.books;
create policy "Public can manage books" on public.books
  for all to anon using (true) with check (true);

drop policy if exists "Public can manage members" on public.members;
create policy "Public can manage members" on public.members
  for all to anon using (true) with check (true);

drop policy if exists "Public can manage loans" on public.loans;
create policy "Public can manage loans" on public.loans
  for all to anon using (true) with check (true);

grant select, insert, update, delete on public.books, public.members, public.loans to anon;

create or replace function public.checkout_book(
  p_book_id uuid,
  p_member_id uuid,
  p_due_date date
)
returns public.loans
language plpgsql
security invoker
set search_path = public
as $$
declare
  created_loan public.loans;
begin
  if p_due_date < current_date then
    raise exception 'Due date must be today or later.';
  end if;

  update public.books
    set available_copies = available_copies - 1,
        updated_at = now()
    where id = p_book_id and available_copies > 0;

  if not found then
    raise exception 'Book not found or no copies are available.';
  end if;

  insert into public.loans (book_id, member_id, due_date)
    values (p_book_id, p_member_id, p_due_date)
    returning * into created_loan;

  return created_loan;
end;
$$;

create or replace function public.return_book(p_loan_id uuid)
returns public.loans
language plpgsql
security invoker
set search_path = public
as $$
declare
  returned_loan public.loans;
begin
  update public.loans
    set returned_at = now()
    where id = p_loan_id and returned_at is null
    returning * into returned_loan;

  if not found then
    raise exception 'Loan not found or already returned.';
  end if;

  update public.books
    set available_copies = available_copies + 1,
        updated_at = now()
    where id = returned_loan.book_id;

  return returned_loan;
end;
$$;

grant execute on function public.checkout_book(uuid, uuid, date) to anon;
grant execute on function public.return_book(uuid) to anon;
