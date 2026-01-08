-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url VARCHAR(512),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample products with image URLs
INSERT INTO products (name, description, price, image_url) VALUES
  ('Laptop', 'High-performance laptop with 16GB RAM and 512GB SSD', 999.99, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop'),
  ('Wireless Mouse', 'Ergonomic wireless mouse with 2.4GHz connectivity', 29.99, 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=400&fit=crop'),
  ('USB-C Hub', '7-in-1 USB-C hub with multiple ports and fast charging', 49.99, 'https://696032b7ffe0774d84645ffd.imgix.net/USB-C.jpg'),
  ('Mechanical Keyboard', 'RGB mechanical keyboard with hot-swap switches', 129.99, 'https://696032b7ffe0774d84645ffd.imgix.net/mechkeyboard.avif'),
  ('Monitor Stand', 'Adjustable monitor stand with storage drawer', 39.99, 'https://696032b7ffe0774d84645ffd.imgix.net/monitorstand.webp'),
  ('Desk Lamp', 'LED desk lamp with adjustable brightness and color temperature', 59.99, 'https://696032b7ffe0774d84645ffd.imgix.net/desklamp.jfif'),
  ('External SSD', '1TB portable external SSD with fast read/write speeds', 89.99, 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&h=400&fit=crop'),
  ('Webcam', '4K webcam with built-in microphone and auto-focus', 79.99, 'https://696032b7ffe0774d84645ffd.imgix.net/webcam.jpg');

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
