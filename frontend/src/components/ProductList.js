import React from 'react';
import ProductCard from './ProductCard';
import './ProductList.css';

function ProductList({ products }) {
  if (products.length === 0) {
    return <div className="no-products">No products available</div>;
  }

  return (
    <div className="product-list">
      <h2>Available Products</h2>
      <div className="products-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

export default ProductList;
