require('dotenv').config();
const pool = require('./db');

const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home', 'Toys'];
const BRANDS = ['Apex', 'Nova', 'Vertex', 'Lumina', 'Zenith', 'Quantum', 'Echo', 'Nimbus', 'Aura', 'Titan', 'Aero', 'Nexus', 'Pinnacle', 'Vanguard'];
const ADJECTIVES = ['Wireless', 'Smart', 'Ergonomic', 'Portable', 'Compact', 'Heavy Duty', 'Premium', 'Eco-Friendly', 'Vintage', 'Modern', 'Sleek', 'Minimalist', 'Advanced', 'Digital', 'Classic', 'Pro', 'Ultra'];
const NOUNS = {
  'Electronics': ['Headphones', 'Speaker', 'Monitor', 'Keyboard', 'Mouse', 'Tablet', 'Camera', 'Microphone', 'Laptop', 'Charger', 'Router'],
  'Clothing': ['T-Shirt', 'Jacket', 'Jeans', 'Sneakers', 'Sweater', 'Socks', 'Cap', 'Scarf', 'Shorts', 'Hoodie'],
  'Books': ['Novel', 'Guide', 'Textbook', 'Cookbook', 'Biography', 'Journal', 'Dictionary', 'Magazine', 'Notebook', 'Planner'],
  'Home': ['Lamp', 'Chair', 'Desk', 'Vase', 'Cushion', 'Rug', 'Clock', 'Mirror', 'Bookshelf', 'Curtain', 'Plant Pot'],
  'Toys': ['Action Figure', 'Puzzle', 'Board Game', 'Plushie', 'Building Blocks', 'RC Car', 'Doll', 'Yo-Yo', 'Kite']
};

const TOTAL_RECORDS = 200000;
const BATCH_SIZE = 5000;

function generateBatch(baseTime, size) {
  const values = [];
  for (let i = 0; i < size; i++) {
    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const brand = BRANDS[Math.floor(Math.random() * BRANDS.length)];
    const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[category][Math.floor(Math.random() * NOUNS[category].length)];
    const name = `${brand} ${adjective} ${noun}`;
    
    const price = (Math.random() * 495 + 5).toFixed(2);
    // Randomize time in the past up to ~70 days
    const offsetMs = Math.floor(Math.random() * 100000 * 60000);
    const createdAt = new Date(baseTime.getTime() - offsetMs).toISOString();
    
    values.push(name, category, price, createdAt, createdAt);
  }
  return values;
}

async function seedDatabase() {
  if (!process.env.DATABASE_URL) {
    console.error("Error: DATABASE_URL is not set in .env file.");
    process.exit(1);
  }

  console.log(`Starting to seed ${TOTAL_RECORDS} records in batches of ${BATCH_SIZE}...`);
  const baseTime = new Date();

  try {
    let insertedCount = 0;
    while (insertedCount < TOTAL_RECORDS) {
      const flatValues = generateBatch(baseTime, BATCH_SIZE);
      
      // Build parameterized query: ($1, $2, $3, $4, $5), ($6, ...), ...
      let placeholders = [];
      for (let i = 0; i < BATCH_SIZE; i++) {
        const offset = i * 5;
        placeholders.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5})`);
      }
      
      const query = `
        INSERT INTO products (name, category, price, created_at, updated_at)
        VALUES ${placeholders.join(', ')}
      `;

      await pool.query(query, flatValues);
      
      insertedCount += BATCH_SIZE;
      console.log(`Inserted ${insertedCount}/${TOTAL_RECORDS}...`);
    }
    console.log("Database seeding completed successfully.");
  } catch (err) {
    console.error("Error seeding database:", err);
  } finally {
    await pool.end();
  }
}

seedDatabase();
