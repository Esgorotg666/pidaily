# PiDaily

Full daily utility app for Pi Network Pioneers with multi-device sync via Supabase.

## Features
- Pi Authentication (Pi Browser)
- Notes (free 5 / premium 50) — synced
- Calculator
- Countdown Timer
- Daily Check-in streak — synced
- Tip Jar
- Premium Unlock (1 π) — synced

## Supabase Setup (one time)

1. Create a project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run:

```sql
create table profiles (
  pi_uid text primary key,
  premium boolean default false,
  streak int default 0,
  last_checkin text,
  created_at timestamptz default now()
);

create table notes (
  id bigint generated always as identity primary key,
  pi_uid text not null,
  text text not null,
  created_at timestamptz default now()
);

-- Simple open policies for the anon key (fine for early testing)
alter table profiles enable row level security;
alter table notes enable row level security;

create policy "Allow all on profiles" on profiles for all using (true) with check (true);
create policy "Allow all on notes" on notes for all using (true) with check (true);
```

3. In Project Settings → API, copy:
   - Project URL
   - anon public key

## Deploy

1. Import this repo into Vercel
2. Add these environment variables in Vercel:
   - `PI_API_KEY` = your Pi server API key
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
3. Deploy
4. Register the Vercel URL in Pi Developer Portal
5. Open inside Pi Browser

## Sandbox
`app/page.js` currently has `sandbox: true`. Set to `false` for Mainnet.

If Supabase env vars are missing, the app falls back to localStorage.
