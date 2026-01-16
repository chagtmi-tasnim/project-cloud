import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';

function ProductCard({ product }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="product-card">
        <div className={`product-image ${imgLoaded && !imgError ? 'has-image' : ''}`}>
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
              loading="lazy"
            />
          ) : null}
          {!imgLoaded && !imgError && <span className="product-icon">📦</span>}
          {imgError && <span className="product-icon">📦</span>}
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
    </Link>
  );
}

export default ProductCard;
