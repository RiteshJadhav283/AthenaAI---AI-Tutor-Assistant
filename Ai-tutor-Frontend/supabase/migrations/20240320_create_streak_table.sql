-- Create user_activity table to track daily logins
create table public.user_activity (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    login_date date not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, login_date)
);

-- Create user_streaks table to store current and longest streaks
create table public.user_streaks (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    current_streak integer default 0,
    longest_streak integer default 0,
    last_login_date date,
    unique(user_id)
);

-- Enable RLS
alter table public.user_activity enable row level security;
alter table public.user_streaks enable row level security;

-- Create policies
create policy "Users can view their own activity"
    on public.user_activity for select
    using (auth.uid() = user_id);

create policy "Users can insert their own activity"
    on public.user_activity for insert
    with check (auth.uid() = user_id);

create policy "Users can view their own streaks"
    on public.user_streaks for select
    using (auth.uid() = user_id);

create policy "Users can update their own streaks"
    on public.user_streaks for update
    using (auth.uid() = user_id);

create policy "Users can insert their own streaks"
    on public.user_streaks for insert
    with check (auth.uid() = user_id);

-- Function to calculate streak
create or replace function calculate_streak(user_uuid uuid)
returns void as $$
declare
    last_login date;
    streak_count int;
    max_streak int;
begin
    -- Get the user's last login date and current streak
    select last_login_date, current_streak, longest_streak
    into last_login, streak_count, max_streak
    from public.user_streaks 
    where user_id = user_uuid;

    -- If no streak record exists, create one
    if last_login is null then
        insert into public.user_streaks (user_id, current_streak, longest_streak, last_login_date)
        values (user_uuid, 1, 1, current_date);
        return;
    end if;

    -- If last login was yesterday, increment streak
    if last_login = current_date - interval '1 day' then
        streak_count := streak_count + 1;
        max_streak := greatest(max_streak, streak_count);
        
        update public.user_streaks
        set 
            current_streak = streak_count,
            longest_streak = max_streak,
            last_login_date = current_date
        where user_id = user_uuid;
    
    -- If last login was today, do nothing
    elsif last_login = current_date then
        return;
        
    -- If streak is broken, reset it
    else
        update public.user_streaks
        set 
            current_streak = 1,
            last_login_date = current_date
        where user_id = user_uuid;
    end if;
end;
$$ language plpgsql security definer;

-- Function to record login and update streak
create or replace function record_login(user_uuid uuid)
returns void as $$
begin
    -- Record the login
    insert into public.user_activity (user_id, login_date)
    values (user_uuid, current_date)
    on conflict (user_id, login_date) do nothing;

    -- Calculate streak
    perform calculate_streak(user_uuid);
end;
$$ language plpgsql security definer; 