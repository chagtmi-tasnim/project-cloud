import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ProductDetail.css';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    fetchProductDetail();
  }, [id]);

  const fetchProductDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/products/${id}`);
      
      if (!response.ok) {
        throw new Error(`Product not found (${response.status})`);
      }
      
      const data = await response.json();
      setProduct(data);
    } catch (err) {
      console.error('Error fetching product:', err);
      setError(`Failed to load product: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="product-detail">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Back to Products
        </button>
        <div className="loading-detail">Loading product...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-detail">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Back to Products
        </button>
        <div className="error-detail">⚠️ {error}</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Back to Products
        </button>
        <div className="error-detail">Product not found</div>
      </div>
    );
  }

  return (
    <div className="product-detail">
      <button className="back-btn" onClick={() => navigate('/')}>
        ← Back to Products
      </button>

      <div className="detail-container">
        <div className="detail-image-section">
          <div className={`detail-image ${imgLoaded ? 'loaded' : ''}`}>
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgLoaded(false)}
              />
            ) : null}
            {!imgLoaded && <span className="detail-icon">📦</span>}
          </div>
        </div>

        <div className="detail-info-section">
          <h1 className="detail-name">{product.name}</h1>
          
          <div className="detail-meta">
            <span className="product-id">Product ID: {product.id}</span>
          </div>

          <div className="detail-price-section">
            <span className="price-label">Price:</span>
            <span className="detail-price">${product.price ? product.price.toFixed(2) : '0.00'}</span>
          </div>

          <div className="detail-description-section">
            <h3>Description</h3>
            <p className="detail-description">
              {product.description || 'No description available'}
            </p>
          </div>

          <div className="detail-specs">
            <h3>Product Info</h3>
            <div className="spec-row">
              <span className="spec-label">Category:</span>
              <span className="spec-value">Electronics</span>
            </div>
            <div className="spec-row">
              <span className="spec-label">In Stock:</span>
              <span className="spec-value status-available">✓ Available</span>
            </div>
            <div className="spec-row">
              <span className="spec-label">SKU:</span>
              <span className="spec-value">PROD-{String(product.id).padStart(4, '0')}</span>
            </div>
          </div>

          <div className="detail-actions">
            <button className="add-to-cart-btn">🛒 Add to Cart</button>
            <button className="share-btn">📤 Share</button>
          </div>

          <div className="detail-footer">
            <p className="timestamps">
              <small>
                Added: {product.created_at ? new Date(product.created_at).toLocaleDateString() : 'N/A'}
              </small>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
