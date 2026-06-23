CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crucial Indexes for Cursor-Based Pagination
-- These composite indexes allow sub-millisecond query performance
-- by providing a pre-sorted tree structure in memory that the DB can traverse directly.
CREATE INDEX IF NOT EXISTS idx_products_pagination ON products (created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_products_category_pagination ON products (category, created_at DESC, id DESC);
