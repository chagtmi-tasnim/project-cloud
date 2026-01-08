const express = require('express');
const cors = require('cors');
const { Client } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL Client
const client = new Client({
  host: process.env.DB_HOST || 'database',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'productdb'
});

// Connect to database with retry logic
const connectDatabase = async (maxRetries = 10) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await client.connect();
      console.log('✓ Connected to PostgreSQL database');
      return;
    } catch (err) {
      console.log(`Database connection attempt ${i + 1}/${maxRetries} failed. Retrying in 5s...`);
      if (i === maxRetries - 1) {
        console.error('✗ Failed to connect to database:', err.message);
        process.exit(1);
      }
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

// Helper function to normalize product data (convert price string to number)
const normalizeProduct = (product) => ({
  ...product,
  price: parseFloat(product.price)
});

const normalizeProducts = (products) => products.map(normalizeProduct);

// Routes

/**
 * GET /api/products
 * Retrieve all products from the database
 */
app.get('/api/products', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM products ORDER BY id');
    res.json(normalizeProducts(result.rows));
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

/**
 * GET /api/products/:id
 * Retrieve a single product by ID
 */
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await client.query('SELECT * FROM products WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(normalizeProduct(result.rows[0]));
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'Backend API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const startServer = async () => {
  await connectDatabase();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✓ Backend API running on http://0.0.0.0:${PORT}`);
    console.log(`✓ Health check: GET http://localhost:${PORT}/health`);
    console.log(`✓ Products endpoint: GET http://localhost:${PORT}/api/products`);
    console.log(`✓ Product by ID: GET http://localhost:${PORT}/api/products/:id`);
  });
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing database connection...');
  await client.end();
  process.exit(0);
});

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
