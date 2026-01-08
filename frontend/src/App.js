import React, { useState, useEffect } from 'react';
import './App.css';
import ProductList from './components/ProductList';

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      // Use relative path - Nginx proxy handles routing to backend
      const response = await fetch('/api/products');
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(`Failed to load products: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>📦 Product Management</h1>
        <p>Microservices-based Product Catalog</p>
      </header>

      <main className="app-main">
        {loading && <div className="loading">Loading products...</div>}
        {error && <div className="error">{error}</div>}
        {!loading && !error && <ProductList products={products} />}
      </main>

      <footer className="app-footer">
        <p>Product Management App | Multi-Container Architecture</p>
      </footer>
    </div>
  );
}

export default App;
