require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Helper to encode cursor
function encodeCursor(createdAt, id) {
  const str = `${new Date(createdAt).toISOString()}|${id}`;
  return Buffer.from(str).toString('base64');
}

// Helper to decode cursor
function decodeCursor(cursor) {
  try {
    const str = Buffer.from(cursor, 'base64').toString('ascii');
    const [createdAtStr, idStr] = str.split('|');
    return { createdAt: createdAtStr, id: parseInt(idStr, 10) };
  } catch (e) {
    return null;
  }
}

app.get('/api/products', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;
    const { category, cursor, search, minPrice, maxPrice } = req.query;

    let queryText = 'SELECT id, name, category, price, created_at, updated_at FROM products WHERE 1=1';
    let queryParams = [];
    let paramIndex = 1;

    // Apply filters if provided
    if (category) {
      queryText += ` AND category = $${paramIndex++}`;
      queryParams.push(category);
    }

    if (search) {
      const words = search.trim().split(/\s+/);
      words.forEach(word => {
        if (word) {
          queryText += ` AND name ILIKE $${paramIndex++}`;
          queryParams.push(`%${word}%`);
        }
      });
    }

    if (minPrice) {
      queryText += ` AND price >= $${paramIndex++}`;
      queryParams.push(minPrice);
    }

    if (maxPrice) {
      queryText += ` AND price <= $${paramIndex++}`;
      queryParams.push(maxPrice);
    }

    // Apply cursor filter if provided
    if (cursor) {
      const decoded = decodeCursor(cursor);
      if (!decoded) {
        return res.status(400).json({ error: 'Invalid cursor format' });
      }

      // Keyset pagination condition:
      // We want records strictly older than the cursor's timestamp,
      // OR records with the exact same timestamp but a smaller ID (tie-breaker)
      queryText += ` AND (created_at < $${paramIndex}::timestamptz OR (created_at = $${paramIndex}::timestamptz AND id < $${paramIndex + 1}))`;
      queryParams.push(decoded.createdAt, decoded.id);
      paramIndex += 2;
    }

    // Order by date descending, then ID descending
    queryText += ` ORDER BY created_at DESC, id DESC LIMIT $${paramIndex}`;
    queryParams.push(limit);

    const result = await pool.query(queryText, queryParams);
    const products = result.rows;

    let nextCursor = null;
    if (products.length === limit) {
      const lastItem = products[products.length - 1];
      nextCursor = encodeCursor(lastItem.created_at, lastItem.id);
    }

    res.json({
      data: products,
      nextCursor
    });

  } catch (err) {
    console.error('Database query error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { name, category, price } = req.body;
    if (!name || !category || !price) {
      return res.status(400).json({ error: 'Name, category, and price are required' });
    }

    const queryText = 'INSERT INTO products (name, category, price) VALUES ($1, $2, $3) RETURNING *';
    const result = await pool.query(queryText, [name, category, price]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Database insert error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/products/simulate', async (req, res) => {
  try {
    const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home', 'Toys'];
    const BRANDS = ['Apex', 'Nova', 'Vertex', 'Lumina', 'Zenith', 'Quantum', 'Echo', 'Nimbus', 'Aura', 'Titan'];
    const ADJECTIVES = ['Wireless', 'Smart', 'Ergonomic', 'Portable', 'Compact', 'Premium', 'Pro', 'Ultra'];
    const NOUNS = {
      'Electronics': ['Headphones', 'Speaker', 'Monitor', 'Keyboard', 'Mouse'],
      'Clothing': ['T-Shirt', 'Jacket', 'Jeans', 'Sneakers', 'Sweater'],
      'Books': ['Novel', 'Guide', 'Textbook', 'Cookbook', 'Biography'],
      'Home': ['Lamp', 'Chair', 'Desk', 'Vase', 'Cushion'],
      'Toys': ['Action Figure', 'Puzzle', 'Board Game', 'Plushie', 'Doll']
    };

    const values = [];
    let placeholders = [];
    
    // We simulate them being created RIGHT NOW to put them at the top of the list.
    const now = new Date().toISOString();

    for (let i = 0; i < 50; i++) {
      const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
      const brand = BRANDS[Math.floor(Math.random() * BRANDS.length)];
      const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
      const noun = NOUNS[category][Math.floor(Math.random() * NOUNS[category].length)];
      const name = `${brand} ${adjective} ${noun}`;
      const price = (Math.random() * 495 + 5).toFixed(2);
      
      values.push(name, category, price, now, now);
      
      const offset = i * 5;
      placeholders.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5})`);
    }

    const query = `
      INSERT INTO products (name, category, price, created_at, updated_at)
      VALUES ${placeholders.join(', ')}
    `;

    await pool.query(query, values);
    res.status(201).json({ message: "50 products added successfully" });
  } catch (err) {
    console.error('Simulation insert error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
