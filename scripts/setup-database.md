# Supabase Database Setup

This guide will help you set up the database schema for your Pași-Pași app.

## Prerequisites

1. You have a Supabase project created
2. You have the Supabase CLI installed (`npm install -g supabase`)
3. Your environment variables are set up correctly

## Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Click **Run** to execute the schema

## Option 2: Using Supabase CLI

1. Initialize Supabase in your project (if not already done):
   ```bash
   supabase init
   ```

2. Link to your remote project:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

3. Push the migration:
   ```bash
   supabase db push
   ```

## What This Schema Creates

### Tables

1. **collections**
   - `id` (UUID, primary key)
   - `user_id` (UUID, foreign key to auth.users)
   - `title` (text, required)
   - `description` (text, optional)
   - `is_public` (boolean, default false)
   - `created_at`, `updated_at` (timestamps)

2. **documents**
   - `id` (UUID, primary key)
   - `collection_id` (UUID, foreign key to collections)
   - `user_id` (UUID, foreign key to auth.users)
   - `title` (text, required)
   - `content` (text, required)
   - `word_count` (integer, auto-calculated)
   - `paragraph_count` (integer, auto-calculated)
   - `is_public` (boolean, default false)
   - `created_at`, `updated_at` (timestamps)

### Security Features

- **Row Level Security (RLS)** enabled on both tables
- Users can only access their own data
- Public content is accessible to everyone
- Automatic user ID assignment on insert

### Automatic Features

- **Timestamps**: `updated_at` automatically updates on record changes
- **Word/Paragraph Counting**: Automatically calculated when documents are saved
- **Indexes**: Optimized for common queries

## Testing the Schema

After setup, you can test by:

1. Creating a collection via the app
2. Adding documents to the collection
3. Toggling public/private visibility
4. Checking that word/paragraph counts are calculated automatically

## Next Steps

1. Run the schema setup
2. Test authentication flow
3. Implement CRUD operations in the app
4. Add public/private toggles to the UI
