-- Create doubts_history table to store chat conversations
create table public.doubts_history (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    title text not null,
    subject text not null,
    preview text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create doubts_messages table to store individual messages in a conversation
create table public.doubts_messages (
    id uuid default uuid_generate_v4() primary key,
    doubt_id uuid references public.doubts_history(id) on delete cascade,
    message_type text not null check (message_type in ('user', 'ai')),
    message_content text not null,
    image_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.doubts_history enable row level security;
alter table public.doubts_messages enable row level security;

-- Create RLS policies for doubts_history
create policy "Users can view their own doubts history"
    on public.doubts_history for select
    using (auth.uid() = user_id);

create policy "Users can insert their own doubts history"
    on public.doubts_history for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own doubts history"
    on public.doubts_history for update
    using (auth.uid() = user_id);

create policy "Users can delete their own doubts history"
    on public.doubts_history for delete
    using (auth.uid() = user_id);

-- Create RLS policies for doubts_messages
create policy "Users can view messages from their own doubts"
    on public.doubts_messages for select
    using (
        exists (
            select 1 from public.doubts_history
            where id = doubt_id and user_id = auth.uid()
        )
    );

create policy "Users can insert messages to their own doubts"
    on public.doubts_messages for insert
    with check (
        exists (
            select 1 from public.doubts_history
            where id = doubt_id and user_id = auth.uid()
        )
    );

create policy "Users can update messages from their own doubts"
    on public.doubts_messages for update
    using (
        exists (
            select 1 from public.doubts_history
            where id = doubt_id and user_id = auth.uid()
        )
    );

create policy "Users can delete messages from their own doubts"
    on public.doubts_messages for delete
    using (
        exists (
            select 1 from public.doubts_history
            where id = doubt_id and user_id = auth.uid()
        )
    );

-- Create function to update the updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create trigger to automatically update updated_at
create trigger set_updated_at
before update on public.doubts_history
for each row
execute function update_updated_at_column();

-- Create function to update user_doubts counter when a new doubt is created
create or replace function increment_doubts_asked()
returns trigger as $$
begin
    -- Try to update existing record
    update public.user_doubts
    set doubts_asked = doubts_asked + 1
    where user_id = new.user_id;
    
    -- If no record exists, create one
    if not found then
        insert into public.user_doubts (user_id, doubts_asked, doubts_resolved)
        values (new.user_id, 1, 0);
    end if;
    
    return new;
end;
$$ language plpgsql security definer;

-- Create trigger to automatically increment doubts_asked
create trigger increment_doubts_asked_trigger
after insert on public.doubts_history
for each row
execute function increment_doubts_asked();