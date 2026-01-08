import React from 'react';
import './ProductCard.css';

function ProductCard({ product }) {
  const handleImageLoad = (e) => {
    // Hide the fallback icon when image loads
    const icon = e.target.parentElement.querySelector('.product-icon');
    if (icon) icon.style.display = 'none';
  };

  const handleImageError = (e) => {
    // Hide the failed image and show the fallback icon
    e.target.style.display = 'none';
  };

  return (
    <div className="product-card">
      <div className="product-image">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        ) : null}
        <span className="product-icon">📦</span>
      </div>
      <div className="product-content">
        <h3>{product.name}</h3>
        <p className="description">{product.description}</p>
        <div className="product-footer">
          <span className="price">${product.price.toFixed(2)}</span>
          <span className="product-id">ID: {product.id}</span>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
