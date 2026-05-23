-- Run this SQL in your Supabase Dashboard -> SQL Editor to fix the backups feature

CREATE TABLE IF NOT EXISTS product_backups (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    product_count INTEGER NOT NULL,
    products_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable public access so the dashboard can read/write backups
ALTER TABLE product_backups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON product_backups FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON product_backups FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable delete access for all users" ON product_backups FOR DELETE USING (true);
