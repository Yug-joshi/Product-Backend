require('dotenv').config();
const pool = require('./db');

async function setupIndexes() {
  try {
    console.log("Creating database indexes for fast search and filtering...");

    // 1. Enable pg_trgm for super fast ILIKE text search
    await pool.query('CREATE EXTENSION IF NOT EXISTS pg_trgm;');
    console.log("✅ pg_trgm extension enabled.");

    // 2. Create GIN index on name
    await pool.query('CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING GIN (name gin_trgm_ops);');
    console.log("✅ Fast text search index created on 'name'.");

    // 3. Create Price index
    await pool.query('CREATE INDEX IF NOT EXISTS idx_products_price ON products (price);');
    console.log("✅ Price index created.");

    console.log("All indexes successfully applied! Your database is fully optimized.");
  } catch (err) {
    console.error("Error setting up indexes:", err);
  } finally {
    await pool.end();
  }
}

setupIndexes();
