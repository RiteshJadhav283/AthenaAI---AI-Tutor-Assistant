-- Create enum for badge types
create type badge_type as enum ('chapter', 'streak', 'test', 'doubt');

-- Create user_badges table to store earned badges
create table public.user_badges (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    badge_id text not null,
    awarded_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, badge_id)
);

-- Create user_streaks table to track daily login streaks
create table public.user_streaks (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    current_streak integer default 0,
    longest_streak integer default 0,
    last_activity_date date not null,
    unique(user_id)
);

-- Create user_progress table to track chapter and test completion
create table public.user_progress (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    chapters_completed integer default 0,
    tests_completed integer default 0,
    tests_perfect_score integer default 0,
    consecutive_above_90 integer default 0,
    unique(user_id)
);

-- Create user_doubts table to track doubt activity
create table public.user_doubts (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    doubts_asked integer default 0,
    doubts_resolved integer default 0,
    unique(user_id)
);

-- Create chapter_completion table to track specific chapters completed
create table public.chapter_completion (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    chapter_id text not null,
    completed_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, chapter_id)
);

-- Create test_results table to track test scores
create table public.test_results (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    test_id text not null,
    score numeric not null check (score >= 0 and score <= 100),
    completed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.user_badges enable row level security;
alter table public.user_streaks enable row level security;
alter table public.user_progress enable row level security;
alter table public.user_doubts enable row level security;
alter table public.chapter_completion enable row level security;
alter table public.test_results enable row level security;

-- Create RLS policies for user_badges
create policy "Users can view their own badges"
    on public.user_badges for select
    using (auth.uid() = user_id);

create policy "Application can insert badges"
    on public.user_badges for insert
    with check (auth.uid() = user_id);

-- Create RLS policies for user_streaks
create policy "Users can view their own streaks"
    on public.user_streaks for select
    using (auth.uid() = user_id);

create policy "Users can update their own streaks"
    on public.user_streaks for update
    using (auth.uid() = user_id);

create policy "Users can insert their own streaks"
    on public.user_streaks for insert
    with check (auth.uid() = user_id);

-- Create RLS policies for user_progress
create policy "Users can view their own progress"
    on public.user_progress for select
    using (auth.uid() = user_id);

create policy "Users can update their own progress"
    on public.user_progress for update
    using (auth.uid() = user_id);

create policy "Users can insert their own progress"
    on public.user_progress for insert
    with check (auth.uid() = user_id);

-- Create RLS policies for user_doubts
create policy "Users can view their own doubts stats"
    on public.user_doubts for select
    using (auth.uid() = user_id);

create policy "Users can update their own doubts stats"
    on public.user_doubts for update
    using (auth.uid() = user_id);

create policy "Users can insert their own doubts stats"
    on public.user_doubts for insert
    with check (auth.uid() = user_id);

-- Create RLS policies for chapter_completion
create policy "Users can view their own chapter completion"
    on public.chapter_completion for select
    using (auth.uid() = user_id);

create policy "Users can insert their own chapter completion"
    on public.chapter_completion for insert
    with check (auth.uid() = user_id);

-- Create RLS policies for test_results
create policy "Users can view their own test results"
    on public.test_results for select
    using (auth.uid() = user_id);

create policy "Users can insert their own test results"
    on public.test_results for insert
    with check (auth.uid() = user_id);

-- Create functions to help with badge awarding

-- Function to update streak
create or replace function public.update_user_streak(user_uuid uuid)
returns void as $$
declare
    last_date date;
    curr_streak int;
begin
    -- Get the user's last activity date and current streak
    select last_activity_date, current_streak 
    into last_date, curr_streak
    from public.user_streaks 
    where user_id = user_uuid;
    
    -- If no record exists, create one
    if last_date is null then
        insert into public.user_streaks (user_id, current_streak, longest_streak, last_activity_date)
        values (user_uuid, 1, 1, current_date);
        return;
    end if;
    
    -- If last activity was yesterday, increment streak
    if last_date = current_date - interval '1 day' then
        update public.user_streaks
        set 
            current_streak = current_streak + 1,
            longest_streak = greatest(longest_streak, current_streak + 1),
            last_activity_date = current_date
        where user_id = user_uuid;
    -- If last activity was today, do nothing
    elsif last_date = current_date then
        return;
    -- If streak is broken, reset it
    else
        update public.user_streaks
        set 
            current_streak = 1,
            last_activity_date = current_date
        where user_id = user_uuid;
    end if;
end;
$$ language plpgsql security definer; 