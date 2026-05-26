import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toggleWishlist } from '@store/wishlistSlice';
import { formatPrice } from '@utils/format';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const wishlist = useSelector((s) => s.wishlist.items);
  const isWishlisted = wishlist.some((w) => w.productId === product.id);
  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];

  return (
    <article className="product-card">
      <Link to={`/product/${product.slug}`} className="product-card__media" aria-label={product.name}>
        {product.brand && <span className="product-card__badge">{product.brand}</span>}
        {primaryImage && <img src={primaryImage.url} alt={primaryImage.alt || product.name} loading="lazy" />}
      </Link>
      <button
        type="button"
        className={`product-card__wishlist ${isWishlisted ? 'is-active' : ''}`}
        onClick={() => dispatch(toggleWishlist(product.id))}
        aria-label="toggle wishlist"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
          {isWishlisted ? 'favorite' : 'favorite_border'}
        </span>
      </button>
      <div className="product-card__body">
        <span className="product-card__brand">{product.productType?.name || ''}</span>
        <Link to={`/product/${product.slug}`} className="product-card__title">
          {product.name}
        </Link>
        <div className="product-card__price">
          <span className="now">{formatPrice(product.price)}</span>
          {product.compareAtPrice && (
            <span className="was">{formatPrice(product.compareAtPrice)}</span>
          )}
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
